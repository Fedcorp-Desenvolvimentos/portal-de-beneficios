import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdministradorasTable from '../../../components/AdministradorasTable.jsx'
import ConfirmarDesativacaoModal from '../../../components/ConfirmarDesativacaoModal.jsx'
import {
  listarAdministradoras,
  alterarStatusAdministradora,
} from '../../../services/administradoraService.js'
import './Administradoras.css'

import { administradoraService } from '../../../services/administradoraService.js'

export default function Administradoras() {
  const navigate = useNavigate()

  const [administradoras, setAdministradoras] = useState([])
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false)
  const [administradoraSelecionada, setAdministradoraSelecionada] = useState(null)

  function carregarAdministradoras() {
    const dados = listarAdministradoras()
    setAdministradoras(dados)
  }

  useEffect(() => {
    carregarAdministradoras()
  }, [])

  function abrirConfirmacaoStatus(administradora) {
    setAdministradoraSelecionada(administradora)
    setModalConfirmacaoAberto(true)
  }

  function fecharConfirmacaoStatus() {
    setAdministradoraSelecionada(null)
    setModalConfirmacaoAberto(false)
  }

  function confirmarAlteracaoStatus() {
    if (!administradoraSelecionada) return

    alterarStatusAdministradora(administradoraSelecionada.id)
    carregarAdministradoras()
    fecharConfirmacaoStatus()
  }

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Gestão de Administradoras</h1>
          <p>Cadastre e gerencie as administradoras do portal.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/interno/administradoras/nova')}
        >
          + Nova Administradora
        </button>
      </div>

      <AdministradorasTable
        administradoras={administradoras}
        onDetalhes={(adm) => navigate(`/interno/administradoras/${adm.id}`)}
        onEditar={(adm) => navigate(`/interno/administradoras/${adm.id}/editar`)}
        onUsuarios={(adm) => navigate(`/interno/administradoras/${adm.id}/usuarios`)}
        onAlterarStatus={abrirConfirmacaoStatus}
      />

      <ConfirmarDesativacaoModal
        isOpen={modalConfirmacaoAberto}
        title="Alterar status da administradora"
        message={
          administradoraSelecionada?.status === 'ativa'
            ? `Deseja inativar a administradora ${administradoraSelecionada.nomeFantasia}?`
            : `Deseja ativar a administradora ${administradoraSelecionada?.nomeFantasia}?`
        }
        onClose={fecharConfirmacaoStatus}
        onConfirm={confirmarAlteracaoStatus}
      />
    </div>
  )
}