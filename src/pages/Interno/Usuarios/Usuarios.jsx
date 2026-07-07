// pages/Interno/Usuarios/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import { useSnackbar } from 'notistack';
import { useLoading } from '../../../hooks/useLoading.js';
import UsuarioModal from './UsuarioModal.jsx';
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx';
import { S } from './UsuariosStyles';

const SkeletonTable = () => (
  <S.SkeletonTable>
    <S.SkeletonHeader>
      <S.SkeletonHeaderCell $width="200px" />
      <S.SkeletonHeaderCell $width="250px" />
      <S.SkeletonHeaderCell $width="150px" />
      <S.SkeletonHeaderCell $width="300px" />
      <S.SkeletonHeaderCell $width="140px" />
      <S.SkeletonHeaderCell $width="120px" />
    </S.SkeletonHeader>

    {[...Array(5)].map((_, i) => (
      <S.SkeletonRow key={i}>
        <S.SkeletonCell $width="180px" />
        <S.SkeletonCell $width="220px" />
        <S.SkeletonCell $width="120px" />
        <S.SkeletonCell $width="280px" />
        <S.SkeletonCell $width="120px" />
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
  const [administradoras, setAdministradoras] = useState([]);
  const [vinculandoId, setVinculandoId] = useState(null);
  const [selectedAdmId, setSelectedAdmId] = useState('');

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
      user?.administradora_id ||
      user?.administradora ||
      user?.administradora?.id ||
      null
    );
  };

  const carregarUsuarios = async () => {
    try {
      const params = filtroAdm ? { administradora: filtroAdm } : {};
      const data = await userService.listarUsuarios(params);
      setUsuarios(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      setUsuarios([]);
    }
  };

  const carregarAdministradoras = async () => {
    try {
      const data = await userService.listarAdministradoras();
      setAdministradoras(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error);
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
  }, [filtroAdm]);

  const handleDelete = async (id, username) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await userService.excluirUsuario(id);
        enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
      }
    }
  };

  const handleDesvincular = async (userId, username) => {
    if (
      window.confirm(
        `Deseja desvincular o usuário "${username}" da administradora?`
      )
    ) {
      try {
        await userService.desvincularAdministradora(userId);
        enqueueSnackbar('Vínculo removido com sucesso', {
          variant: 'success',
        });
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao desvincular:', error);
        enqueueSnackbar('Erro ao desvincular', { variant: 'error' });
      }
    }
  };

  const handleVincular = async (userId) => {
    if (!selectedAdmId) {
      enqueueSnackbar('Selecione uma administradora para vincular', {
        variant: 'warning',
      });
      return;
    }

    if (window.confirm('Deseja vincular este usuário à administradora selecionada?')) {
      setVinculandoId(userId);

      try {
        await userService.vincularAdministradora(userId, parseInt(selectedAdmId));
        enqueueSnackbar('Usuário vinculado com sucesso', {
          variant: 'success',
        });
        setSelectedAdmId('');
        setVinculandoId(null);
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao vincular usuário:', error);
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
        enqueueSnackbar('Usuário atualizado com sucesso', {
          variant: 'success',
        });
      } else {
        await userService.criarUsuario(dados);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }

      await carregarUsuarios();
      setModalOpen(false);
      setSelectedUser(null);
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

  return (
    <PageLayout
      title="Gerenciamento de Usuários"
      subtitle="Gerencie os usuários cadastrados na plataforma"
    >
      <S.Container>
        <S.Filters>
          <S.FilterSelect
            value={filtroAdm}
            onChange={(e) => setFiltroAdm(e.target.value)}
            disabled={loading}
          >
            <option value="">Todas as administradoras</option>

            {administradoras.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.razao_social ||
                  adm.nome_fantasia ||
                  adm.nome ||
                  `ADM ${adm.id}`}
              </option>
            ))}
          </S.FilterSelect>
        </S.Filters>

        {loading ? (
          <SkeletonTable />
        ) : usuarios.length === 0 ? (
          <S.EmptyState>
            <p>Nenhum usuário encontrado.</p>
            {filtroAdm && <p>Tente remover o filtro de administradora.</p>}
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
                  const possuiAdministradora =
                    Boolean(administradoraNome) || Boolean(administradoraId);

                  return (
                    <tr key={user.id}>
                      <td>{user.username || user.nome || '—'}</td>
                      <td>{user.email || '—'}</td>

                      <td>{getTipoLabel(user.tipo)}</td>

                      <td>
                        {possuiAdministradora ? (
                          <S.VinculadoInfo>
                            <S.VinculadoBadge>
                              {administradoraNome || `ID: ${administradoraId}`}
                            </S.VinculadoBadge>

                            <S.Button
                              $variant="unlink"
                              $size="small"
                              onClick={() =>
                                handleDesvincular(user.id, user.username)
                              }
                              title="Desvincular"
                            >
                              ✕
                            </S.Button>
                          </S.VinculadoInfo>
                        ) : (
                          <S.NaoVinculadoInfo>
                            <S.NaoVinculadoBadge>
                              Não vinculado
                            </S.NaoVinculadoBadge>

                            <S.VincularContainer>
                              <S.VincularSelect
                                value={
                                  vinculandoId === user.id ? selectedAdmId : ''
                                }
                                onChange={(e) => {
                                  setSelectedAdmId(e.target.value);
                                  setVinculandoId(user.id);
                                }}
                              >
                                <option value="">
                                  Selecionar administradora...
                                </option>

                                {administradoras.map((adm) => (
                                  <option key={adm.id} value={adm.id}>
                                    {adm.razao_social ||
                                      adm.nome_fantasia ||
                                      adm.nome ||
                                      `ADM ${adm.id}`}
                                  </option>
                                ))}
                              </S.VincularSelect>

                              {vinculandoId === user.id && selectedAdmId && (
                                <S.Button
                                  $variant="link"
                                  $size="small"
                                  onClick={() => handleVincular(user.id)}
                                >
                                  Vincular
                                </S.Button>
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
                          <S.Button
                            $variant="edit"
                            onClick={() => handleEditar(user)}
                          >
                            Editar
                          </S.Button>

                          <S.Button
                            $variant="delete"
                            onClick={() =>
                              handleDelete(user.id, user.username)
                            }
                          >
                            Excluir
                          </S.Button>
                        </S.Actions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </S.Table>
          </S.TableWrapper>
        )}

        <UsuarioModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSalvarUsuario}
          usuario={selectedUser}
          administradoraId={filtroAdm || null}
          administradoras={administradoras}
        />
      </S.Container>
    </PageLayout>
  );
}