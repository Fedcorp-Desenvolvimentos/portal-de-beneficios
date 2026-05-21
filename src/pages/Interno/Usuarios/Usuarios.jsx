// pages/Interno/Usuarios/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import { useSnackbar } from 'notistack';
import './Usuarios.css';
import { useLoading } from '../../../hooks/useLoading.js';
import UsuarioModal from './UsuarioModal.jsx';

export default function Usuarios() {
  const { enqueueSnackbar } = useSnackbar();
  const [usuarios, setUsuarios] = useState([]);
  const { loading, startLoading, stopLoading } = useLoading()
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtroAdm, setFiltroAdm] = useState('');
  const [administradoras, setAdministradoras] = useState([]);
  const [vinculandoId, setVinculandoId] = useState(null);
  const [selectedAdmId, setSelectedAdmId] = useState('');
  
  useEffect(() => {
    carregarUsuarios();
    carregarAdministradoras();
  }, [filtroAdm]);

  const carregarUsuarios = async () => {
    startLoading("Carregando usuários...");
    try {
      const params = filtroAdm ? { administradora: filtroAdm } : {};
      const data = await userService.listarUsuarios(params);
      setUsuarios(data);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      setUsuarios([]);
    } finally {
      stopLoading();
    }
  };

  const carregarAdministradoras = async () => {
    startLoading("Por favor aguarde...");
    try {
      const data = await userService.listarAdministradoras();
      setAdministradoras(data);
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error);
      enqueueSnackbar('Erro ao carregar administradoras', { variant: 'error' });
      setAdministradoras([]);
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
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
    if (window.confirm(`Deseja desvincular o usuário "${username}" da administradora?`)) {
      try {
        await userService.desvincularAdministradora(userId);
        enqueueSnackbar('Vínculo removido com sucesso', { variant: 'success' });
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao desvincular:', error);
        enqueueSnackbar('Erro ao desvincular', { variant: 'error' });
      }
    }
  };

  const handleVincular = async (userId) => {
    if (!selectedAdmId) {
      enqueueSnackbar('Selecione uma administradora para vincular', { variant: 'warning' });
      return;
    }
    
    if (window.confirm(`Deseja vincular este usuário à administradora selecionada?`)) {
      setVinculandoId(userId);
      try {
        await userService.vincularAdministradora(userId, parseInt(selectedAdmId));
        enqueueSnackbar('Usuário vinculado com sucesso', { variant: 'success' });
        setSelectedAdmId('');
        setVinculandoId(null);
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao vincular:', error);
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
      console.log('💾 Salvando usuário:', selectedUser ? `ID ${selectedUser.id}` : 'Novo usuário', dados);
      
      if (!dados.username || dados.username.trim() === '') {
        enqueueSnackbar('Nome de usuário é obrigatório', { variant: 'error' });
        throw new Error('Nome de usuário é obrigatório');
      }
      
      if (!dados.email || !dados.email.includes('@')) {
        enqueueSnackbar('Email válido é obrigatório', { variant: 'error' });
        throw new Error('Email válido é obrigatório');
      }
      
      if (!selectedUser && (!dados.password || dados.password.trim() === '')) {
        enqueueSnackbar('Senha é obrigatória para novo usuário', { variant: 'error' });
        throw new Error('Senha é obrigatória');
      }
      
      if (selectedUser && dados.password && dados.password.length < 6) {
        enqueueSnackbar('A senha deve ter no mínimo 6 caracteres', { variant: 'error' });
        throw new Error('Senha muito curta');
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
      console.error('❌ Erro ao salvar usuário:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Erro ao salvar usuário';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      throw error;
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      dev: 'Desenvolvedor',
      fin: 'Financeiro Fedcorp',
      fat: 'Faturista Fedcorp',
      adm: 'Admin Administradora',
      cli: 'Cliente'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="usuarios-container">
      <div className="header-actions">
        <h2>Gerenciamento de Usuários</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}
        >
          + Novo Usuário
        </button>
      </div>

      <div className="filtros">
        <select 
          value={filtroAdm} 
          onChange={(e) => setFiltroAdm(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todas as administradoras</option>
          {administradoras.map(adm => (
            <option key={adm.id} value={adm.id}>
              {adm.razao_social || adm.nome_fantasia || adm.nome || `ADM ${adm.id}`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-message">Carregando usuários...</div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário encontrado.</p>
          {filtroAdm && <p>Tente remover o filtro de administradora.</p>}
        </div>
      ) : (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Administradora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{getTipoLabel(user.tipo)}</td>
                <td className="adm-cell">
                  {user.administradora_id ? (
                    <div className="vinculado-info">
                      <span className="vinculado-badge">
                        {user.administradora_nome || `ID: ${user.administradora_id}`}
                      </span>
                      <button 
                        className="btn-desvincular"
                        onClick={() => handleDesvincular(user.id, user.username)}
                        title="Desvincular"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="nao-vinculado-info">
                      <span className="nao-vinculado-badge">Não vinculado</span>
                      <div className="vincular-container">
                        <select
                          value={vinculandoId === user.id ? selectedAdmId : ''}
                          onChange={(e) => {
                            setSelectedAdmId(e.target.value);
                            setVinculandoId(user.id);
                          }}
                          className="vincular-select"
                        >
                          <option value="">Selecionar adm...</option>
                          {administradoras.map(adm => (
                            <option key={adm.id} value={adm.id}>
                              {adm.razao_social || adm.nome_fantasia || `ADM ${adm.id}`}
                            </option>
                          ))}
                        </select>
                        {vinculandoId === user.id && selectedAdmId && (
                          <button
                            className="btn-vincular"
                            onClick={() => handleVincular(user.id)}
                          >
                            Vincular
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="acoes">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditar(user)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(user.id, user.username)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}