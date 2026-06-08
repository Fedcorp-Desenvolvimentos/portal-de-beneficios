// pages/Faturamento/Faturamento.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  FiSearch,
  FiDownload,
  FiFileText,
  FiCalendar,
  FiCreditCard,
  FiArchive,
} from 'react-icons/fi';

import { entebenService } from '../../../services/entebenService';
import PageLayout from '../../../Layouts/PageLayout/PageLayout';
import { S } from './FaturamentoStyles';

// ============================================
// UTILITÁRIOS
// ============================================
const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  });

const normalizeStatus = (status) =>
  String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const getStatusOptionLabel = (status) => getStatusLabel(status);

const formatDateBR = (value) => {
  if (!value) return '—';
  const onlyDate = String(value).split('T')[0];
  const [year, month, day] = onlyDate.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const getDateOnly = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getStatusLabel = (status) => {
  const normalized = String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const labels = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',

    sucesso: 'Concluído',
    processado: 'Concluído',
    concluido: 'Concluído',

    aguardando_faturamento: 'Aguardando faturamento',
    aguardandofaturamento: 'Aguardando faturamento',

    faturado: 'Faturado',
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getStatusVariant = (status) => {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized === 'completed' ||
    normalized === 'sucesso' ||
    normalized === 'processado' ||
    normalized === 'concluido' ||
    normalized === 'concluído' ||
    normalized === 'faturado'
  ) {
    return 'success';
  }

  if (normalized === 'failed') return 'danger';
  if (normalized === 'processing' || normalized === 'aguardando_faturamento') return 'warning';
  return 'info';
};

const isStatusConcluido = (status) => {
  const normalized = String(status || '').toLowerCase();
  return [
    'completed',
    'sucesso',
    'processado',
    'concluido',
    'concluído',
    'faturado',
  ].includes(normalized);
};

const getCompetencia = (item) => {
  if (item?.competencia) return formatDateBR(item.competencia);
  if (item?.faturamento_competencia) return String(item.faturamento_competencia);
  if (item?.vigencia_inicio) {
    const [year, month] = String(item.vigencia_inicio).split('-');
    if (year && month) return `${month}/${year}`;
  }
  return '—';
};

const getCondominiosImportacao = (item) => {
  if (Array.isArray(item?.condominios)) return item.condominios;
  if (Array.isArray(item?.dados_requisicao?.condominios)) return item.dados_requisicao.condominios;
  return [];
};

const getFuncionariosImportacao = (item) =>
  getCondominiosImportacao(item).flatMap((condo) =>
    Array.isArray(condo?.funcionarios) ? condo.funcionarios : []
  );

const getMovimentacoesImportacao = (item) =>
  getFuncionariosImportacao(item).flatMap((func) =>
    Array.isArray(func?.movimentacoes) ? func.movimentacoes : []
  );

const getValorTotal = (item) => {
  const movimentacoesDiretas =
    item?.movimentacoes_detalhada ||
    item?.dados_requisicao?.movimentacoes_detalhada ||
    item?.data_to_backend?.movimentacoes_detalhada ||
    [];

  const totalMovimentacoesDiretas = Array.isArray(movimentacoesDiretas)
    ? movimentacoesDiretas.reduce((sum, mov) => {
      return sum + Number(mov?.valor_recarga_bene || mov?.valor_total || mov?.valor || 0);
    }, 0)
    : 0;

  const totalMovimentacoesAninhadas = getMovimentacoesImportacao(item).reduce(
    (sum, mov) => sum + Number(mov?.valor || mov?.valor_total || mov?.valor_recarga_bene || 0),
    0
  );

  return Number(
    totalMovimentacoesDiretas ||
    totalMovimentacoesAninhadas ||
    item?.valor_total ||
    item?.total ||
    item?.valor_total_beneficios ||
    item?.summary?.valor_total_beneficios ||
    item?.summary?.valor_total ||
    item?.dados_requisicao?.summary?.valor_total_beneficios ||
    item?.dados_requisicao?.summary?.valor_total ||
    item?.dados_requisicao?.valor_total_beneficios ||
    item?.dados_requisicao?.valor_total ||
    item?.dados_requisicao?.total ||
    item?.dados_requisicao?.total_geral ||
    item?.dados_requisicao?.resumo?.valor_total_beneficios ||
    item?.dados_requisicao?.resumo?.valor_total ||
    item?.dados_requisicao?.resumo?.total ||
    0
  );
};

const getQuantidade = (item) =>
  Number(
    item?.registros_processados ||
    item?.total_registros ||
    item?.total_movimentacoes ||
    item?.summary?.total_movimentacoes ||
    0
  );

// ============================================
// SKELETON COMPONENT
// ============================================
const SkeletonCard = () => (
  <S.SkeletonCard>
    <S.SkeletonCardTop>
      <S.SkeletonMain>
        <S.SkeletonIcon />
        <S.SkeletonText>
          <S.SkeletonLine $width="180px" $height="24px" />
          <S.SkeletonLine $width="120px" $height="16px" />
        </S.SkeletonText>
      </S.SkeletonMain>

      <S.SkeletonSummary>
        {[1, 2, 3, 4].map((i) => (
          <S.SkeletonSummaryItem key={i}>
            <S.SkeletonLine $width="80px" $height="14px" />
            <S.SkeletonLine $width="100px" $height="20px" />
          </S.SkeletonSummaryItem>
        ))}
      </S.SkeletonSummary>
    </S.SkeletonCardTop>

    <div>
      <S.SkeletonLine $width="60px" $height="16px" style={{ marginBottom: '12px' }} />
      <S.SkeletonTags>
        <S.SkeletonTag $width="120px" />
        <S.SkeletonTag $width="200px" />
        <S.SkeletonTag $width="180px" />
      </S.SkeletonTags>
    </div>

    <S.SkeletonDocs>
      <S.SkeletonButton $width="100px" />
      <S.SkeletonButton $width="80px" />
      <S.SkeletonButton $width="120px" />
      <S.SkeletonButton $width="130px" />
    </S.SkeletonDocs>
  </S.SkeletonCard>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Faturamento() {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCompetencia, setFiltroCompetencia] = useState('');
  const [filtroVigencia, setFiltroVigencia] = useState('');
  const [filtroVencimento, setFiltroVencimento] = useState('');
  const [error, setError] = useState('');
  const [importacoes, setImportacoes] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const showToast = (message, options = {}) => {
    enqueueSnackbar(message, {
      variant: options.variant || 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      ...options,
    });
  };

  useEffect(() => {
    carregarFaturamentos();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [search, filtroStatus, filtroCompetencia, filtroVigencia, filtroVencimento]);

  async function carregarFaturamentos() {
    try {
      setIsLoading(true);
      setError('');

      const [ultimaImportacao, historicoData] = await Promise.all([
        entebenService.getUltimaImportacao(),
        entebenService.getImportacoes(),
      ]);

      const historico = toArray(historicoData);

      const historicoComUltimaCompleta = historico.map((item, index) => {
        const isPrimeira = index === 0;
        if (isPrimeira && ultimaImportacao) {
          return {
            ...ultimaImportacao,
            ...item,
            id: item.id,
            importacao_id: item.importacao_id || item.id,
            faturamento_id: item.faturamento_id || item.faturamento?.id || item.id,
          };
        }
        return item;
      });

      const comStatus = historicoComUltimaCompleta.map((item) => ({
        ...item,
        faturamento_status: item.faturamento_status || item.status,
        faturamento_progresso: item.faturamento_progresso || item.progresso,
        faturamento_competencia: item.faturamento_competencia || item.competencia,
      }));

      setImportacoes(comStatus);
    } catch (err) {
      console.error('Erro ao carregar faturamentos:', err);
      setError('Não foi possível carregar os faturamentos.');
      showToast('Não foi possível carregar os faturamentos.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  async function baixarDocumento(faturamentoId, tipo = '') {
    try {
      const blob = await entebenService.downloadDocumentoFaturamento(faturamentoId, tipo);
      const fileURL = window.URL.createObjectURL(blob);

      const nomeArquivo =
        tipo !== 'originais/'
          ? `${tipo.replaceAll('/', '').replaceAll('-', '_')}-${faturamentoId}.pdf`
          : `faturamento-${faturamentoId}.zip`;

      const a = document.createElement('a');
      a.href = fileURL;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(fileURL);

      showToast(`Download iniciado: ${nomeArquivo}`, { variant: 'success' });
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      showToast('Não foi possível baixar o documento.', { variant: 'error' });
    }
  }

  const opcoesStatus = useMemo(() => {
    const map = new Map();

    importacoes.forEach((item) => {
      const rawStatus = item.faturamento_status || item.status;
      const normalized = normalizeStatus(rawStatus);

      if (normalized && !map.has(normalized)) {
        map.set(normalized, {
          value: normalized,
          label: getStatusOptionLabel(rawStatus),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
    );
  }, [importacoes]);

  const opcoesCompetencia = useMemo(() => {
    return [
      ...new Set(
        importacoes
          .map((item) => getCompetencia(item))
          .filter((value) => value && value !== '—')
      ),
    ].sort((a, b) => String(b).localeCompare(String(a)));
  }, [importacoes]);

  const opcoesVigencia = useMemo(() => {
    return [
      ...new Set(importacoes.map((item) => getDateOnly(item.vigencia_inicio)).filter(Boolean)),
    ].sort((a, b) => String(b).localeCompare(String(a)));
  }, [importacoes]);

  const opcoesVencimento = useMemo(() => {
    return [
      ...new Set(importacoes.map((item) => getDateOnly(item.data_vencimento)).filter(Boolean)),
    ].sort((a, b) => String(b).localeCompare(String(a)));
  }, [importacoes]);

  const gruposFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return importacoes
      .map((item) => {
        const key = item.id || item.faturamento_id || item.faturamento?.id;
        const downloadId = item.faturamento_id || item.faturamento?.id || item.id;
        const label = `Importação ${item.id}`;
        const status = item.faturamento_status || item.status;
        const total = getValorTotal(item);
        const quantidadeBeneficios = getQuantidade(item);
        const dataImportacao = getDateOnly(item.data_importacao);
        const dataVigenciaInicio = getDateOnly(item.vigencia_inicio);
        const dataVencimento = getDateOnly(item.data_vencimento);
        const competencia = getCompetencia(item);

        return {
          ...item,
          key,
          downloadId,
          importacaoLabel: label,
          importacaoDate: formatDateBR(item.data_importacao),
          dataImportacao,
          dataVigenciaInicio,
          dataVencimento,
          competencia,
          status,
          total,
          quantidadeBeneficios,
          beneficios: [
            `Registros processados: ${item.registros_processados || 0}`,
            `Vigência: ${formatDateBR(item.vigencia_inicio)} até ${formatDateBR(item.vigencia_fim)}`,
            `Vencimento: ${formatDateBR(item.data_vencimento)}`,
          ],
        };
      })
      .filter((group) => {
        const textoBusca = [
          group.importacaoLabel,
          group.key,
          group.downloadId,
          group.competencia,
          group.status,
          group.nome_usuario,
          ...group.beneficios,
        ]
          .join(' ')
          .toLowerCase();

        const matchSearch = !query || textoBusca.includes(query);
        const matchStatus = !filtroStatus || normalizeStatus(group.status) === filtroStatus;
        const matchCompetencia = !filtroCompetencia || group.competencia === filtroCompetencia;
        const matchVigencia = !filtroVigencia || group.dataVigenciaInicio === filtroVigencia;
        const matchVencimento = !filtroVencimento || group.dataVencimento === filtroVencimento;

        return matchSearch && matchStatus && matchCompetencia && matchVigencia && matchVencimento;
      });
  }, [importacoes, search, filtroStatus, filtroCompetencia, filtroVigencia, filtroVencimento]);

  const totalPaginas = Math.ceil(gruposFiltrados.length / itensPorPagina);
  const gruposPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return gruposFiltrados.slice(inicio, fim);
  }, [gruposFiltrados, paginaAtual]);

  const limparFiltros = () => {
    setSearch('');
    setFiltroStatus('');
    setFiltroCompetencia('');
    setFiltroVigencia('');
    setFiltroVencimento('');
    showToast('Filtros limpos', { variant: 'info' });
  };

  // Número de skeletons para mostrar durante o loading
  const skeletonCount = 3;

  return (
    <PageLayout title="Faturamento" subtitle="Acompanhamento de Faturamentos">
      <S.Page>

        <S.Toolbar>
          <S.Search>
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Buscar por importação, competência ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
            />
          </S.Search>

          <S.Filters>
            <S.FilterLabel>
              <span>Status</span>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} disabled={isLoading}>
                <option value="">Todos</option>
                {opcoesStatus.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </S.FilterLabel>

            <S.FilterLabel>
              <span>Competência</span>
              <select value={filtroCompetencia} onChange={(e) => setFiltroCompetencia(e.target.value)} disabled={isLoading}>
                <option value="">Todas</option>
                {opcoesCompetencia.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </S.FilterLabel>

            <S.FilterLabel>
              <span>Vigência</span>
              <select value={filtroVigencia} onChange={(e) => setFiltroVigencia(e.target.value)} disabled={isLoading}>
                <option value="">Todas</option>
                {opcoesVigencia.map((data) => (
                  <option key={data} value={data}>
                    {formatDateBR(data)}
                  </option>
                ))}
              </select>
            </S.FilterLabel>

            <S.FilterLabel>
              <span>Vencimento</span>
              <select value={filtroVencimento} onChange={(e) => setFiltroVencimento(e.target.value)} disabled={isLoading}>
                <option value="">Todos</option>
                {opcoesVencimento.map((data) => (
                  <option key={data} value={data}>
                    {formatDateBR(data)}
                  </option>
                ))}
              </select>
            </S.FilterLabel>

            <S.ClearButton type="button" onClick={limparFiltros} disabled={isLoading}>
              Limpar filtros
            </S.ClearButton>
          </S.Filters>
        </S.Toolbar>

        {error && !isLoading && <S.Empty>{error}</S.Empty>}

        {isLoading ? (
          <S.List>
            {[...Array(skeletonCount)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </S.List>
        ) : (
          <>
            <S.List>
              {gruposPaginados.length === 0 ? (
                <S.Empty>Nenhum faturamento encontrado para os filtros selecionados.</S.Empty>
              ) : (
                gruposPaginados.map((group) => {
                  const podeBaixar = isStatusConcluido(group.status);
                  const statusVariant = getStatusVariant(group.status);

                  return (
                    <S.Card key={group.key}>
                      <S.CardTop>
                        <S.CardMain>
                          <S.Icon>
                            <FiFileText size={18} />
                          </S.Icon>
                          <S.MainText>
                            <h2>{group.importacaoLabel}</h2>
                            <p>ID/Faturamento: {group.key}</p>
                          </S.MainText>
                        </S.CardMain>

                        <S.Summary>
                          <S.SummaryItem>
                            <span>
                              <FiCalendar size={14} /> Importação
                            </span>
                            <strong>{group.importacaoDate}</strong>
                          </S.SummaryItem>

                          <S.SummaryItem>
                            <span>
                              <FiArchive size={14} /> Competência
                            </span>
                            <strong>{group.competencia}</strong>
                          </S.SummaryItem>

                          <S.SummaryItem>
                            <span>
                              <FiFileText size={14} /> Registros
                            </span>
                            <strong>{group.quantidadeBeneficios}</strong>
                          </S.SummaryItem>

                          <S.SummaryItem>
                            <span>
                              <FiCreditCard size={14} /> Total
                            </span>
                            <strong>R$ {formatMoney(group.total)}</strong>
                          </S.SummaryItem>
                        </S.Summary>
                      </S.CardTop>

                      <S.CardBody>
                        <div>
                          <S.Label>Resumo</S.Label>
                          <S.BenefitTags>
                            <S.Tag $variant={statusVariant}>
                              {getStatusLabel(group.status)}
                              {group.faturamento_progresso != null && ` - ${group.faturamento_progresso}%`}
                            </S.Tag>

                            {group.beneficios.map((beneficio, index) => (
                              <S.Tag key={`${beneficio}-${index}`} $variant="info">
                                {beneficio}
                              </S.Tag>
                            ))}
                          </S.BenefitTags>
                        </div>

                        <S.Docs>
                          <S.Button
                            disabled={!podeBaixar}
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() => baixarDocumento(group.downloadId, 'boleto-original/')}
                          >
                            <FiDownload size={14} />
                            Boleto
                          </S.Button>

                          <S.Button
                            disabled={!podeBaixar}
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() => baixarDocumento(group.downloadId, 'nota-fiscal-original/')}
                          >
                            <FiDownload size={14} />
                            NF
                          </S.Button>

                          <S.Button
                            disabled={!podeBaixar}
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() => baixarDocumento(group.downloadId, 'nota-debito-original/')}
                          >
                            <FiDownload size={14} />
                            Nota Débito
                          </S.Button>

                          <S.Button
                            $variant="primary"
                            disabled={!podeBaixar}
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() => baixarDocumento(group.downloadId, 'originais/')}
                          >
                            <FiDownload size={14} />
                            Baixar todos
                          </S.Button>
                        </S.Docs>
                      </S.CardBody>
                    </S.Card>
                  );
                })
              )}
            </S.List>

            {totalPaginas > 1 && (
              <S.Pagination>
                <S.Button onClick={() => setPaginaAtual((prev) => prev - 1)} disabled={paginaAtual === 1}>
                  Anterior
                </S.Button>
                <span>
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <S.Button onClick={() => setPaginaAtual((prev) => prev + 1)} disabled={paginaAtual === totalPaginas}>
                  Próxima
                </S.Button>
              </S.Pagination>
            )}
          </>
        )}
      </S.Page>
    </PageLayout>
  );
}