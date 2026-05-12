import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'

import Dashboard from './pages/Client/Dashboard.jsx'
import Importacao from './pages/Client/Importacao.jsx'
import Faturamento from './pages/Client/Faturamento.jsx'
import FaturamentoFormulario from './pages/Client/FaturamentoFormulario.jsx'
import Pendentes from './pages/Comuns/Pendentes.jsx'
import Historico from './pages/Comuns/Historico.jsx'

import Login from './pages/Comuns/Login/Login.jsx'
import EsqueciSenha from './pages/Comuns/Login/EsqueciSenha.jsx'

import GerenciamentoCondominios from './pages/Client/GerenciamentoCondominios.jsx'
import RelatoriosBeneficios from './pages/Client/RelatoriosBeneficios.jsx'

import ColaboradorDashboard from './pages/Interno/ColaboradorDashboard.jsx'
import ImportacaoDocs from './pages/Interno/ImportacaoDocs.jsx'

import Administradoras from './pages/Interno/Administradoras/Administradoras.jsx'
import CadastroAdministradora from './pages/Interno/Administradoras/CadastroAdministradora.jsx'
import EditarAdministradora from './pages/Interno/Administradoras/EditarAdministradora.jsx'
import UsuarioAdministradora from './pages/Interno/Administradoras/UsuariosAdministradora.jsx'
import DetalhesAdministradora from './pages/Interno/Administradoras/DetalhesAdministradora.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function Layout() {
  const location = useLocation()

  const titles = {
    '/': 'Início',
    '/importacao': 'Importação',
    '/faturamento': 'Faturamento',
    '/faturamento/repetir': 'Repetir último faturamento',
    '/faturamento/novo': 'Novo faturamento',
    '/pendentes': 'Pendências',
    '/historico': 'Histórico',
    '/gerenciamento': 'Gerenciamento de Condomínios',
    '/relatorios': 'Relatórios de Benefícios',
    '/colaborador/dashboard': 'Dashboard Fedcorp',
    '/colaborador/importacaoDocs': 'Importação Fedcorp',
    '/interno/administradoras': 'Gestão de Administradoras',
    '/interno/administradoras/nova': 'Nova Administradora',
    '/interno/administradoras/usuarios': 'Usuários da Administradora',
    '/interno/administradoras/detalhes': 'Detalhes da Administradora',
  }

  const getTitle = () => {
    if (location.pathname.startsWith('/interno/administradoras/') && location.pathname.endsWith('/editar')) {
      return 'Editar Administradora'
    }

    if (location.pathname.startsWith('/interno/administradoras/') && location.pathname.endsWith('/usuarios')) {
      return 'Usuários da Administradora'
    }

    return titles[location.pathname] ?? 'Portal de Benefícios'
  }

  const title = getTitle()

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header title={title} />

        <div className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/importacao" element={<Importacao />} />
            <Route path="/faturamento" element={<Faturamento />} />
            <Route path="/faturamento/repetir" element={<FaturamentoFormulario modo="repetir" />} />
            <Route path="/faturamento/novo" element={<FaturamentoFormulario modo="novo" />} />
            <Route path="/pendentes" element={<Pendentes />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/gerenciamento" element={<GerenciamentoCondominios />} />
            <Route path="/relatorios" element={<RelatoriosBeneficios />} />

            <Route
              path="/colaborador/dashboard"
              element={
                <ProtectedRoute allowedRoles={['dev', 'colaborador_fedcorp']}>
                  <ColaboradorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colaborador/importacaoDocs"
              element={
                <ProtectedRoute allowedRoles={['dev', 'colaborador_fedcorp']}>
                  <ImportacaoDocs />
                </ProtectedRoute>
              }
            />

            <Route path="/interno/administradoras" element={<Administradoras />} />
            <Route path="/interno/administradoras/cadastro" element={<CadastroAdministradora />} />
            <Route path="/interno/administradoras/:id" element={<DetalhesAdministradora />} />
            <Route path="/interno/administradoras/editar/:id" element={<EditarAdministradora />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </AuthProvider>
  )
}