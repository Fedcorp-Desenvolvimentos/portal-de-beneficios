import React, { useEffect, useMemo, useState } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiCheck, FiX, FiDownload, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useSnackbar } from 'notistack';
import FileUpload from '../../../components/FileUpload/FileUpload.jsx';
import { uploadService } from '../../../services/uploadService.js';
import {
  prepararDadosParaEnvio,
} from '../../../utils/ajuste_calculo_importacao.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useLoading } from "../../../hooks/useLoading.js";
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx';
import { 
  buscarRegraValorAdministradora, 
  atualizarRegraValorAdministradora, 
  criarRegraValorAdministradora 
} from '../../../services/administradoraService.js';
import { vtService } from '../../../services/vtService.js';

import * as S from './ImportacaoStyles';

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