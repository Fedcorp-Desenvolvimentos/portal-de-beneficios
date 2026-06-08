// pages/Interno/Administradoras/MinhaAdministradora.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext.jsx';
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js';
import { userService } from '../../../services/userService.js';
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx';
import { useLoading } from '../../../hooks/useLoading.js';
import UsuarioTable from '../Usuarios/UsuarioTable.jsx';
import UsuarioModal from '../Usuarios/UsuarioModal.jsx';
import { S } from './AdministradorasStyles.js';

import { 
  buscarRegraValorAdministradora, 
  atualizarRegraValorAdministradora, 
  criarRegraValorAdministradora 
} from '../../../services/administradoraService.js';

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

const RegraValorModal = ({
  open,
  onClose,
  onSave,
  regraValor,
  valorLimite,
  setValorLimite,
  regraAtiva,
  setRegraAtiva,
  saving,
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
            <h2 style={{ margin: 0 }}>Regra de Valor</h2>
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
            <strong style={{ display: 'block', marginBottom: 6 }}>Regra cadastrada</strong>
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
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 24,
          }}
        >
          <S.Button $variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </S.Button>

          <S.Button $variant="primary" type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : regraValor ? 'Atualizar regra' : 'Cadastrar regra'}
          </S.Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SKELETON COMPONENTS
// ============================================

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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

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
  const [loadingRegraValor, setLoadingRegraValor] = useState(false);
  const [salvandoRegraValor, setSalvandoRegraValor] = useState(false);

  const { loading, startLoading, stopLoading } = useLoading();

  const administradoraId = user?.administradora_id;

  useEffect(() => {
    if (!administradoraId) {
      enqueueSnackbar('Usuário não possui administradora vinculada', { variant: 'error' });
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
      setAdministradoras(data);
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error);
    }
  };

  const carregarAdministradora = async () => {
    try {
      setLoadingAdm(true);
      startLoading('Carregando administradora...');

      const data = await buscarAdministradoraPorId(administradoraId);
      // console.log('Administradora carregada:', data);
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

      setUsuarios(Array.isArray(usuariosFiltrados) ? usuariosFiltrados : []);
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
      } else {
        setRegraAtiva(true);
        setValorLimite('');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar regra de valor:', error);

      setRegraValor(null);
      setRegraAtiva(true);
      setValorLimite('');
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

      if (regraAtiva && (!valorLimite || Number.isNaN(valorNumerico) || valorNumerico <= 0)) {
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
    setUsuarioSelecionado(usuario);
    setModalOpen(true);
  };

  const handleNovoUsuario = () => {
    setUsuarioSelecionado(null);
    setModalOpen(true);
  };

  const handleExcluirUsuario = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.username}"?`)) {
      try {
        await userService.excluirUsuario(usuario.id);
        enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
      }
    }
  };

  const handleSalvarUsuario = async (dados) => {
    try {
      if (usuarioSelecionado) {
        await userService.atualizarUsuario(usuarioSelecionado.id, dados);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        await userService.criarUsuario(dados);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }

      await carregarUsuarios();

      setModalOpen(false);
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);

      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Erro ao salvar usuário';

      enqueueSnackbar(errorMsg, { variant: 'error' });
      throw error;
    }
  };

  const isLoading = loadingAdm || loadingUsuarios;

  // console.log("user", user);

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

                {user?.tipo === 'dev' && (
                  <>
                    <S.Button
                      $variant="secondary"
                      onClick={abrirModalRegraValor}
                      disabled={loadingRegraValor}
                    >
                      Regra de Valor
                    </S.Button>

                    <S.Button
                      $variant="primary"
                      onClick={() =>
                        navigate(`/interno/administradoras/editar/${administradora?.id}`)
                      }
                    >
                      Editar Administradora
                    </S.Button>    
                </>
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
                  <strong>{administradora?.razao_social || '-'}</strong>
                </S.DetailItem>

                <S.DetailItem>
                  <span>Nome Fantasia</span>
                  <strong>{administradora?.nome_fantasia || '-'}</strong>
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
                  <span>Regra de Valor</span>
                  <strong>
                    {regraValor?.ativo && regraValor?.valor_limite
                      ? `Bloqueia acima de ${formatCurrency(regraValor.valor_limite)}`
                      : 'Sem bloqueio cadastrado'}
                  </strong>
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

                <S.Button $variant="primary" onClick={handleNovoUsuario}>
                  + Novo Usuário
                </S.Button>
              </S.CardHeader>

              <UsuarioTable
                usuarios={usuarios}
                onEditar={handleEditarUsuario}
                onExcluir={handleExcluirUsuario}
                admNome={administradora?.nome_fantasia || administradora?.razao_social || '-'}
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
        />
      </S.Container>
    </PageLayout>
  );
}