import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  FiDollarSign,
  FiCalendar,
  FiFile,
  FiList,
  FiDownload,
  FiSearch,
} from 'react-icons/fi';
import { BiImport } from 'react-icons/bi';

import PendenciasDoDiaModal from '../../components/PendenciasDoDiaModal';
import { entebenService } from '../../services/entebenService';
import { useLoading } from '../../hooks/useLoading';
import PageLayout from '../../Layouts/PageLayout/PageLayout';
import { useAuth } from '../../context/AuthContext.jsx';

import { S } from './DashboardStyles';

const getNumberFrom = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;

    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    const parsed = Number(
      String(value)
        .replace(/\./g, '')
        .replace(',', '.')
    );

    if (!Number.isNaN(parsed)) return parsed;
  }

  return 0;
};

const formatCurrency = (n) =>
  `R$ ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const normTxt = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const onlyDigits = (s) => (s || '').toString().replace(/\D/g, '');

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const isValidId = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '';

const getIdValue = (value) => {
  if (!isValidId(value)) return null;

  if (typeof value === 'object') {
    return (
      [
        value.id,
        value.administradora_id,
        value.id_administradora,
        value.value,
      ].find(isValidId) || null
    );
  }

  return value;
};

const firstValidId = (...values) => {
  for (const value of values) {
    const id = getIdValue(value);

    if (isValidId(id)) {
      return id;
    }
  }

  return null;
};

const getAdministradoraIdFromUser = (user) =>
  user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa || null;

const getAdministradoraIdsFromCondominio = (condominio) => {
  const ids = [];

  if (Array.isArray(condominio?.administradoras)) {
    ids.push(...condominio.administradoras.map(getIdValue).filter(isValidId));
  }

  ids.push(
    getIdValue(condominio?.administradora),
    getIdValue(condominio?.administradora_id),
    getIdValue(condominio?.id_administradora)
  );

  return [...new Set(ids.filter(isValidId).map((id) => String(id).trim()))];
};

const pertenceAAdministradora = (condominio, administradoraId) => {
  const admId = getIdValue(administradoraId);

  if (!isValidId(admId)) return false;

  return getAdministradoraIdsFromCondominio(condominio).some(
    (id) => String(id).trim() === String(admId).trim()
  );
};

// ============================================
// SKELETON COMPONENTS
// ============================================

const SkeletonKPIs = () => (
  <S.KPIs>
    {[...Array(4)].map((_, i) => (
      <S.KPICard key={i} as="div">
        <S.KPITop>
          <S.SkeletonIcon $width="24px" $height="24px" $borderRadius="8px" />
          <S.SkeletonLine $width="120px" $height="16px" />
        </S.KPITop>
        <S.SkeletonLine $width="100px" $height="36px" $marginBottom="10px" />
        <S.SkeletonLine $width="150px" $height="14px" />
      </S.KPICard>
    ))}
  </S.KPIs>
);

const SkeletonHero = () => (
  <S.Hero>
    <div>
      <S.SkeletonLine $width="150px" $height="14px" $marginBottom="12px" />
      <S.SkeletonLine $width="200px" $height="40px" $marginBottom="12px" />
      <S.SkeletonLine $width="400px" $height="16px" />
    </div>
    <S.HeroActions>
      <S.SkeletonButton $width="160px" $height="44px" />
      <S.SkeletonButton $width="140px" $height="44px" />
    </S.HeroActions>
  </S.Hero>
);

const SkeletonImportPanel = () => (
  <S.Panel highlight="true">
    <S.PanelHead>
      <div>
        <S.SkeletonLine $width="80px" $height="14px" $marginBottom="8px" />
        <S.SkeletonLine $width="180px" $height="24px" />
      </div>
    </S.PanelHead>

    <S.ImportMain>
      <S.SkeletonIcon $width="40px" $height="40px" $borderRadius="12px" />
      <S.ImportContent>
        <S.SkeletonLine $width="200px" $height="20px" $marginBottom="8px" />
        <S.SkeletonLine $width="150px" $height="16px" />
      </S.ImportContent>
    </S.ImportMain>

    <S.ImportStats>
      {[...Array(4)].map((_, i) => (
        <S.MiniStat key={i} as="div">
          <S.SkeletonLine $width="80px" $height="12px" $marginBottom="8px" />
          <S.SkeletonLine $width="100px" $height="20px" />
        </S.MiniStat>
      ))}
    </S.ImportStats>

    <S.PanelActions>
      <S.SkeletonButton $width="130px" $height="42px" />
      <S.SkeletonButton $width="140px" $height="42px" />
    </S.PanelActions>
  </S.Panel>
);

const SkeletonSearchPanel = () => (
  <S.Panel>
    <S.PanelHead>
      <div>
        <S.SkeletonLine $width="80px" $height="14px" $marginBottom="8px" />
        <S.SkeletonLine $width="100px" $height="24px" />
      </div>
    </S.PanelHead>

    <S.SearchBox>
      <S.SkeletonIcon $width="18px" $height="18px" />
      <S.SkeletonLine $width="100%" $height="44px" />
    </S.SearchBox>

    <div style={{ marginTop: '12px' }}>
      {[...Array(3)].map((_, i) => (
        <S.SkeletonLine
          key={i}
          $width="100%"
          $height="60px"
          $marginBottom="8px"
          $borderRadius="14px"
        />
      ))}
    </div>
  </S.Panel>
);

const SkeletonActionsPanel = () => (
  <S.Panel>
    <S.PanelHead>
      <div>
        <S.SkeletonLine $width="80px" $height="14px" $marginBottom="8px" />
        <S.SkeletonLine $width="120px" $height="24px" />
      </div>
    </S.PanelHead>

    <S.QuickActions>
      <S.SkeletonButton $width="100%" $height="70px" />
      <S.SkeletonButton $width="100%" $height="70px" />
    </S.QuickActions>
  </S.Panel>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Dashboard() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { startLoading, stopLoading } = useLoading();
  const { user } = useAuth();

  const [ultimaMovimentacao, setUltimaMovimentacao] = useState(null);
  const [historicoImportacoes, setHistoricoImportacoes] = useState([]);
  const [acordos, setAcordos] = useState([]);
  const [condoQuery, setCondoQuery] = useState('');
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [condoModalOpen, setCondoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      startLoading('Carregando dashboard...');

      const administradoraId = getAdministradoraIdFromUser(user);

      if (!administradoraId) {
        console.warn('Usuário sem administradora vinculada:', user);

        setUltimaMovimentacao(null);
        setHistoricoImportacoes([]);
        setAcordos([]);

        enqueueSnackbar('Usuário sem administradora vinculada', {
          variant: 'warning',
        });

        return;
      }

      const [ultima, historico, acordosData] = await Promise.all([
        entebenService.getUltimaMovimentacao(),
        entebenService.getImportacoes(),
        entebenService.getcondominios({
          administradora_id: administradoraId,
        }),
      ]);

      const condominiosRecebidos = toArray(acordosData);

      const condominiosFiltrados = condominiosRecebidos.filter((condominio) => {
        const idsAdministradora = getAdministradoraIdsFromCondominio(condominio);

        if (idsAdministradora.length === 0) return true;

        return pertenceAAdministradora(condominio, administradoraId);
      });

      setUltimaMovimentacao(ultima);
      setHistoricoImportacoes(toArray(historico));
      setAcordos(condominiosFiltrados);
    } catch (e) {
      enqueueSnackbar('Erro ao carregar dados do dashboard', { variant: 'error' });
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const todayStr = useMemo(() => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const pendencias = useMemo(
    () =>
      acordos.filter(
        (a) => a.status !== 'Fechado' && a.vencimento <= todayStr
      ),
    [acordos, todayStr]
  );

  const condoResults = useMemo(() => {
    const qTxt = normTxt(condoQuery);
    const qDigits = onlyDigits(condoQuery);

    if (!qTxt) return [];

    return acordos
      .filter((c) => {
        const nome =
          c.nome ||
          c.condominio ||
          c.razao_social ||
          c.fantasia ||
          c.nome_condominio ||
          '';

        const cnpj =
          c.cnpj || c.cnpj_condominio || c.documento || c.cgc || '';

        return (
          normTxt(nome).includes(qTxt) ||
          (qDigits && onlyDigits(cnpj).includes(qDigits))
        );
      })
      .slice(0, 8);
  }, [acordos, condoQuery]);

  const getStatusValue = (item) =>
    item?.status ||
    item?.situacao ||
    item?.status_faturamento ||
    item?.status_importacao ||
    '';

  const isFechado = (item) => {
    const status = normTxt(getStatusValue(item));

    return (
      status.includes('fechado') ||
      status.includes('concluido') ||
      status.includes('concluida') ||
      status.includes('finalizado') ||
      status.includes('finalizada')
    );
  };

  const getValorCondominio = (item) =>
    getNumberFrom(
      item?.valor,
      item?.valor_total,
      item?.total,
      item?.faturamento,
      item?.ultimo_faturamento,
      item?.valor_ultimo_faturamento,
      item?.ultimo_valor_faturado,
      item?.total_beneficios,
      item?.valor_total_beneficios
    );

  const totalImportacoes = getNumberFrom(
    historicoImportacoes.length,
    ultimaMovimentacao?.total_importacoes,
    ultimaMovimentacao?.quantidade_importacoes
  );

  const faturamentoTotalCondominios = acordos.reduce(
    (sum, item) => sum + getValorCondominio(item),
    0
  );

  const totalAberto = acordos.filter((item) => !isFechado(item)).length;

  const totalCondominios = acordos.length;

  const getImportName = () =>
    ultimaMovimentacao?.importacao_nome ||
    `IMP-${ultimaMovimentacao?.id || 'última'}`;

  const getImportStatus = () => {
    const status = ultimaMovimentacao?.status || 'processado';

    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'FAILED') return 'danger';

    return 'info';
  };

  const importacaoId = ultimaMovimentacao?.id || null;

  const getCondoNome = (c) =>
    c?.nome ||
    c?.condominio ||
    c?.razao_social ||
    c?.fantasia ||
    c?.nome_condominio ||
    `Condomínio #${c?.id}`;

  const getCondoCnpj = (c) =>
    c?.cnpj || c?.cnpj_condominio || c?.documento || c?.cgc || '—';

  const getCondoEndereco = (c) =>
    c?.endereco ||
    c?.logradouro ||
    c?.endereco_completo ||
    [c?.rua, c?.numero, c?.bairro].filter(Boolean).join(', ') ||
    '—';

  const getCondoContato = (c) => c?.telefone || c?.contato || c?.email || '—';

  const getQtdFuncionarios = (c) =>
    c?.quantidade_funcionarios ||
    c?.total_funcionarios ||
    c?.qtd_funcionarios ||
    c?.funcionarios_count ||
    c?.funcionarios?.length ||
    '—';

  const getUltimoFaturamento = (c) =>
    c?.ultimo_faturamento ||
    c?.valor_ultimo_faturamento ||
    c?.ultimo_valor_faturado ||
    c?.faturamento ||
    c?.valor ||
    null;

  const getVencimento = (c) =>
    c?.vencimento || c?.data_vencimento || c?.proximo_vencimento || '—';

  const ultimaSummary =
    ultimaMovimentacao?.summary ||
    ultimaMovimentacao?.resumo ||
    ultimaMovimentacao?.data_to_backend?.summary ||
    {};

  const valorTotalUltimaImportacao = getNumberFrom(
    ultimaMovimentacao?.valor_total_beneficios,
    ultimaMovimentacao?.valor_total,
    ultimaMovimentacao?.total_valor,
    ultimaMovimentacao?.valor,
    ultimaSummary?.valor_total_beneficios,
    ultimaSummary?.valor_total,
    ultimaSummary?.total_valor,
    ultimaSummary?.valor_total_importacao,
    ultimaSummary?.valor_total_faturamento,
    faturamentoTotalCondominios
  );

  const totalFuncionariosUltimaImportacao = getNumberFrom(
    ultimaMovimentacao?.total_funcionarios,
    ultimaMovimentacao?.total_colaboradores,
    ultimaMovimentacao?.quantidade_funcionarios,
    ultimaSummary?.total_funcionarios,
    ultimaSummary?.total_colaboradores,
    ultimaSummary?.quantidade_funcionarios
  );

  const totalMovimentacoesUltimaImportacao = getNumberFrom(
    ultimaMovimentacao?.total_movimentacoes,
    ultimaMovimentacao?.quantidade_movimentacoes,
    ultimaMovimentacao?.movimentacoes_count,
    ultimaSummary?.total_movimentacoes,
    ultimaSummary?.quantidade_movimentacoes,
    ultimaMovimentacao?.movimentacoes_detalhada?.length,
    ultimaMovimentacao?.data_to_backend?.movimentacoes_detalhada?.length
  );

  const totalCondominiosUltimaImportacao = getNumberFrom(
    ultimaMovimentacao?.total_condominios,
    ultimaMovimentacao?.quantidade_condominios,
    ultimaSummary?.total_condominios,
    ultimaSummary?.quantidade_condominios,
    ultimaMovimentacao?.condominios?.length,
    ultimaMovimentacao?.data_to_backend?.condominios?.length,
    totalCondominios
  );

  const closeCondoModal = () => {
    setCondoModalOpen(false);
    setSelectedCondo(null);
    setCondoQuery('');
  };

  // Planilha da última importação, direto do S3.
  //
  // Antes este botão gerava um Excel de faturamento via
  // /api/upload/export/faturamento/, que é um relatório montado pelo backend —
  // não a planilha que a administradora enviou. Agora entrega o arquivo real,
  // com a mesma prioridade usada no dashboard do colaborador: a versão editada
  // (gerada quando o usuário corrige dados na confirmação) e, na falta dela, a
  // original.
  const planilhaUltimaImportacao =
    ultimaMovimentacao?.arquivo_s3_editado || ultimaMovimentacao?.arquivo_s3 || null;

  const handleDownloadExcel = () => {
    if (!importacaoId) {
      enqueueSnackbar('Nenhuma importação encontrada.', { variant: 'warning' });
      return;
    }

    if (!planilhaUltimaImportacao) {
      enqueueSnackbar(
        'A planilha desta importação não está disponível no armazenamento.',
        { variant: 'warning' }
      );
      return;
    }

    window.open(planilhaUltimaImportacao, '_blank', 'noopener,noreferrer');
  };

  const getSaudacao = () => {
    const hora = new Date().getHours();

    if (hora >= 6 && hora < 12) return 'Bom dia,';
    if (hora >= 12 && hora < 18) return 'Boa tarde,';

    return 'Boa noite,';
  };

  return (
    <PageLayout
      title={`${getSaudacao()} ${user?.nome || user?.username || user?.email || 'Usuário'
        }!`}
      subtitle="Acompanhe importações, faturamento, pendências e documentos em um só lugar."
    >
      <S.Root>
        <PendenciasDoDiaModal
          items={pendencias}
          onGoToPendentes={() => navigate('/pendentes')}
        />

        <S.Body>
          {isLoading ? (
            <>
              <SkeletonHero />
              <SkeletonKPIs />

              <S.GridMain>
                <SkeletonImportPanel />

                <S.SideStack>
                  <SkeletonSearchPanel />
                  <SkeletonActionsPanel />
                </S.SideStack>
              </S.GridMain>
            </>
          ) : (
            <>
              <S.Hero>
                <div>
                  <S.Eyebrow>Portal de Benefícios</S.Eyebrow>
                  <S.Title>Visão Geral</S.Title>
                  <S.Subtitle>
                    Acompanhe importações, faturamento, pendências e documentos
                    em um só lugar.
                  </S.Subtitle>
                </div>

                <S.HeroActions>
                  <S.Button
                    variant="primary"
                    onClick={() => navigate('/importacao')}
                  >
                    <BiImport size={18} />
                    Nova importação
                  </S.Button>

                  <S.Button
                    variant="secondary"
                    onClick={() => navigate('/faturamento')}
                  >
                    <FiDollarSign size={18} />
                    Ir para faturamento
                  </S.Button>
                </S.HeroActions>
              </S.Hero>

              <S.KPIs>
                <S.KPICard onClick={() => navigate('/faturamento')}>
                  <S.KPITop>
                    <FiDollarSign size={18} />
                    <S.KPILabel>Faturamento total</S.KPILabel>
                  </S.KPITop>

                  <S.KPIValue>
                    {formatCurrency(
                      faturamentoTotalCondominios > 0
                        ? faturamentoTotalCondominios
                        : valorTotalUltimaImportacao
                    )}
                  </S.KPIValue>
                  <S.KPIFoot>Base filtrada da administradora</S.KPIFoot>
                </S.KPICard>

                <S.KPICard onClick={() => navigate('/gerenciamento')}>
                  <S.KPITop>
                    <FiCalendar size={18} />
                    <S.KPILabel>Gerenciamento de Condomínios</S.KPILabel>
                  </S.KPITop>

                  <S.KPIValue>{totalAberto}</S.KPIValue>

                  <S.KPIFoot>
                    {pendencias.length > 0
                      ? `${pendencias.length} condomínio${pendencias.length > 1 ? 's' : ''
                      } com vencimento pendente`
                      : 'Nenhuma pendência vencida'}
                  </S.KPIFoot>
                </S.KPICard>

                <S.KPICard onClick={() => navigate('/importacao')}>
                  <S.KPITop>
                    <FiFile size={18} />
                    <S.KPILabel>Importações</S.KPILabel>
                  </S.KPITop>

                  <S.KPIValue>{totalImportacoes}</S.KPIValue>

                  <S.KPIFoot>
                    {ultimaMovimentacao
                      ? `Última: ${getImportName()}`
                      : 'Sem importações'}
                  </S.KPIFoot>
                </S.KPICard>

                <S.KPICard as="div">
                  <S.KPITop>
                    <FiList size={18} />
                    <S.KPILabel>Condomínios</S.KPILabel>
                  </S.KPITop>

                  <S.KPIValue>{totalCondominios}</S.KPIValue>
                  <S.KPIFoot>Base monitorada da administradora</S.KPIFoot>
                </S.KPICard>
              </S.KPIs>

              <S.GridMain>
                <S.Panel highlight="true">
                  <S.PanelHead>
                    <div>
                      <S.PanelEyebrow>Importação</S.PanelEyebrow>
                      <S.PanelTitle>Última movimentação</S.PanelTitle>
                    </div>
                  </S.PanelHead>

                  {ultimaMovimentacao ? (
                    <>
                      <S.ImportMain>
                        <S.ImportIcon>
                          <FiFile size={18} />
                        </S.ImportIcon>

                        <S.ImportContent>
                          <S.ImportName>{getImportName()}</S.ImportName>

                          <S.ImportMeta>
                            <span>
                              {ultimaMovimentacao.data_importacao
                                ? new Date(
                                  ultimaMovimentacao.data_importacao
                                ).toLocaleDateString('pt-BR')
                                : '—'}
                            </span>

                            <S.Badge status={getImportStatus()}>
                              {getImportStatus() === 'success'
                                ? 'Concluído'
                                : getImportStatus() === 'warning'
                                  ? 'Processando'
                                  : getImportStatus() === 'danger'
                                    ? 'Erro'
                                    : 'Processado'}
                            </S.Badge>
                          </S.ImportMeta>
                        </S.ImportContent>
                      </S.ImportMain>

                      <S.ImportStats>
                        <S.MiniStat>
                          <S.MiniLabel>Valor total</S.MiniLabel>
                          <strong>{formatCurrency(valorTotalUltimaImportacao)}</strong>
                        </S.MiniStat>

                        <S.MiniStat>
                          <S.MiniLabel>Colaboradores</S.MiniLabel>
                          <strong>{totalFuncionariosUltimaImportacao}</strong>
                        </S.MiniStat>

                        <S.MiniStat>
                          <S.MiniLabel>Movimentações</S.MiniLabel>
                          <strong>{totalMovimentacoesUltimaImportacao}</strong>
                        </S.MiniStat>

                        <S.MiniStat>
                          <S.MiniLabel>Condomínios</S.MiniLabel>
                          <strong>{totalCondominiosUltimaImportacao}</strong>
                        </S.MiniStat>
                      </S.ImportStats>

                      <S.PanelActions>
                        <S.Button variant="success" onClick={handleDownloadExcel}>
                          <FiDownload size={18} />
                          Baixar Excel
                        </S.Button>

                        <S.Button
                          variant="secondary"
                          onClick={() => navigate('/importacao')}
                        >
                          <BiImport size={18} />
                          Nova importação
                        </S.Button>
                      </S.PanelActions>
                    </>
                  ) : (
                    <S.EmptyState>
                      <FiFile size={18} />
                      <p>Nenhuma importação encontrada.</p>

                      <S.Button
                        variant="primary"
                        onClick={() => navigate('/importacao')}
                      >
                        <BiImport size={18} />
                        Iniciar primeira importação
                      </S.Button>
                    </S.EmptyState>
                  )}
                </S.Panel>

                <S.SideStack>
                  <S.Panel>
                    <S.PanelHead>
                      <div>
                        <S.PanelEyebrow>Busca rápida</S.PanelEyebrow>
                        <S.PanelTitle>Condomínio</S.PanelTitle>
                      </div>
                    </S.PanelHead>

                    <S.SearchBox>
                      <S.SearchIcon>
                        <FiSearch size={18} />
                      </S.SearchIcon>

                      <input
                        value={condoQuery}
                        onChange={(e) => {
                          setCondoQuery(e.target.value);
                          setSelectedCondo(null);
                        }}
                        placeholder="Pesquisar por nome ou CNPJ"
                      />

                      {condoQuery && (
                        <S.SearchClear
                          onClick={() => {
                            setCondoQuery('');
                            setSelectedCondo(null);
                          }}
                          type="button"
                          aria-label="Limpar busca"
                        >
                          ×
                        </S.SearchClear>
                      )}
                    </S.SearchBox>

                    {condoQuery &&
                      !selectedCondo &&
                      condoResults.length > 0 && (
                        <S.SearchResults>
                          {condoResults.map((c) => {
                            const nome = getCondoNome(c);
                            const cnpj =
                              c.cnpj ||
                              c.cnpj_condominio ||
                              c.documento ||
                              c.cgc ||
                              '';

                            return (
                              <S.SearchItem
                                key={c.id ?? `${nome}-${cnpj}`}
                                type="button"
                                onClick={() => {
                                  setSelectedCondo(c);
                                  setCondoQuery(nome);
                                  setCondoModalOpen(true);
                                }}
                              >
                                <strong>{nome}</strong>
                                <span>
                                  {cnpj
                                    ? `CNPJ: ${cnpj}`
                                    : 'CNPJ não informado'}
                                </span>
                              </S.SearchItem>
                            );
                          })}
                        </S.SearchResults>
                      )}

                    {condoQuery &&
                      !selectedCondo &&
                      condoResults.length === 0 && (
                        <S.EmptyInline>
                          Nenhum condomínio encontrado.
                        </S.EmptyInline>
                      )}
                  </S.Panel>

                  <S.Panel>
                    <S.PanelHead>
                      <div>
                        <S.PanelEyebrow>Ações</S.PanelEyebrow>
                        <S.PanelTitle>Atalhos rápidos</S.PanelTitle>
                      </div>
                    </S.PanelHead>

                    <S.QuickActions>
                      <S.QuickBtn onClick={() => navigate('/importacao')}>
                        <BiImport size={18} />
                        <div>
                          <strong>Nova importação</strong>
                          <span>Importe planilhas e arquivos</span>
                        </div>
                      </S.QuickBtn>

                      <S.QuickBtn
                        onClick={() =>
                          navigate('/faturamento/repetir', {
                            state: {
                              importacaoId,
                              faturamentoId: importacaoId,
                              ultimaImportacao: ultimaMovimentacao,
                            },
                          })
                        }
                        disabled={!importacaoId}
                      >
                        <FiFile size={18} />
                        <div>
                          <strong>Repetir faturamento</strong>
                          <span>
                            {importacaoId
                              ? 'Use a base anterior'
                              : 'Sem base anterior'}
                          </span>
                        </div>
                      </S.QuickBtn>
                    </S.QuickActions>
                  </S.Panel>
                </S.SideStack>
              </S.GridMain>
            </>
          )}
        </S.Body>

        {condoModalOpen && selectedCondo && (
          <S.ModalOverlay
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeCondoModal();
              }
            }}
          >
            <S.Modal role="dialog" aria-modal="true">
              <S.ModalHeader>
                <div>
                  <S.PanelEyebrow>Condomínio</S.PanelEyebrow>
                  <S.ModalTitle>{getCondoNome(selectedCondo)}</S.ModalTitle>
                </div>

                <S.ModalClose onClick={closeCondoModal}>×</S.ModalClose>
              </S.ModalHeader>

              <S.ModalBody>
                <S.ModalStatusRow>
                  <S.Badge
                    status={
                      selectedCondo.status === 'Fechado'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {selectedCondo.status || 'Ativo'}
                  </S.Badge>
                </S.ModalStatusRow>

                <S.ModalGrid>
                  <S.ModalInfo>
                    <S.MiniLabel>CNPJ</S.MiniLabel>
                    <strong>{getCondoCnpj(selectedCondo)}</strong>
                  </S.ModalInfo>

                  <S.ModalInfo>
                    <S.MiniLabel>Cidade / UF</S.MiniLabel>
                    <strong>
                      {selectedCondo.cidade || '—'}
                      {selectedCondo.uf ? ` / ${selectedCondo.uf}` : ''}
                    </strong>
                  </S.ModalInfo>

                  <S.ModalInfo className="full">
                    <S.MiniLabel>Endereço</S.MiniLabel>
                    <strong>{getCondoEndereco(selectedCondo)}</strong>
                  </S.ModalInfo>

                  {selectedCondo.bairro && (
                    <S.ModalInfo>
                      <S.MiniLabel>Bairro</S.MiniLabel>
                      <strong>{selectedCondo.bairro}</strong>
                    </S.ModalInfo>
                  )}

                  {selectedCondo.cep && (
                    <S.ModalInfo>
                      <S.MiniLabel>CEP</S.MiniLabel>
                      <strong>{selectedCondo.cep}</strong>
                    </S.ModalInfo>
                  )}

                  <S.ModalInfo>
                    <S.MiniLabel>Contato</S.MiniLabel>
                    <strong>{getCondoContato(selectedCondo)}</strong>
                  </S.ModalInfo>

                  <S.ModalInfo>
                    <S.MiniLabel>Quantidade de funcionários</S.MiniLabel>
                    <strong>{getQtdFuncionarios(selectedCondo)}</strong>
                  </S.ModalInfo>

                  <S.ModalInfo>
                    <S.MiniLabel>Último faturamento registrado</S.MiniLabel>
                    <strong>
                      {getUltimoFaturamento(selectedCondo) != null
                        ? formatCurrency(getUltimoFaturamento(selectedCondo))
                        : '—'}
                    </strong>
                  </S.ModalInfo>

                  <S.ModalInfo>
                    <S.MiniLabel>Vencimento</S.MiniLabel>
                    <strong>{getVencimento(selectedCondo)}</strong>
                  </S.ModalInfo>

                  {selectedCondo.email && (
                    <S.ModalInfo>
                      <S.MiniLabel>E-mail</S.MiniLabel>
                      <strong>{selectedCondo.email}</strong>
                    </S.ModalInfo>
                  )}
                </S.ModalGrid>

                <S.ModalActions>
                  <S.Button
                    variant="secondary"
                    onClick={() => navigate('/faturamento')}
                  >
                    Ver faturamento
                  </S.Button>

                  <S.Button variant="primary" onClick={closeCondoModal}>
                    Fechar
                  </S.Button>
                </S.ModalActions>
              </S.ModalBody>
            </S.Modal>
          </S.ModalOverlay>
        )}
      </S.Root>
    </PageLayout>
  );
}