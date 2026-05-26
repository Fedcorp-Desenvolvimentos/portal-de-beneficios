// pages/Interno/Administradoras/AdministradorasGeral.jsx (atualizado com Styled Components)
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

export default function AdministradorasGeral() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [administradora, setAdministradora] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const { loading, startLoading, stopLoading } = useLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [administradoras, setAdministradoras] = useState([]);

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
      startLoading("Carregando administradora...");
      const data = await buscarAdministradoraPorId(administradoraId);
      setAdministradora(data);
    } catch (error) {
      console.error('❌ Erro ao carregar administradora:', error);
      enqueueSnackbar('Erro ao carregar administradora', { variant: 'error' });
      navigate('/interno/administradoras');
    } finally {
      stopLoading();
    }
  };

  const carregarUsuarios = async () => {
    try {
      startLoading("Carregando usuários...");
      const usuariosFiltrados = await userService.listarUsuarios({
        administradora: administradoraId
      });
      setUsuarios(Array.isArray(usuariosFiltrados) ? usuariosFiltrados : []);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      setUsuarios([]);
    } finally {
      stopLoading();
    }
  };

  // 👇 Função para ABRIR MODAL DE EDIÇÃO
  const handleEditarUsuario = (usuario) => {
    setUsuarioSelecionado(usuario); // Passa o usuário existente
    setModalOpen(true);
  };

  // 👇 Função para ABRIR MODAL DE CRIAÇÃO
  const handleNovoUsuario = () => {
    setUsuarioSelecionado(null); // Passa null para criar novo
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
        // EDIÇÃO
        await userService.atualizarUsuario(usuarioSelecionado.id, dados);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        // CRIAÇÃO
        await userService.criarUsuario(dados);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }
      await carregarUsuarios();
      setModalOpen(false);
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Erro ao salvar usuário';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      throw error; // Importante: o modal precisa saber que falhou
    }
  };

  return (
    <PageLayout title="Minha Administradora" subtitle="Visualize os detalhes da sua administradora e gerencie os usuários vinculados a ela.">
      <S.Container>
        <S.Header>
          <div>
            <h1>Minha Administradora</h1>
            <p>{administradora?.razao_social || '-'}</p>
          </div>
          <S.HeaderActions>
            <S.Button $variant="secondary" onClick={() => navigate('/interno/administradoras')}>
              Voltar
            </S.Button>
            {user?.tipo === 'dev' && (
              <S.Button $variant="primary" onClick={() => navigate(`/interno/administradoras/editar/${administradora?.id}`)}>
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
              <span>Data de Criação</span>
              <strong>{administradora?.created_at ? new Date(administradora.created_at).toLocaleDateString('pt-BR') : '-'}</strong>
            </S.DetailItem>
            <S.DetailItem>
              <span>Última Atualização</span>
              <strong>{administradora?.updated_at ? new Date(administradora.updated_at).toLocaleDateString('pt-BR') : '-'}</strong>
            </S.DetailItem>
          </S.DetailsGrid>
        </S.Card>

        {/* Seção de Usuários */}
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

        {/* Modal de Usuário - REAPROVEITADO */}
        <UsuarioModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setUsuarioSelecionado(null);
          }}
          onSave={handleSalvarUsuario}
          usuario={usuarioSelecionado}  // Se null → criação, Se objeto → edição
          administradoraId={administradoraId}
          administradoras={administradoras}
        />
      </S.Container>
    </PageLayout>
  );
}