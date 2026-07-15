import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../services/userService';
import { useSnackbar } from 'notistack';
import { useLoading } from '../../../hooks/useLoading.js';
import UsuarioModal from './UsuarioModal.jsx';
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx';
import { S } from './UsuariosStyles';
import SearchableSelect from './SearchableSelect';
import { PencilLine, Trash2, Unlink } from 'lucide-react';

const SkeletonTable = () => (
  <S.SkeletonTable>
    <S.SkeletonHeader>
      <S.SkeletonHeaderCell $width="180px" />
      <S.SkeletonHeaderCell $width="220px" />
      <S.SkeletonHeaderCell $width="120px" />
      <S.SkeletonHeaderCell $width="240px" />
      <S.SkeletonHeaderCell $width="100px" />
      <S.SkeletonHeaderCell $width="120px" />
    </S.SkeletonHeader>
    {[...Array(5)].map((_, i) => (
      <S.SkeletonRow key={i}>
        <S.SkeletonCell $width="160px" />
        <S.SkeletonCell $width="200px" />
        <S.SkeletonCell $width="100px" />
        <S.SkeletonCell $width="220px" />
        <S.SkeletonCell $width="80px" />
        <S.SkeletonCell $width="100px" />
      </S.SkeletonRow>
    ))}
  </S.SkeletonTable>
);

export default function Usuarios() {
  const { enqueueSnackbar } = useSnackbar();
  const [usuarios, setUsuarios] = useState([]);
  const { loading, startLoading, stopLoading } = useLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtroAdm, setFiltroAdm] = useState('');
  const [searchNome, setSearchNome] = useState('');
  const [administradoras, setAdministradoras] = useState([]);
  const [vinculandoId, setVinculandoId] = useState(null);
  const [selectedAdmId, setSelectedAdmId] = useState('');

  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getTipoLabel = (tipo) => {
    const tipos = {
      dev: 'Desenvolvedor',
      fin: 'Financeiro Fedcorp',
      fat: 'Faturista Fedcorp',
      adm: 'Usuário da Administradora / Imobiliária',
      dep: 'Departamento Pessoal',
      cli: 'Cliente',
    };
    return tipos[tipo] || tipo || '—';
  };

  const getAdministradoraNome = (user) => {
    return (
      user?.administradora_nome ||
      user?.nome_administradora ||
      user?.administradora?.nome ||
      user?.administradora?.razao_social ||
      user?.administradora?.nome_fantasia ||
      ''
    );
  };

  const getAdministradoraId = (user) => {
    return (
      user?.administradora_ativa_id ||
      user?.administradora_id ||
      user?.administradora_ativa ||
      user?.administradora ||
      user?.administradora?.id ||
      null
    );
  };

  const carregarUsuarios = useCallback(async () => {
    try {
      const params = {};
      if (filtroAdm) params.administradora = filtroAdm;
      if (searchNome.trim()) params.search = searchNome.trim();
      const data = await userService.listarUsuarios(params);
      setUsuarios(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      setUsuarios([]);
    }
  }, [filtroAdm, searchNome, enqueueSnackbar]);

  const carregarAdministradoras = async () => {
    try {
      const data = await userService.listarAdministradoras();
      setAdministradoras(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('Erro ao carregar administradoras:', error);
      enqueueSnackbar('Erro ao carregar administradoras', { variant: 'error' });
      setAdministradoras([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      startLoading('Carregando dados...');
      await Promise.all([carregarUsuarios(), carregarAdministradoras()]);
      stopLoading();
    };
    loadData();
  }, [filtroAdm, searchNome]);

  const handleDelete = (id, username) => {
    setUserToDelete({ id, username });
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (!userToDelete) return;
    try {
      await userService.excluirUsuario(userToDelete.id);
      enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
      setShowDeleteModal(false);
      setUserToDelete(null);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
    }
  };

  const fecharModalExclusao = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDesvincular = async (userId, username) => {
    if (window.confirm(`Deseja desvincular o usuário "${username}" da administradora?`)) {
      try {
        await userService.desvincularAdministradora(userId);
        enqueueSnackbar('Vínculo removido com sucesso', { variant: 'success' });
        await carregarUsuarios();
      } catch (error) {
        console.error('Erro ao desvincular:', error);
        enqueueSnackbar('Erro ao desvincular', { variant: 'error' });
      }
    }
  };

  const handleVincular = async (userId) => {
    if (!selectedAdmId) {
      enqueueSnackbar('Selecione uma administradora para vincular', { variant: 'warning' });
      return;
    }
    if (window.confirm('Deseja vincular este usuário à administradora selecionada?')) {
      setVinculandoId(userId);
      try {
        await userService.vincularAdministradora(userId, parseInt(selectedAdmId));
        enqueueSnackbar('Usuário vinculado com sucesso', { variant: 'success' });
        setSelectedAdmId('');
        setVinculandoId(null);
        await carregarUsuarios();
      } catch (error) {
        console.error('Erro ao vincular usuário:', error);
        enqueueSnackbar('Erro ao vincular usuário', { variant: 'error' });
        setVinculandoId(null);
      }
    }
  };

  const handleEditar = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSalvarUsuario = async (dados) => {
    try {
      if (!dados.username || dados.username.trim() === '') {
        enqueueSnackbar('Nome de usuário é obrigatório', { variant: 'error' });
        throw new Error('Nome de usuário é obrigatório');
      }
      if (!dados.email || !dados.email.includes('@')) {
        enqueueSnackbar('Email válido é obrigatório', { variant: 'error' });
        throw new Error('Email válido é obrigatório');
      }
      if (!dados.tipo || dados.tipo.trim() === '') {
        enqueueSnackbar('Tipo de usuário é obrigatório', { variant: 'error' });
        throw new Error('Tipo de usuário é obrigatório');
      }

      if (selectedUser) {
        await userService.atualizarUsuario(selectedUser.id, dados);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        await userService.criarUsuario(dados);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }

      await carregarUsuarios();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao salvar usuário';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      throw error;
    }
  };

  return (
    <PageLayout
      title="Gerenciamento de Usuários"
      subtitle="Gerencie os usuários cadastrados na plataforma"
    >
      <S.Container>
        <S.Card>
          <S.CardHeader>
            <h2>Usuários</h2>
            <S.NovoBtn onClick={() => { setSelectedUser(null); setModalOpen(true); }}>
              + Novo Usuário
            </S.NovoBtn>
          </S.CardHeader>

          <S.FiltersRow>
            <S.SearchInput
              type="text"
              placeholder="Buscar por nome do usuário..."
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
              disabled={loading}
            />
            <SearchableSelect
              options={administradoras}
              value={filtroAdm}
              onChange={setFiltroAdm}
              placeholder="Filtrar por administradora..."
              disabled={loading}
            />
          </S.FiltersRow>

          {loading ? (
            <SkeletonTable />
          ) : usuarios.length === 0 ? (
            <S.EmptyState>
              <p>Nenhum usuário encontrado.</p>
              {(filtroAdm || searchNome) && (
                <p>Tente limpar os filtros de busca.</p>
              )}
            </S.EmptyState>
          ) : (
            <S.TableWrapper>
              <S.Table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Administradora</th>
                    <th>Primeiro Acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((user) => {
                    const administradoraNome = getAdministradoraNome(user);
                    const administradoraId = getAdministradoraId(user);
                    const possuiAdministradora = Boolean(administradoraNome) || Boolean(administradoraId);

                    return (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 500 }}>{user.username || user.nome || '—'}</td>
                        <td style={{ color: '#64748b' }}>{user.email || '—'}</td>
                        <td>{getTipoLabel(user.tipo)}</td>
                        <td>
                          {possuiAdministradora ? (
                            <S.VinculadoInfo>
                              <S.VinculadoBadge>
                                {administradoraNome || `ID: ${administradoraId}`}
                              </S.VinculadoBadge>
                            </S.VinculadoInfo>
                          ) : (
                            <S.NaoVinculadoInfo>
                              <S.NaoVinculadoBadge>Não vinculado</S.NaoVinculadoBadge>
                              <S.VincularContainer>
                                <S.VincularSelect
                                  value={vinculandoId === user.id ? selectedAdmId : ''}
                                  onChange={(e) => {
                                    setSelectedAdmId(e.target.value);
                                    setVinculandoId(user.id);
                                  }}
                                >
                                  <option value="">Selecionar adm...</option>
                                  {administradoras.map((adm) => (
                                    <option key={adm.id} value={adm.id}>
                                      {adm.razao_social || adm.nome_fantasia || adm.nome || `ADM ${adm.id}`}
                                    </option>
                                  ))}
                                </S.VincularSelect>
                                {vinculandoId === user.id && selectedAdmId && (
                                  <S.ActionBtn $variant="link" onClick={() => handleVincular(user.id)}>
                                    Vincular
                                  </S.ActionBtn>
                                )}
                              </S.VincularContainer>
                            </S.NaoVinculadoInfo>
                          )}
                        </td>
                        <td>
                          {user.primeiro_acesso ? (
                            <S.NaoVinculadoBadge>Pendente</S.NaoVinculadoBadge>
                          ) : (
                            <S.VinculadoBadge>Concluído</S.VinculadoBadge>
                          )}
                        </td>
                        <td>
                          <S.Actions>
                            <S.ActionBtn $variant="edit" onClick={() => handleEditar(user)} title="Editar">
                              <PencilLine size={14} />
                            </S.ActionBtn>
                            {possuiAdministradora && (
                              <S.ActionBtn $variant="unlink-actions" onClick={() => handleDesvincular(user.id, user.username)} title="Desvincular">
                                <Unlink size={14} />
                              </S.ActionBtn>
                            )}
                            <S.ActionBtn $variant="delete" onClick={() => handleDelete(user.id, user.username)} title="Excluir">
                              <Trash2 size={14} />
                            </S.ActionBtn>
                          </S.Actions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </S.Table>
            </S.TableWrapper>
          )}
        </S.Card>

        <UsuarioModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedUser(null); }}
          onSave={handleSalvarUsuario}
          usuario={selectedUser}
          administradoraId={filtroAdm || null}
          administradoras={administradoras}
        />

        {showDeleteModal && userToDelete && (
          <S.ModalOverlay>
            <S.ModalContent>
              <S.ModalTitle>Confirmar exclusão</S.ModalTitle>
              <S.ModalText>Deseja realmente excluir o usuário? Esta ação não pode ser desfeita.</S.ModalText>
              <S.ModalUser>{userToDelete.username}</S.ModalUser>
              <S.ModalActions>
                <S.ModalCancelBtn onClick={fecharModalExclusao}>Cancelar</S.ModalCancelBtn>
                <S.ModalDeleteBtn onClick={confirmarExclusao}>Excluir</S.ModalDeleteBtn>
              </S.ModalActions>
            </S.ModalContent>
          </S.ModalOverlay>
        )}
      </S.Container>
    </PageLayout>
  );
}
