import React, { useEffect, useMemo, useState } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiCheck, FiX, FiDownload, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useSnackbar } from 'notistack';
import FileUpload from '../../components/FileUpload/FileUpload.jsx';
import { uploadService } from '../../services/uploadService.js';
import {
  prepararDadosParaEnvio,
} from '../../utils/ajuste_calculo_importacao.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLoading } from "../../hooks/useLoading.js";
import PageLayout from '../../Layouts/PageLayout/PageLayout.jsx';
import { 
  buscarRegraValorAdministradora, 
  atualizarRegraValorAdministradora, 
  criarRegraValorAdministradora 
} from '../../services/administradoraService.js';
import { vtService } from '../../services/vtService.js';

import * as S from '../../pages/Client/Importacao/ImportacaoStyles.js';

const MESES = [
  { label: 'Janeiro', value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Maio', value: '05' },
  { label: 'Junho', value: '06' },
  { label: 'Julho', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Setembro', value: '09' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
];

function Modal({ open, title, onClose, children, locked = false, large = false }) {
  if (!open) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalCard $large={large} onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h3>{title}</h3>
          <S.ButtonGhost onClick={onClose} type="button" disabled={locked}>
            <FiX size={18} />
          </S.ButtonGhost>
        </S.ModalHeader>
        <S.ModalBody>{children}</S.ModalBody>
      </S.ModalCard>
    </S.ModalOverlay>
  );
}

// Funções auxiliares (mantidas iguais)
function getNomeColaborador(row) {
  return row?.nome_funcionario || row?.nome_func || row?.colaborador || row?.nome || row?.funcionario || row?.nome_funcionário || '';
}

function getValorRow(row) {
  if (row?.valor_total && typeof row.valor_total !== 'undefined') {
    const valor = typeof row.valor_total === 'string' ? parseFloat(row.valor_total) : row.valor_total;
    if (!isNaN(valor)) return valor;
  }
  if (row?.valor && typeof row.valor !== 'undefined') {
    const valor = typeof row.valor === 'string' ? parseFloat(row.valor) : row.valor;
    if (!isNaN(valor)) return valor;
  }
  if (row?.valor_recarga_bene) {
    const valor = typeof row.valor_recarga_bene === 'string' ? parseFloat(row.valor_recarga_bene) : row.valor_recarga_bene;
    if (!isNaN(valor)) return valor;
  }
  for (const key of ['valorTotal', 'ValorTotal', 'total', 'amount', 'preco']) {
    if (row[key]) {
      const valor = typeof row[key] === 'string' ? parseFloat(row[key]) : row[key];
      if (!isNaN(valor)) return valor;
    }
  }
  return 0;
}

function getCondominio(row) {
  return row?.condominio || row?.nome_condominio || row?.condominio_nome || row?.NomeCondominio || '';
}

function getCpf(row) {
  return String(row?.cpf || row?.cpf_func || row?.cpf_funcionario || row?.CPF || '').trim();
}

function getRowKey(row) {
  const cpf = getCpf(row);
  if (cpf) return `${getCondominio(row)}::${getNomeColaborador(row)}::${cpf}`;
  return `${getCondominio(row)}::${getNomeColaborador(row)}`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDateBR(value) {
  if (!value) return '-';
  const raw = String(value).trim();
  if (!raw) return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }
  return raw;
}

function formatCompetenciaBR(mes, ano) {
  if (!mes && !ano) return '-';
  const mesFormatado = String(mes || '').padStart(2, '0');
  return `${mesFormatado}/${ano || ''}`;
}

function getMovimentacoesBackend(data) {
  return data?.data_to_backend?.movimentacoes_detalhada || data?.movimentacoes_detalhada || data?.movimentacoes || [];
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidCPF(value) {
  const cpf = onlyDigits(value);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(cpf[10]);
}

function getNomeProduto(item) {
  return item?.nome_produto || item?.produto_nome || item?.produto || item?.nome_beneficio || item?.beneficio_nome || item?.beneficio || item?.descricao_produto || item?.descricao || '';
}

function getCodigoProduto(item) {
  return String(item?.codigo_produto || item?.produto_codigo || item?.cod_produto || item?.codigo || '').trim();
}

function getValorProduto(item) {
  return Number(item?.valor_recarga_bene || item?.valor_total || item?.valor || item?.valor_unitario || 0);
}

function getNomeMov(item) {
  return item?.nome_funcionario || item?.nome_func || item?.colaborador || item?.nome || item?.funcionario || item?.nome_funcionário || '';
}

function getCondominioMov(item) {
  return item?.condominio || item?.nome_condominio || item?.condominio_nome || item?.NomeCondominio || '';
}

function getCpfMov(item) {
  return String(item?.cpf || item?.cpf_func || item?.cpf_funcionario || item?.CPF || '').trim();
}

function getQuantidadeDias(row) {
  return Number(row?.quantidade_dias || row?.quantidade || row?.dias || row?.dias_trabalhados || row?.quantidadeDias || 0);
}

function buildBenefitsIndexes(movimentacoes = []) {
  const byCondominioNomeCpf = new Map();
  const byNomeCpf = new Map();
  const byCondominioNome = new Map();

  movimentacoes.forEach((item) => {
    const nome = normalizeText(getNomeMov(item));
    const condominio = normalizeText(getCondominioMov(item));
    const cpf = onlyDigits(getCpfMov(item));

    const beneficio = {
      codigo: getCodigoProduto(item),
      nome: getNomeProduto(item),
      valor: getValorProduto(item),
    };

    if (!beneficio.nome) return;

    const keyCondominioNomeCpf = `${condominio}::${nome}::${cpf}`;
    const keyNomeCpf = `${nome}::${cpf}`;
    const keyCondominioNome = `${condominio}::${nome}`;

    if (cpf) {
      if (!byCondominioNomeCpf.has(keyCondominioNomeCpf)) {
        byCondominioNomeCpf.set(keyCondominioNomeCpf, []);
      }
      byCondominioNomeCpf.get(keyCondominioNomeCpf).push(beneficio);

      if (!byNomeCpf.has(keyNomeCpf)) {
        byNomeCpf.set(keyNomeCpf, []);
      }
      byNomeCpf.get(keyNomeCpf).push(beneficio);
    }

    if (!byCondominioNome.has(keyCondominioNome)) {
      byCondominioNome.set(keyCondominioNome, []);
    }
    byCondominioNome.get(keyCondominioNome).push(beneficio);
  });

  return { byCondominioNomeCpf, byNomeCpf, byCondominioNome };
}

function enrichRowsWithBenefits(rows = [], movimentacoes = []) {
  const indexes = buildBenefitsIndexes(movimentacoes);

  return rows.map((row) => {
    const nome = normalizeText(getNomeColaborador(row));
    const condominio = normalizeText(getCondominio(row));
    const cpf = onlyDigits(getCpf(row));

    const keyCondominioNomeCpf = `${condominio}::${nome}::${cpf}`;
    const keyNomeCpf = `${nome}::${cpf}`;
    const keyCondominioNome = `${condominio}::${nome}`;

    const beneficios =
      (cpf && indexes.byCondominioNomeCpf.get(keyCondominioNomeCpf)) ||
      (cpf && indexes.byNomeCpf.get(keyNomeCpf)) ||
      indexes.byCondominioNome.get(keyCondominioNome) ||
      [];

    return { ...row, beneficios };
  });
}

function getRowValidation(row, regraValor = null, isVT = false) {
  const erros = [];
  const nome = getNomeColaborador(row);
  const condominio = getCondominio(row);
  const cpf = getCpf(row);
  const valor = getValorRow(row);

  if (!normalizeText(nome)) {
    erros.push('Nome do colaborador não informado');
  }
  if (!normalizeText(condominio)) {
    erros.push('Condomínio não informado');
  }
  if (!cpf) {
    erros.push('CPF não informado');
  } else if (!isValidCPF(cpf)) {
    erros.push('CPF inválido');
  }
  if (Number(valor) <= 0) {
    erros.push('Valor inválido');
  }

  let bloqueadoPorValor = false;

  if (!isVT) {
    const limiteAtivo = regraValor?.ativo === true && regraValor?.bloquear_acima_limite !== false && Number(regraValor?.valor_limite) > 0;
    bloqueadoPorValor = limiteAtivo && Number(valor) > Number(regraValor.valor_limite);
    if (bloqueadoPorValor) {
      erros.push(`Valor acima de ${formatCurrency(regraValor.valor_limite)}`);
    }
  }

  return { erros, bloqueadoPorValor, bloqueado: erros.length > 0 };
}

function buildPreviewRowsFromMovimentacoes(movimentacoes = []) {
  const mapa = new Map();

  movimentacoes.forEach((item) => {
    const nome = getNomeColaborador(item);
    const condominio = getCondominio(item);
    const cpf = getCpf(item);
    const key = cpf ? `${condominio}::${nome}::${cpf}` : `${condominio}::${nome}`;
    const valor = getValorRow(item);
    const quantidadeDias = getQuantidadeDias(item);

    if (!mapa.has(key)) {
      mapa.set(key, {
        ...item,
        condominio,
        nome_funcionario: nome,
        cpf_funcionario: cpf,
        valor_total: 0,
        quantidade_dias: 0,
      });
    }

    const atual = mapa.get(key);
    atual.valor_total += Number(valor || 0);
    atual.quantidade_dias += Number(quantidadeDias || 0);
    mapa.set(key, atual);
  });

  return Array.from(mapa.values());
}

function isVTResponse(response) {
  if (!response) return false;
  if (response.dados_validados !== undefined && response.tipo_processamento === 'VT') return true;
  if (response.tipo_processamento === 'VT') return true;
  if (response.summary && response.summary.valor_total_vt !== undefined) return true;
  if (response.summary && response.summary.total_dias_trabalhados !== undefined) return true;
  if (response.vt_validation !== undefined) return true;
  if (response.source === 'vt_upload') return true;
  return false;
}

export default function Importacao() {
  const [data, setData] = useState(null);
  const [validationVersion, setValidationVersion] = useState(0);
  const [filterOnlyErrors, setFilterOnlyErrors] = useState(false);
  const [filterOnlyBlocked, setFilterOnlyBlocked] = useState(false);
  const [errosModalOpen, setErrosModalOpen] = useState(false);

  const { loading, startLoading, stopLoading, updateProgress } = useLoading();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [lote, setLote] = useState({
    id: null,
    arquivo: null,
    tipo: null,
    rows: [],
    excluidosPorColab: new Set(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsBenefits, setDetailsBenefits] = useState([]);
  const [detailsRowKey, setDetailsRowKey] = useState(null);
  const [editingBenefitIndex, setEditingBenefitIndex] = useState(null);
  const [editBenefitValue, setEditBenefitValue] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [enviandoLote, setEnviandoLote] = useState(false);
  const [regraValor, setRegraValor] = useState(null);
  const [loadingRegraValor, setLoadingRegraValor] = useState(false);
  const [modalRegraValorOpen, setModalRegraValorOpen] = useState(false);
  const [salvandoRegraValor, setSalvandoRegraValor] = useState(false);
  const [formRegraValor, setFormRegraValor] = useState({
    ativo: true,
    valor_limite: '',
  });

  const [reviewData, setReviewData] = useState({
    totalFuncionarios: 0,
    totalMovimentacoes: 0,
    valorTotalBeneficios: 0,
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: '',
    vencimento: '',
  });

  const [formEnvio, setFormEnvio] = useState({
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: String(new Date().getFullYear()),
    vencimento: '',
    recebimentoBeneficio: '',
  });

  const carregarRegraValor = async () => {
    const administradoraId = user?.administradora_id;
    if (!administradoraId) return;

    try {
      setLoadingRegraValor(true);
      const response = await buscarRegraValorAdministradora(administradoraId);
      const regra = Array.isArray(response) ? response[0] || null : response || null;
      setRegraValor(regra);
      setFormRegraValor({
        ativo: regra?.ativo ?? true,
        valor_limite: regra?.valor_limite ? String(regra.valor_limite) : '',
      });
    } catch (error) {
      console.error('Erro ao carregar regra de valor:', error);
      setRegraValor(null);
    } finally {
      setLoadingRegraValor(false);
    }
  };

  useEffect(() => {
    carregarRegraValor();
  }, [user?.administradora_id]);

  const salvarRegraValor = async () => {
    const administradoraId = user?.administradora_id;
    const valorLimite = Number(formRegraValor.valor_limite);

    if (!administradoraId) {
      enqueueSnackbar('Administradora não encontrada.', { variant: 'error' });
      return;
    }

    if (formRegraValor.ativo && (!valorLimite || Number.isNaN(valorLimite) || valorLimite <= 0)) {
      enqueueSnackbar('Informe um valor limite válido.', { variant: 'warning' });
      return;
    }

    try {
      setSalvandoRegraValor(true);
      const payload = {
        administradora_id: administradoraId,
        ativo: formRegraValor.ativo,
        valor_limite: formRegraValor.ativo ? valorLimite : null,
        bloquear_acima_limite: formRegraValor.ativo,
      };

      const response = regraValor?.id
        ? await atualizarRegraValorAdministradora(administradoraId, regraValor.id, payload)
        : await criarRegraValorAdministradora(administradoraId, payload);

      setRegraValor(response);
      setModalRegraValorOpen(false);
      enqueueSnackbar('Regra de valor salva com sucesso.', { variant: 'success' });
      setValidationVersion(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao salvar regra de valor:', error);
      enqueueSnackbar(error.message || 'Erro ao salvar regra de valor.', { variant: 'error' });
    } finally {
      setSalvandoRegraValor(false);
    }
  };

  async function handleResult({ file, result: uploadResult }) {
    try {
      await carregarRegraValor();

      let response = uploadResult;

      if (!response) {
        const isVTByFilename = file.name.toLowerCase().includes('vt') || 
                                file.name.toLowerCase().includes('vale transporte') ||
                                file.name.toLowerCase().includes('vale_transporte');
        
        if (isVTByFilename) {
          response = await vtService.uploadVTFile(file, user?.administradora_id);
        } else {
          response = await uploadService.uploadFile(file, user?.administradora_id);
        }
      }

      const isVT = isVTResponse(response);
      const tipoFinal = isVT ? 'vale_transporte' : (file.name.toLowerCase().includes('fat') ? 'faturamento' : 'compra');

      if (tipoFinal === 'vale_transporte') {
        let vtData = response;
        
        if (vtData && !vtData.dados_validados && vtData.summary) {
          const movimentacoes = getMovimentacoesBackend(vtData);
          if (movimentacoes.length > 0) {
            vtData = { ...vtData, dados_validados: movimentacoes, tipo_processamento: 'VT' };
          }
        }

        const movimentacoes = vtData?.dados_validados || [];
        let previewRows = vtData?.summary?.total_por_beneficiario || [];

        if (previewRows.length === 0 && movimentacoes.length > 0) {
          previewRows = buildPreviewRowsFromMovimentacoes(movimentacoes);
        }

        const parsed = previewRows.map(row => ({
          ...row,
          beneficios: movimentacoes
            .filter(m => getCpf(m) === getCpf(row))
            .map(m => ({
              codigo: m.codigo_produto || 'VT',
              nome: m.nome_produto || 'Vale Transporte',
              valor: m.valor_beneficio_total || getValorRow(m)
            }))
        }));

        if (!Array.isArray(parsed) || parsed.length === 0) {
          enqueueSnackbar('Nenhum registro válido foi encontrado no arquivo VT.', { variant: 'error' });
          return { success: false };
        }

        setLote({
          id: 'VT-' + (vtData?.file_upload_id || Date.now()),
          arquivo: file.name,
          tipo: 'vale_transporte',
          rows: parsed,
          excluidosPorColab: new Set(),
        });

        setData(vtData);
        setDetailsOpen(false);
        setReviewOpen(false);
        setFilterOnlyErrors(false);
        setFilterOnlyBlocked(false);

        enqueueSnackbar(`Arquivo de Vale Transporte importado com ${parsed.length} registros`, { variant: 'success' });
        return { success: true };
      }

      const movimentacoes = getMovimentacoesBackend(response);
      let previewRowsBackend = response?.summary?.total_por_beneficiario ||
        response?.data_to_backend?.summary?.total_por_beneficiario ||
        response?.total_por_beneficiario ||
        response?.resumo ||
        response?.preview ||
        [];

      let previewRows = Array.isArray(previewRowsBackend) && previewRowsBackend.length > 0
        ? previewRowsBackend
        : Array.isArray(movimentacoes) && movimentacoes.length > 0
          ? buildPreviewRowsFromMovimentacoes(movimentacoes)
          : [];

      const parsed = enrichRowsWithBenefits(previewRows, movimentacoes);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setData(response);
        setLote({ id: null, arquivo: null, tipo: null, rows: [], excluidosPorColab: new Set() });
        enqueueSnackbar('Nenhum registro válido foi encontrado no arquivo.', { variant: 'error' });
        return { success: false };
      }

      setData(response);
      setLote({
        id: 'IMP-' + (response?.file_upload_id || Date.now()),
        arquivo: file.name,
        tipo: tipoFinal,
        rows: parsed,
        excluidosPorColab: new Set(),
      });

      setValidationVersion(prev => prev + 1);
      setFilterOnlyErrors(false);
      setFilterOnlyBlocked(false);
      setDetailsOpen(false);
      setReviewOpen(false);

      enqueueSnackbar(response?.detail || 'Importação realizada com sucesso', { variant: 'success' });
      return { success: true };
    } catch (error) {
      const errorMessage = error.message.includes('API Error')
        ? error.message.split('API Error: ')[1]
        : 'Erro desconhecido na comunicação com o servidor.';
      console.error('Erro no processamento da importação:', error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false };
    }
  }

  const rowsAtivas = useMemo(() => {
    if (!lote?.rows?.length) return [];
    if (!lote.excluidosPorColab?.size) return lote.rows;
    return lote.rows.filter((r) => !lote.excluidosPorColab.has(getNomeColaborador(r)));
  }, [lote]);

  const isValeTransporte = lote?.tipo === 'vale_transporte';

  const linhasComErroBackend = useMemo(() => {
    if (!data?.linhas_com_erro || !Array.isArray(data.linhas_com_erro)) return [];
    
    const limiteAtivo = regraValor?.ativo === true && Number(regraValor?.valor_limite) > 0;
    const valorLimite = Number(regraValor?.valor_limite);
    
    return data.linhas_com_erro
      .filter(erro => {
        if (!isValeTransporte && erro.tipo_erro === 'VALOR_EXCEDIDO' && limiteAtivo && erro.dados) {
          const rowEncontrada = rowsAtivas.find(r => getCpf(r) === erro.dados?.cpf);
          if (rowEncontrada && getValorRow(rowEncontrada) <= valorLimite) return false;
        }
        return true;
      })
      .map(erro => ({
        linha: erro.linha,
        tipo: erro.tipo_erro,
        detalhes: erro.dados || {},
        mensagem: erro.tipo_erro === 'VALOR_EXCEDIDO' 
          ? `⚠️ Valor excedeu o limite permitido na linha ${erro.linha} (limite: ${formatCurrency(regraValor?.valor_limite)})`
          : `⚠️ Erro na linha ${erro.linha}: ${erro.tipo_erro || 'Dado inválido'}`
      }));
  }, [data, rowsAtivas, regraValor, isValeTransporte]);

  const hasBackendError = (row) => {
    const cpf = getCpf(row);
    const valorAtual = getValorRow(row);
    const limiteAtivo = regraValor?.ativo === true && Number(regraValor?.valor_limite) > 0;
    
    const erroEncontrado = linhasComErroBackend.find(erro => 
      erro.detalhes?.cpf === cpf || erro.detalhes?.nome === getNomeColaborador(row)
    );
    
    if (!erroEncontrado) return false;
    if (!isValeTransporte && erroEncontrado.tipo === 'VALOR_EXCEDIDO' && limiteAtivo) {
      if (valorAtual <= Number(regraValor.valor_limite)) return false;
    }
    return true;
  };

  const getBackendErrorMessage = (row) => {
    const cpf = getCpf(row);
    const valorAtual = getValorRow(row);
    const limiteAtivo = regraValor?.ativo === true && Number(regraValor?.valor_limite) > 0;
    
    const erro = linhasComErroBackend.find(e => 
      e.detalhes?.cpf === cpf || e.detalhes?.nome === getNomeColaborador(row)
    );
    
    if (!erro) return '';
    if (!isValeTransporte && erro.tipo === 'VALOR_EXCEDIDO' && limiteAtivo) {
      if (valorAtual <= Number(regraValor.valor_limite)) return '';
    }
    return erro.mensagem;
  };

  const linhasValidadas = useMemo(() => {
    return rowsAtivas.map((r) => {
      const validacao = getRowValidation(r, regraValor, isValeTransporte);
      return { ...r, bloqueado: validacao.bloqueado, bloqueadoPorValor: validacao.bloqueadoPorValor, errosValidacao: validacao.erros };
    });
  }, [rowsAtivas, regraValor, isValeTransporte, validationVersion]);

  const totalBloqueios = useMemo(() => linhasValidadas.filter((r) => r.bloqueado).length, [linhasValidadas]);
  const totalErrosBackend = useMemo(() => linhasComErroBackend.length, [linhasComErroBackend]);

  const linhasExibidas = useMemo(() => {
    let resultado = linhasValidadas;
    if (filterOnlyErrors) resultado = resultado.filter(row => hasBackendError(row));
    if (filterOnlyBlocked && !isValeTransporte) resultado = resultado.filter(row => row.bloqueado === true);
    return resultado;
  }, [linhasValidadas, filterOnlyErrors, filterOnlyBlocked, isValeTransporte]);

  const podeEnviar = useMemo(() => {
    if (linhasValidadas.length === 0) return false;
    if (isValeTransporte) return linhasValidadas.length > 0;
    return linhasValidadas.length > 0 && totalBloqueios === 0;
  }, [linhasValidadas, totalBloqueios, isValeTransporte]);

  const totalCompras = useMemo(() => {
    return rowsAtivas.reduce((total, row) => total + (row?.beneficios?.length || 0), 0);
  }, [rowsAtivas]);

  const totalFaturamento = useMemo(() => {
    return linhasValidadas.reduce((total, row) => total + getValorRow(row), 0);
  }, [linhasValidadas]);

  const toggleFilterBlocked = () => {
    if (totalBloqueios === 0) return;
    setFilterOnlyBlocked(!filterOnlyBlocked);
    if (!filterOnlyBlocked) setFilterOnlyErrors(false);
  };

  const toggleFilterErrors = () => {
    if (totalErrosBackend === 0) return;
    setFilterOnlyErrors(!filterOnlyErrors);
    if (!filterOnlyErrors) setFilterOnlyBlocked(false);
  };

  const limparLote = () => {
    if (enviandoLote) return;
    setLote({ id: null, arquivo: null, tipo: null, rows: [], excluidosPorColab: new Set() });
    setFormEnvio({
      periodoInicio: '', periodoFim: '', competenciaMes: '', competenciaAno: String(new Date().getFullYear()), vencimento: '', recebimentoBeneficio: '',
    });
    setModalOpen(false);
    setData(null);
    setDetailsOpen(false);
    setReviewOpen(false);
    setFilterOnlyErrors(false);
    setFilterOnlyBlocked(false);
  };

  const abrirDetalhes = (row) => {
    if (enviandoLote) return;
    setDetailsTitle(getNomeColaborador(row));
    setDetailsBenefits(row?.beneficios || []);
    setDetailsRowKey(getRowKey(row));
    setEditingBenefitIndex(null);
    setEditBenefitValue('');
    setDetailsOpen(true);
  };

  const iniciarEdicaoBeneficio = (index, valorAtual) => {
    if (enviandoLote) return;
    setEditingBenefitIndex(index);
    setEditBenefitValue(String(valorAtual || '').replace(',', '.'));
  };

  const cancelarEdicaoBeneficio = () => {
    setEditingBenefitIndex(null);
    setEditBenefitValue('');
  };

  const salvarEdicaoBeneficio = (beneficioIndex) => {
    if (enviandoLote) return;

    const novoValor = Number(editBenefitValue);
    if (Number.isNaN(novoValor) || novoValor <= 0) {
      enqueueSnackbar('Informe um valor válido para o benefício.', { variant: 'warning' });
      return;
    }

    const originalIndex = lote.rows.findIndex((row) => getRowKey(row) === detailsRowKey);
    if (originalIndex < 0) {
      enqueueSnackbar('Não foi possível localizar o colaborador para edição.', { variant: 'error' });
      return;
    }

    const clone = [...lote.rows];
    const rowAtual = clone[originalIndex];
    const beneficiosAtualizados = [...(rowAtual.beneficios || [])];
    beneficiosAtualizados[beneficioIndex] = { ...beneficiosAtualizados[beneficioIndex], valor: novoValor };

    const novoTotal = beneficiosAtualizados.reduce((total, item) => total + Number(item?.valor || 0), 0);
    const valorKey = Object.prototype.hasOwnProperty.call(rowAtual, 'valor_total') ? 'valor_total' : 'valor';

    clone[originalIndex] = { ...rowAtual, beneficios: beneficiosAtualizados, [valorKey]: novoTotal };
    setLote(prev => ({ ...prev, rows: clone }));
    setDetailsBenefits(beneficiosAtualizados);
    setEditingBenefitIndex(null);
    setEditBenefitValue('');
    setValidationVersion(prev => prev + 1);
    enqueueSnackbar('Benefício atualizado com sucesso.', { variant: 'success' });
    setTimeout(() => setDetailsOpen(false), 1000);
  };

  const abrirConfirmacaoExclusao = (row) => {
    if (enviandoLote) return;
    setColaboradorParaExcluir(row);
    setConfirmDeleteOpen(true);
  };

  const confirmarExclusaoColaborador = () => {
    if (!colaboradorParaExcluir || enviandoLote) return;
    const colaboradorKey = getNomeColaborador(colaboradorParaExcluir);
    if (!colaboradorKey) return;
    const novo = new Set(lote.excluidosPorColab);
    novo.add(colaboradorKey);
    setLote(prev => ({ ...prev, excluidosPorColab: novo }));
    setConfirmDeleteOpen(false);
    setColaboradorParaExcluir(null);
  };

  const abrirModalRevisao = (e) => {
    e.preventDefault();
    if (enviandoLote) return;

    let totalMovimentacoes = 0;
    let valorTotalBeneficios = 0;

    if (isValeTransporte) {
      totalMovimentacoes = data?.summary?.total_movimentacoes || lote.rows.length;
      valorTotalBeneficios = data?.summary?.valor_total_beneficios || lote.rows.reduce((total, row) => total + getValorRow(row), 0);
    } else {
      linhasValidadas.forEach((row) => {
        valorTotalBeneficios += getValorRow(row);
        totalMovimentacoes += row.beneficios?.length || 0;
      });
    }

    const hoje = new Date();
    setReviewData({
      totalFuncionarios: linhasValidadas.length,
      totalMovimentacoes,
      valorTotalBeneficios,
      periodoInicio: formEnvio.periodoInicio || `2026-04-01`,
      periodoFim: formEnvio.periodoFim || `2026-04-30`,
      competenciaMes: formEnvio.competenciaMes || String(hoje.getMonth() + 1).padStart(2, '0'),
      competenciaAno: formEnvio.competenciaAno || String(hoje.getFullYear()),
      vencimento: formEnvio.vencimento || `2026-04-30`,
    });
    setModalOpen(false);
    setReviewOpen(true);
  };

  const confirmarEnvio = async () => {
    if (enviandoLote) return;
    if (!lote?.rows?.length) {
      enqueueSnackbar('Não há dados para enviar', { variant: 'error' });
      return;
    }

    try {
      setEnviandoLote(true);

      if (isValeTransporte) {
        const dadosValidadosAtualizados = (data.dados_validados || []).map(item => {
          const rowCorrespondente = linhasValidadas.find(row => 
            getCpf(row) === item.cpf_funcionario && getCondominio(row) === item.nome_condominio
          );
          if (rowCorrespondente) {
            return { ...item, valor_beneficio_total: getValorRow(rowCorrespondente), valor_editado_manualmente: true };
          }
          return item;
        });

        const payloadVT = {
          file_upload_id: data.file_upload_id || Number(lote.id?.replace('VT-', '')) || 228,
          administradora_id: user?.administradora_id,
          tipo_processamento: 'VT',
          origem: 'importacao_vale_transporte',
          periodo_inicio: formEnvio.periodoInicio || reviewData.periodoInicio,
          periodo_fim: formEnvio.periodoFim || reviewData.periodoFim,
          competencia_mes: formEnvio.competenciaMes || reviewData.competenciaMes,
          competencia_ano: formEnvio.competenciaAno || reviewData.competenciaAno,
          vencimento: formEnvio.vencimento || reviewData.vencimento || '',
          recebimento_beneficio: formEnvio.recebimentoBeneficio || '',
          dados_validados: dadosValidadosAtualizados,
          modelo_importacao: "VR-AUTO",
          summary: {
            total_funcionarios: lote.rows.length,
            total_movimentacoes: dadosValidadosAtualizados.length,
            valor_total_beneficios: linhasValidadas.reduce((total, row) => total + getValorRow(row), 0).toFixed(2)
          }
        };
        await vtService.confirmVTUpload(payloadVT);
      } else {
        const loteComAjustes = lote;
        const dataToBackendSincronizado = prepararDadosParaEnvio(loteComAjustes, data.data_to_backend);
        dataToBackendSincronizado.periodo_inicio = formEnvio.periodoInicio || reviewData.periodoInicio;
        dataToBackendSincronizado.periodo_fim = formEnvio.periodoFim || reviewData.periodoFim;
        dataToBackendSincronizado.competencia_mes = formEnvio.competenciaMes || reviewData.competenciaMes;
        dataToBackendSincronizado.competencia_ano = formEnvio.competenciaAno || reviewData.competenciaAno;
        dataToBackendSincronizado.vencimento = formEnvio.vencimento || reviewData.vencimento || '';
        dataToBackendSincronizado.recebimento_beneficio = formEnvio.recebimentoBeneficio || '';
        dataToBackendSincronizado.tipo_processamento = lote.tipo || 'compra';
        dataToBackendSincronizado.origem = 'importacao_faturamento';
        dataToBackendSincronizado.file_upload_id = data.file_upload_id || lote.id?.replace('IMP-', '') || 228;

        const dadosParaEnvio = {
          file_upload_id: data.file_upload_id || Number(lote.id?.replace('IMP-', '')) || 228,
          administradora_id: user?.administradora_id,
          condominios: dataToBackendSincronizado.condominios || [],
          summary: dataToBackendSincronizado.summary,
          movimentacoes_detalhada: dataToBackendSincronizado.movimentacoes_detalhada || [],
          periodo_inicio: dataToBackendSincronizado.periodo_inicio,
          periodo_fim: dataToBackendSincronizado.periodo_fim,
          competencia_mes: dataToBackendSincronizado.competencia_mes,
          competencia_ano: dataToBackendSincronizado.competencia_ano,
          vencimento: dataToBackendSincronizado.vencimento,
          recebimento_beneficio: dataToBackendSincronizado.recebimento_beneficio,
          tipo_processamento: dataToBackendSincronizado.tipo_processamento,
          origem: dataToBackendSincronizado.origem,
          modelo_importacao: "VR-BENEFICIOS",
        };
        await uploadService.confirmUpload(dadosParaEnvio);
      }

      enqueueSnackbar('Lote enviado com sucesso!', { variant: 'success' });
      setReviewOpen(false);
      setModalOpen(false);
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (error) {
      console.error('Erro no envio:', error);
      enqueueSnackbar(`Erro: ${error.response?.data?.detail || error.message}`, { variant: 'error' });
    } finally {
      setEnviandoLote(false);
    }
  };

  const abrirModalRegraValor = async () => {
    await carregarRegraValor();
    setModalRegraValorOpen(true);
  };

  return (
    <PageLayout title="Importação" subtitle="Importe arquivos .txt, .csv ou .xlsx">
      <S.Container>
        <FileUpload onUpload={handleResult} />

        <S.TotaisGrid>
          <S.TotalCard $isCompra>
            <h3>Compras de Benefícios</h3>
            <p className="valor">{totalCompras}</p>
          </S.TotalCard>
          <S.TotalCard $isFaturamento>
            <h3>Faturamento dos Benefícios</h3>
            <p className="valor">{formatCurrency(totalFaturamento)}</p>
          </S.TotalCard>
        </S.TotaisGrid>

        {/* Regra de Valor Card */}
        <S.LoteCard $marginTop={16} $marginBottom={16}>
          <S.LoteHeader>
            <div>
              <h3>Regra de Valor da Administradora</h3>
              <small>
                {loadingRegraValor
                  ? 'Carregando regra...'
                  : isValeTransporte
                    ? '🔸 Regra de valor não se aplica para Vale Transporte'
                    : regraValor?.ativo && regraValor?.valor_limite
                      ? `Bloqueio ativo para valores acima de ${formatCurrency(regraValor.valor_limite)}`
                      : 'Nenhuma trava de valor ativa para esta administradora.'}
              </small>
            </div>
            <S.ButtonGhost
              type="button"
              onClick={abrirModalRegraValor}
              disabled={enviandoLote || loadingRegraValor || isValeTransporte}
            >
              {regraValor?.id ? 'Editar regra' : 'Cadastrar regra'}
            </S.ButtonGhost>
          </S.LoteHeader>
        </S.LoteCard>

        {/* Lote Principal */}
        {lote.id && (
          <S.LoteCard>
            <S.LoteHeader>
              <div>
                <h3>Pré-validação do Lote</h3>
                <small>
                  Arquivo: <strong>{lote.arquivo}</strong> • Tipo: <strong>{lote.tipo === 'vale_transporte' ? 'Vale Transporte' : lote.tipo}</strong>
                </small>
              </div>
              <S.ButtonGhost onClick={limparLote} type="button" disabled={enviandoLote}>
                Descartar lote
              </S.ButtonGhost>
            </S.LoteHeader>

            <S.LoteKpis>
              <S.Kpi>
                <S.KpiLabel>Condomínios importados</S.KpiLabel>
                <S.KpiValue>{data?.summary?.total_condominios || linhasValidadas.length}</S.KpiValue>
              </S.Kpi>
              <S.Kpi>
                <S.KpiLabel>Condomínios novos</S.KpiLabel>
                <S.KpiValue>{data?.summary?.novos_registros?.['Total de condomínios novos'] || 0}</S.KpiValue>
              </S.Kpi>
              {totalBloqueios > 0 && !isValeTransporte && (
                <S.Kpi $clickable $isBlocked $active={filterOnlyBlocked} onClick={toggleFilterBlocked}>
                  <S.KpiLabel>🔒 Linhas bloqueadas por regra</S.KpiLabel>
                  <S.KpiValue $isBlocked>{totalBloqueios}</S.KpiValue>
                </S.Kpi>
              )}
            </S.LoteKpis>

            <S.TableWrapper>
              <S.Table>
                <S.TableHead>
                  <tr>
                    <th>Condomínio</th>
                    <th>Colaborador</th>
                    <th className="col-valor">Valor</th>
                    <th className="col-status">Status</th>
                    <th className="col-acoes">Ações</th>
                  </tr>
                </S.TableHead>
                <S.TableBody>
                  {linhasExibidas.length === 0 ? (
                    <tr>
                      <S.EmptyState colSpan={5}>
                        {filterOnlyErrors ? 'Nenhuma linha com erro encontrada.' : 
                         filterOnlyBlocked ? 'Nenhuma linha bloqueada encontrada.' :
                         'Nenhum registro encontrado para pré-visualização.'}
                      </S.EmptyState>
                    </tr>
                  ) : (
                    linhasExibidas.map((r, idx) => {
                      const valorExibicao = getValorRow(r);
                      const nomeColaborador = getNomeColaborador(r);
                      const temErroBackend = hasBackendError(r);
                      const erroBackendMsg = getBackendErrorMessage(r);

                      return (
                        <tr
                          key={`${getRowKey(r)}-${idx}`}
                          className={`${r.bloqueado ? 'row-bloqueado' : ''} ${temErroBackend ? 'row-backend-error' : ''}`}
                        >
                          <td>{getCondominio(r)}</td>
                          <td>{nomeColaborador}</td>
                          <S.ColValor>
                            R$ {Number(valorExibicao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </S.ColValor>
                          <S.ColStatus>
                            {r.bloqueado ? (
                              <S.StatusStack>
                                <S.Tag $isDanger>🔒 Bloqueado</S.Tag>
                                {r.errosValidacao?.length > 0 && (
                                  <S.StatusDetail>{r.errosValidacao.join(' • ')}</S.StatusDetail>
                                )}
                              </S.StatusStack>
                            ) : temErroBackend ? (
                              <S.StatusStack>
                                <S.Tag $isWarning>⚠️ Erro no processamento</S.Tag>
                                <S.StatusDetail>{erroBackendMsg}</S.StatusDetail>
                              </S.StatusStack>
                            ) : (
                              <S.Tag $isOk>OK</S.Tag>
                            )}
                          </S.ColStatus>
                          <S.ColAcoes>
                            <S.AcoesInline>
                              <S.ButtonIcon
                                as="button"
                                className="btn-sm btn-outline"
                                title={`Detalhes de ${nomeColaborador}`}
                                onClick={() => abrirDetalhes(r)}
                                type="button"
                                disabled={enviandoLote}
                              >
                                <FiEye size={16} />
                                <span className="btn-text">Detalhes</span>
                              </S.ButtonIcon>
                              <S.ButtonIcon
                                $danger
                                as="button"
                                className="btn-sm btn-outline"
                                title={`Excluir colaborador ${nomeColaborador}`}
                                onClick={() => abrirConfirmacaoExclusao(r)}
                                type="button"
                                disabled={enviandoLote}
                              >
                                <FiTrash2 size={16} />
                                <span className="btn-text">Excluir</span>
                              </S.ButtonIcon>
                            </S.AcoesInline>
                          </S.ColAcoes>
                        </tr>
                      );
                    })
                  )}
                </S.TableBody>
              </S.Table>
            </S.TableWrapper>

            <S.LoteActions>
              <S.ButtonPrimary
                disabled={!podeEnviar || enviandoLote}
                onClick={() => setModalOpen(true)}
                type="button"
              >
                Enviar para importação
              </S.ButtonPrimary>
              {!podeEnviar && !isValeTransporte && (
                <S.Hint>Resolva os bloqueios para habilitar o envio.</S.Hint>
              )}
            </S.LoteActions>
          </S.LoteCard>
        )}

        {/* Modais... (continua na parte 3) */}
      </S.Container>
    </PageLayout>
  );
}

