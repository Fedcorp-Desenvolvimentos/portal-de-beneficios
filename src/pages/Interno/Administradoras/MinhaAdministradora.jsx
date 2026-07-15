// pages/Interno/Administradoras/MinhaAdministradora.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  buscarAdministradoraPorId,
  buscarRegraValorAdministradora,
  atualizarRegraValorAdministradora,
  criarRegraValorAdministradora,
} from '../../../services/administradoraService.js';
import { userService } from '../../../services/userService.js';
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx';
import { useLoading } from '../../../hooks/useLoading.js';
import UsuarioTable from '../Usuarios/UsuarioTable.jsx';
import UsuarioModal from '../Usuarios/UsuarioModal.jsx';
import { S } from './AdministradorasStyles.js';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function normalizarValorDecimal(value) {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
}

function getAdministradoraIdFromUser(user) {
  if (user?.administradora_ativa_id || user?.administradora_ativa) {
    return user.administradora_ativa_id || user.administradora_ativa;
  }

  if (Array.isArray(user?.administradoras) && user.administradoras.length > 0) {
    return user.administradoras;
  }

  return (
    user?.administradora_id ||
    user?.administradora?.id ||
    user?.administradora ||
    user?.id_administradora ||
    null
  );
}

function getAdministradoraNomeFromUser(user) {
  if (user?.administradora_ativa_id || user?.administradora_ativa) {
    const adminsData = user?.administradoras_data || [];
    const active = adminsData.find(a => a.id === (user.administradora_ativa_id || user.administradora_ativa));
    if (active) return active.razao_social || active.nome_fantasia || '';
  }

  return (
    user?.administradora_nome ||
    user?.nome_administradora ||
    user?.administradora?.nome ||
    user?.administradora?.razao_social ||
    user?.administradora?.nome_fantasia ||
    ''
  );
}

function getAdministradoraNome(administradora, user) {
  return (
    administradora?.nome ||
    administradora?.nome_fantasia ||
    administradora?.razao_social ||
    getAdministradoraNomeFromUser(user) ||
    '-'
  );
}

function getTipoUsuario(user) {
  return user?.tipo_usuario || user?.tipo || user?.role || user?.perfil || '';
}

function getTipoUsuarioItem(usuario) {
  return (
    usuario?.tipo_usuario ||
    usuario?.tipo ||
    usuario?.role ||
    usuario?.perfil ||
    ''
  );
}

function isTipoGerenciavelNaAdministradora(tipo) {
  return ['adm', 'dep'].includes(tipo);
}

const RegraValorModal = ({
  open,
  onClose,
  onSave,
  regraValor,
  valorLimite,
  setValorLimite,
  regraAtiva,
  setRegraAtiva,
  d_mais,
  setD_mais,
  saving,
  podeVerDmais,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Limitador de Crédito</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
              Configure uma trava de valor para bloquear importações acima do limite.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              border: 0,
              background: 'transparent',
              fontSize: 24,
              cursor: saving ? 'not-allowed' : 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {regraValor ? (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>
              Regra cadastrada
            </strong>

            <span style={{ color: '#475569', fontSize: 14 }}>
              Status: {regraValor?.ativo ? 'Ativa' : 'Inativa'} • Limite:{' '}
              {formatCurrency(regraValor?.valor_limite)}
            </span>
          </div>
        ) : (
          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 12,
              padding: 14,
              marginBottom: 18,
              color: '#9a3412',
            }}
          >
            Nenhuma regra cadastrada para esta administradora.
          </div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <input
              type="checkbox"
              checked={regraAtiva}
              onChange={(e) => setRegraAtiva(e.target.checked)}
              disabled={saving}
            />
            Ativar bloqueio por valor
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>
              Bloquear valores acima de
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={valorLimite}
              onChange={(e) => setValorLimite(e.target.value)}
              placeholder="Ex: 2500"
              disabled={saving}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 15,
              }}
            />

            <small style={{ color: '#64748b' }}>
              Quando ativo, colaboradores com valor total acima deste limite serão bloqueados na importação.
            </small>
          </label>

          {podeVerDmais && (
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>
                D+ (Dias para Recebimento do Benefício)
              </span>

              <select
                value={d_mais}
                onChange={(e) => setD_mais(e.target.value)}
                disabled={saving}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 15,
                  background: '#fff',
                }}
              >
                <option value="">Selecionar</option>
                <option value="0">0 dias (mesma data do vencimento)</option>
                <option value="1">1 dia</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="4">4 dias</option>
                <option value="5">5 dias</option>
                <option value="7">7 dias</option>
                <option value="10">10 dias</option>
                <option value="15">15 dias</option>
                <option value="20">20 dias</option>
                <option value="30">30 dias</option>
              </select>

              <small style={{ color: '#64748b' }}>
                Define em quantos dias após o vencimento o benefício será recebido.
              </small>
            </label>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 24,
          }}
        >
          <S.Button
            $variant="secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </S.Button>

          <S.Button
            $variant="primary"
            type="button"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : regraValor ? 'Atualizar regra' : 'Cadastrar regra'}
          </S.Button>
        </div>
      </div>
    </div>
  );
};

const SkeletonDadosCard = () => (
  <S.Card>
    <h2>Dados Gerais</h2>

    <S.DetailsGrid>
      {[...Array(8)].map((_, i) => (
        <S.DetailItem key={i}>
          <span>
            <S.SkeletonLine $width="60px" $height="12px" />
          </span>

          <strong>
            <S.SkeletonLine $width="180px" $height="20px" />
          </strong>
        </S.DetailItem>
      ))}
    </S.DetailsGrid>
  </S.Card>
);

const SkeletonUsuariosCard = () => (
  <S.Card>
    <S.CardHeader>
      <div>
        <h2>
          <S.SkeletonLine $width="200px" $height="24px" $marginBottom="8px" />
        </h2>

        <div>
          <S.SkeletonLine $width="300px" $height="16px" />
        </div>
      </div>

      <S.Button $variant="primary" disabled>
        <S.SkeletonLine $width="120px" $height="20px" />
      </S.Button>
    </S.CardHeader>

    <S.TableWrapper>
      <S.Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {[...Array(3)].map((_, i) => (
            <tr key={i}>
              <td>
                <S.SkeletonLine $width="150px" $height="16px" />
              </td>

              <td>
                <S.SkeletonLine $width="200px" $height="16px" />
              </td>

              <td>
                <S.SkeletonLine $width="100px" $height="16px" />
              </td>

              <td>
                <S.SkeletonLine $width="80px" $height="16px" />
              </td>
            </tr>
          ))}
        </tbody>
      </S.Table>
    </S.TableWrapper>
  </S.Card>
);

const SkeletonHeader = () => (
  <S.Header>
    <div>
      <h1>
        <S.SkeletonLine $width="250px" $height="32px" $marginBottom="8px" />
      </h1>

      <div>
        <S.SkeletonLine $width="200px" $height="16px" />
      </div>
    </div>

    <S.HeaderActions>
      <S.Button $variant="secondary" disabled>
        <S.SkeletonLine $width="80px" $height="16px" />
      </S.Button>
    </S.HeaderActions>
  </S.Header>
);

export default function MinhaAdministradora() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [administradora, setAdministradora] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [administradoras, setAdministradoras] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingAdm, setLoadingAdm] = useState(false);

  const [modalRegraValorOpen, setModalRegraValorOpen] = useState(false);
  const [regraValor, setRegraValor] = useState(null);
  const [valorLimite, setValorLimite] = useState('');
  const [regraAtiva, setRegraAtiva] = useState(true);
  const [d_mais, setD_mais] = useState('');
  const [loadingRegraValor, setLoadingRegraValor] = useState(false);
  const [salvandoRegraValor, setSalvandoRegraValor] = useState(false);

  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { startLoading, stopLoading } = useLoading();

  const administradoraId = getAdministradoraIdFromUser(user);
  const administradoraNome = getAdministradoraNome(administradora, user);

  const tipoUsuarioLogado = getTipoUsuario(user);

  const usuarioPodeGerenciarUsuarios = ['fat', 'dev'].includes(tipoUsuarioLogado);

  const podeCadastrarUsuario = usuarioPodeGerenciarUsuarios;
  const podeAlterarTipoUsuario = usuarioPodeGerenciarUsuarios;

  const podeGerenciarRegraValor = ['dev', 'adm', 'dep', 'fat'].includes(tipoUsuarioLogado);

  const tipoUsuarioSelecionado = getTipoUsuarioItem(usuarioSelecionado);

  const tiposPermitidosNoModal = podeAlterarTipoUsuario
    ? ['adm', 'dep']
    : [
      isTipoGerenciavelNaAdministradora(tipoUsuarioSelecionado)
        ? tipoUsuarioSelecionado
        : 'adm',
    ];

  useEffect(() => {
    if (!administradoraId) {
      enqueueSnackbar('Usuário não possui administradora vinculada', {
        variant: 'error',
      });
      navigate('/interno/administradoras');
      return;
    }

    carregarAdministradora();
    carregarUsuarios();
    carregarAdministradoras();
    carregarRegraValor();
  }, [administradoraId]);

  const carregarAdministradoras = async () => {
    try {
      const data = await userService.listarAdministradoras();
      setAdministradoras(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error);
      setAdministradoras([]);
    }
  };

  const carregarAdministradora = async () => {
    try {
      setLoadingAdm(true);
      startLoading('Carregando administradora...');

      const data = await buscarAdministradoraPorId(administradoraId);
      setAdministradora(data);
    } catch (error) {
      console.error('❌ Erro ao carregar administradora:', error);
      enqueueSnackbar('Erro ao carregar administradora', { variant: 'error' });
      navigate('/interno/administradoras');
    } finally {
      setLoadingAdm(false);
      stopLoading();
    }
  };

  const carregarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      startLoading('Carregando usuários...');

      const usuariosFiltrados = await userService.listarUsuarios({
        administradora: administradoraId,
      });

      const lista = Array.isArray(usuariosFiltrados)
        ? usuariosFiltrados
        : usuariosFiltrados?.results || [];

      const listaTratada = lista.map((usuario) => ({
        ...usuario,
        administradora_nome:
          usuario.administradora_nome ||
          usuario.nome_administradora ||
          usuario.administradora?.nome ||
          usuario.administradora?.razao_social ||
          usuario.administradora?.nome_fantasia ||
          administradoraNome ||
          '-',
      }));

      const listaSegura = usuarioPodeGerenciarUsuarios
        ? listaTratada
        : listaTratada.filter((usuario) =>
          isTipoGerenciavelNaAdministradora(getTipoUsuarioItem(usuario))
        );

      setUsuarios(listaSegura);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
      stopLoading();
    }
  };

  const carregarRegraValor = async () => {
    try {
      setLoadingRegraValor(true);

      const data = await buscarRegraValorAdministradora(administradoraId);
      const regraEncontrada = Array.isArray(data) ? data[0] || null : data || null;

      setRegraValor(regraEncontrada);

      if (regraEncontrada) {
        setRegraAtiva(Boolean(regraEncontrada.ativo));
        setValorLimite(normalizarValorDecimal(regraEncontrada.valor_limite));
        setD_mais(regraEncontrada.d_mais != null ? String(regraEncontrada.d_mais) : '');
      } else {
        setRegraAtiva(true);
        setValorLimite('');
        setD_mais('');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar regra de valor:', error);
      setRegraValor(null);
      setRegraAtiva(true);
      setValorLimite('');
      setD_mais('');
    } finally {
      setLoadingRegraValor(false);
    }
  };

  const abrirModalRegraValor = async () => {
    setModalRegraValorOpen(true);
    await carregarRegraValor();
  };

  const fecharModalRegraValor = () => {
    if (salvandoRegraValor) return;
    setModalRegraValorOpen(false);
  };

  const handleSalvarRegraValor = async () => {
    try {
      const valorNumerico = Number(valorLimite);

      if (
        regraAtiva &&
        (!valorLimite || Number.isNaN(valorNumerico) || valorNumerico <= 0)
      ) {
        enqueueSnackbar('Informe um valor limite válido para ativar a regra', {
          variant: 'warning',
        });
        return;
      }

      setSalvandoRegraValor(true);

      const payload = {
        administradora_id: administradoraId,
        ativo: regraAtiva,
        valor_limite: regraAtiva ? valorNumerico : null,
        bloquear_acima_limite: regraAtiva,
        d_mais: d_mais !== '' ? Number(d_mais) : null,
      };

      let regraSalva;

      if (regraValor?.id) {
        regraSalva = await atualizarRegraValorAdministradora(
          administradoraId,
          regraValor.id,
          payload
        );
      } else {
        regraSalva = await criarRegraValorAdministradora(administradoraId, payload);
      }

      setRegraValor(regraSalva || payload);
      setRegraAtiva(Boolean((regraSalva || payload)?.ativo));
      setValorLimite(normalizarValorDecimal((regraSalva || payload)?.valor_limite));
      setD_mais((regraSalva || payload)?.d_mais != null ? String((regraSalva || payload).d_mais) : '');

      await carregarRegraValor();

      enqueueSnackbar('Regra de valor salva com sucesso', { variant: 'success' });
      setModalRegraValorOpen(false);
    } catch (error) {
      console.error('❌ Erro ao salvar regra de valor:', error);

      enqueueSnackbar(error.message || 'Erro ao salvar regra de valor', {
        variant: 'error',
      });
    } finally {
      setSalvandoRegraValor(false);
    }
  };

  const handleEditarUsuario = (usuario) => {
    const tipoUsuarioEditado = getTipoUsuarioItem(usuario);

    if (
      !usuarioPodeGerenciarUsuarios &&
      !isTipoGerenciavelNaAdministradora(tipoUsuarioEditado)
    ) {
      enqueueSnackbar('Você não tem permissão para editar este tipo de usuário', {
        variant: 'warning',
      });
      return;
    }

    setUsuarioSelecionado(usuario);
    setModalOpen(true);
  };

  const handleNovoUsuario = () => {
    if (!podeCadastrarUsuario) {
      enqueueSnackbar('Apenas usuário faturista ou desenvolvedor pode cadastrar novos usuários', {
        variant: 'warning',
      });
      return;
    }

    setUsuarioSelecionado(null);
    setModalOpen(true);
  };

  const handleExcluirUsuario = async (usuario) => {
    const tipoUsuarioExcluido = getTipoUsuarioItem(usuario);

    if (
      !usuarioPodeGerenciarUsuarios &&
      !isTipoGerenciavelNaAdministradora(tipoUsuarioExcluido)
    ) {
      enqueueSnackbar('Você não tem permissão para excluir este tipo de usuário', {
        variant: 'warning',
      });
      return;
    }

    setUsuarioToDelete(usuario);
    setShowDeleteModal(true);
  };

  const confirmarExclusaoUsuario = async () => {
    if (!usuarioToDelete) return;

    try {
      await userService.excluirUsuario(usuarioToDelete.id);
      enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
      setShowDeleteModal(false);
      setUsuarioToDelete(null);
      await carregarUsuarios();
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
    }
  };

  const fecharModalExclusao = () => {
    setShowDeleteModal(false);
    setUsuarioToDelete(null);
  };

  const resolverTipoPermitidoParaSalvar = (dados) => {
    if (podeAlterarTipoUsuario) {
      return dados.tipo || 'adm';
    }

    if (usuarioSelecionado) {
      const tipoOriginal = getTipoUsuarioItem(usuarioSelecionado);

      if (!isTipoGerenciavelNaAdministradora(tipoOriginal)) {
        throw new Error('Você não tem permissão para alterar este tipo de usuário');
      }

      return tipoOriginal;
    }

    return 'adm';
  };

  const handleSalvarUsuario = async (dados) => {
    try {
      if (!usuarioSelecionado && !podeCadastrarUsuario) {
        enqueueSnackbar('Apenas usuário faturista ou desenvolvedor pode cadastrar novos usuários', {
          variant: 'warning',
        });
        return;
      }

      const tipoFinal = resolverTipoPermitidoParaSalvar(dados);

      const payload = {
        ...dados,
        tipo: tipoFinal,
        administradoras: dados.administradoras || (dados.administradora ? [dados.administradora] : [administradoraId]),
      };

      if (usuarioSelecionado) {
        await userService.atualizarUsuario(usuarioSelecionado.id, payload);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        await userService.criarUsuario(payload);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }

      await carregarUsuarios();

      setModalOpen(false);
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);

      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao salvar usuário';

      enqueueSnackbar(errorMsg, { variant: 'error' });
      throw error;
    }
  };

  const isLoading = loadingAdm || loadingUsuarios;

  return (
    <PageLayout
      title="Minha Administradora"
      subtitle="Visualize os detalhes da sua administradora e gerencie os usuários vinculados a ela."
    >
      <S.Container>
        {isLoading ? (
          <>
            <SkeletonHeader />
            <SkeletonDadosCard />
            <SkeletonUsuariosCard />
          </>
        ) : (
          <>
            <S.Header>
              <S.HeaderActions>
                <S.Button
                  $variant="secondary"
                  onClick={() => navigate('/interno/administradoras')}
                >
                  Voltar
                </S.Button>

                {podeGerenciarRegraValor && (
                  <S.Button
                    $variant="secondary"
                    onClick={abrirModalRegraValor}
                    disabled={loadingRegraValor}
                  >
                    {regraValor ? 'Editar Limitador de Crédito' : 'Cadastrar Limitador de Crédito'}
                  </S.Button>
                )}

                {tipoUsuarioLogado === 'dev' && (
                  <S.Button
                    $variant="primary"
                    onClick={() =>
                      navigate(`/interno/administradoras/editar/${administradora?.id}`)
                    }
                  >
                    Editar Administradora
                  </S.Button>
                )}
              </S.HeaderActions>
            </S.Header>

            <S.Card>
              <h2>Dados Gerais</h2>

              <S.DetailsGrid>
                <S.DetailItem>
                  <span>CNPJ</span>
                  <strong>{administradora?.cnpj || '-'}</strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Razão Social</span>
                  <strong>{administradora?.razao_social || administradoraNome}</strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Nome Fantasia</span>
                  <strong>{administradora?.nome_fantasia || administradora?.nome || '-'}</strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Email</span>
                  <strong>{administradora?.email || '-'}</strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Status</span>
                  <strong className={administradora?.ativo ? 'status-ativa' : 'status-inativa'}>
                    {administradora?.ativo ? 'Ativa' : 'Inativa'}
                  </strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Local de Recebimento do Cartão</span>
                  <strong>
                    <S.CartaoBadge $cartaoAdmin={administradora?.cartao_admin}>
                      {administradora?.cartao_admin ? 'Na Administradora' : 'No Condomínio'}
                    </S.CartaoBadge>
                  </strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Limitador de Crédito</span>
                  <strong>
                    {regraValor?.ativo && regraValor?.valor_limite
                      ? `Bloqueia acima de ${formatCurrency(regraValor.valor_limite)}`
                      : 'Sem bloqueio cadastrado'}
                  </strong>

                  {podeGerenciarRegraValor && (
                    <S.RegraValorAction
                      type="button"
                      onClick={abrirModalRegraValor}
                      disabled={loadingRegraValor}
                    >
                      {regraValor ? 'Editar limitador' : '+ Cadastrar limitador'}
                    </S.RegraValorAction>
                  )}
                </S.DetailItem>

                <S.DetailItem>
                  <span>Data de Criação</span>
                  <strong>
                    {administradora?.created_at
                      ? new Date(administradora.created_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Última Atualização</span>
                  <strong>
                    {administradora?.updated_at
                      ? new Date(administradora.updated_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </strong>
                </S.DetailItem>
              </S.DetailsGrid>
            </S.Card>

            <S.Card>
              <S.CardHeader>
                <div>
                  <h2>Usuários Vinculados</h2>
                  <p>Gerencie os usuários que têm acesso a esta administradora.</p>
                </div>

                {podeCadastrarUsuario && (
                  <S.Button $variant="primary" onClick={handleNovoUsuario}>
                    + Novo Usuário
                  </S.Button>
                )}
              </S.CardHeader>

              <UsuarioTable
                usuarios={usuarios}
                onEditar={handleEditarUsuario}
                onExcluir={handleExcluirUsuario}
                admNome={administradoraNome}
              />
            </S.Card>
          </>
        )}

        <UsuarioModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setUsuarioSelecionado(null);
          }}
          onSave={handleSalvarUsuario}
          usuario={usuarioSelecionado}
          administradoraId={administradoraId}
          administradoras={administradoras}
          tiposPermitidos={tiposPermitidosNoModal}
          bloquearTipoUsuario={!podeAlterarTipoUsuario}
        />

        <RegraValorModal
          open={modalRegraValorOpen}
          onClose={fecharModalRegraValor}
          onSave={handleSalvarRegraValor}
          regraValor={regraValor}
          valorLimite={valorLimite}
          setValorLimite={setValorLimite}
          regraAtiva={regraAtiva}
          setRegraAtiva={setRegraAtiva}
          saving={salvandoRegraValor}
          d_mais={d_mais}
          setD_mais={setD_mais}
          podeVerDmais={user?.tipo === 'fat' || user?.tipo === 'dev'}
        />

        {showDeleteModal && usuarioToDelete && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 440,
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>Confirmar exclusão</h3>

              <p style={{ margin: '0 0 4px', color: '#475569', fontSize: 14 }}>
                Deseja realmente excluir o usuário?
              </p>

              <strong style={{ display: 'block', marginBottom: 24, color: '#dc2626' }}>
                {usuarioToDelete.username}
              </strong>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={fecharModalExclusao}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#475569',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarExclusaoUsuario}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </S.Container>
    </PageLayout>
  );
}