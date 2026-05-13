// pages/Interno/Usuarios/Usuarios.jsx

import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import UsuarioModal from '../Usuarios/UsuarioModal.jsx';
import { toast } from 'react-toastify';
import './Usuarios.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const params = filtroAdm ? { administradora: filtroAdm } : {};
      const data = await userService.listarUsuarios(params);
      setUsuarios(data);
      console.log('📋 Usuários carregados:', data?.length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarAdministradoras = async () => {
    try {
      const data = await userService.listarAdministradoras();
      setAdministradoras(data);
      console.log('🏢 Administradoras carregadas:', data?.length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error);
      setAdministradoras([]);
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      try {
        await userService.excluirUsuario(id);
        toast.success('Usuário excluído com sucesso');
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleDesvincular = async (userId, username) => {
    if (window.confirm(`Deseja desvincular o usuário "${username}" da administradora?`)) {
      try {
        await userService.desvincularAdministradora(userId);
        toast.success('Vínculo removido com sucesso');
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao desvincular:', error);
        toast.error('Erro ao desvincular');
      }
    }
  };

  const handleVincular = async (userId) => {
    if (!selectedAdmId) {
      toast.warning('Selecione uma administradora para vincular');
      return;
    }
    
    if (window.confirm(`Deseja vincular este usuário à administradora selecionada?`)) {
      setVinculandoId(userId);
      try {
        await userService.vincularAdministradora(userId, parseInt(selectedAdmId));
        toast.success('Usuário vinculado com sucesso');
        setSelectedAdmId('');
        setVinculandoId(null);
        await carregarUsuarios();
      } catch (error) {
        console.error('❌ Erro ao vincular:', error);
        toast.error('Erro ao vincular usuário');
        setVinculandoId(null);
      }
    }
  };

  const handleEditar = (user) => {
    console.log('✏️ Editando usuário:', user);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSalvarUsuario = async (dados) => {
    try {
      if (selectedUser) {
        console.log('📝 Atualizando usuário:', selectedUser.id, dados);
        await userService.atualizarUsuario(selectedUser.id, dados);
        toast.success('Usuário atualizado com sucesso');
      } else {
        console.log('➕ Criando novo usuário:', dados);
        await userService.criarUsuario(dados);
        toast.success('Usuário criado com sucesso');
      }
      await carregarUsuarios();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Erro ao salvar usuário';
      toast.error(errorMsg);
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