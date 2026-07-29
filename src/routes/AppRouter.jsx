import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useAuth } from '../context/AuthContext'

// Layouts
import MainLayout from '../Layouts/MainLayout/MainLayout'

// Públicos
import Login from '../pages/Login/Login'
import EsqueciSenha from '../pages/Comuns/Login/EsqueciSenha'
import ResetarSenha from '../pages/ResetarSenha/ResetarSenha'
import NotFound from '../components/NotFound/NotFound'

// Utils
import PrivateRouter from './PrivateRouter'

// Client
import Dashboard from '../pages/Home/Dashboard'
import ColaboradorDashboard from '../pages/ColaboradorDashboard/ColaboradorDashboard'


import Faturamento from '../pages/Client/Faturamento/Faturamento'
import FaturamentoIndividual from '../pages/Client/FaturamentoIndividual/FaturamentoIndividual'
import FaturamentoFormulario from '../pages/Client/FaturamentoFormulario'
import RelatoriosBeneficios from '../pages/Client/RelatoriosBeneficios'

import Importacao from '../pages/Client//Importacao/Importacao'

import GerenciamentoCondominios from '../pages/GerenciamentoCondominios/GerenciamentoCondominios'

// Comuns
import Pendentes from '../pages/Comuns/Pendentes'
import Historico from '../pages/Comuns/Historico'

// Interno
import ImportacaoDocs from '../pages/Interno/ImportacaoDocs'
import ImportacaoBase from '../pages/Interno/ImportacaoBase/ImportacaoBase'

import Administradoras from '../pages/Interno/Administradoras/Administradoras'
import CadastroAdministradora from '../pages/Interno/Administradoras/CadastroAdministradora'
import EditarAdministradora from '../pages/Interno/Administradoras/EditarAdministradora'
import DetalhesAdministradora from '../pages/Interno/Administradoras/DetalhesAdministradora'
import MinhaAdministradora from '../pages/Interno/Administradoras/MinhaAdministradora'

import Usuarios from '../pages/Interno/Usuarios/Usuarios'

import MinhaConta from '../pages/MinhaConta/MinhaConta'

import AcompanhamentoFaturados from '../pages/Interno/AcompanhamentoFaturados/AcompanhamentoFaturados'
import BoletosVR from '../pages/Interno/BoletosVR/BoletosVR'
import Operacional from '../pages/Operacional/Operacional'
import ConsultarBoletos from '../pages/Interno/ConsultarBoletos/ConsultarBoletos'
import PedidoCartao from '../pages/Interno/PedidoCartao/PedidoCartao'
import PedidosCartaoOperacional from '../pages/Operacional/PedidosCartao/PedidosCartaoOperacional'

const AppRouter = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? (
                user?.tipo === 'fat'
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/home" replace />
              )
              : <Login />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated
              ? (
                user?.tipo === 'fat'
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/home" replace />
              )
              : <Login />
          }
        />

        <Route
          path="/esqueci-senha"
          element={
            isAuthenticated
              ? (
                user?.tipo === 'fat'
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/home" replace />
              )
              : <EsqueciSenha />
          }
        />

        <Route path="/resetar-senha/:token" element={<ResetarSenha />} />

        {/* Protegidas */}
        <Route element={<PrivateRouter />}>
          <Route element={<MainLayout />}>

            {/* Dashboard */}
            <Route
              path="/home"
              element={
                <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                  <Dashboard />
                </PrivateRouter>
              }
            />

            {/* Minha Conta */}
            <Route path="/minha-conta" element={<MinhaConta />} />

            {/* Client */}
            <Route
              path="/importacao"
              element={
                <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                  <Importacao />
                </PrivateRouter>
              }
            />

            <Route
              path="/faturamento"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev', 'adm', 'dep']}>
                  <Faturamento />
                </PrivateRouter>
              }
            />

            <Route
              path="/faturamento/individual"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev', 'adm', 'dep']}>
                  <FaturamentoIndividual />
                </PrivateRouter>
              }
            />

            <Route
              path="/faturamento/repetir"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev', 'adm', 'dep']}>
                  <FaturamentoFormulario modo="repetir" />
                </PrivateRouter>
              }
            />

            <Route
              path="/faturamento/novo"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev', 'adm', 'dep']}>
                  <FaturamentoFormulario modo="novo" />
                </PrivateRouter>
              }
            />

            <Route path="/pendentes" element={
              <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                <Pendentes />
              </PrivateRouter>
            } />
            <Route path="/historico" element={
              <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                <Historico />
              </PrivateRouter>
            } />

            <Route
              path="/gerenciamento"
              element={
                <PrivateRouter allowedRoles={['fat', 'adm', 'dev']}>
                  <GerenciamentoCondominios />
                </PrivateRouter>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRouter allowedRoles={['fat', 'fin', 'dev']}>
                  <ColaboradorDashboard />
                </PrivateRouter>
              }
            />

            <Route
              path="/relatorios"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <RelatoriosBeneficios />
                </PrivateRouter>
              }
            />

            <Route
              path="/boletos-vr"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <BoletosVR view="dashboard" />
                </PrivateRouter>
              }
            />

            <Route
              path="/boletos-vr/kanban"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <BoletosVR view="kanban" />
                </PrivateRouter>
              }
            />

            <Route
              path="/boletos-vr/faturas"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <BoletosVR view="faturas" />
                </PrivateRouter>
              }
            />

            <Route
              path="/boletos-vr/analises"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <BoletosVR view="analises" />
                </PrivateRouter>
              }
            />

            {/* Operacional */}
            <Route
              path="/operacional"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <Operacional view="dashboard" />
                </PrivateRouter>
              }
            />
            <Route
              path="/operacional/kanban"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <Operacional view="kanban" />
                </PrivateRouter>
              }
            />
            <Route
              path="/operacional/faturas"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <Operacional view="faturas" />
                </PrivateRouter>
              }
            />
            <Route
              path="/operacional/analises"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <Operacional view="analises" />
                </PrivateRouter>
              }
            />

            <Route
              path="/colaborador/importacaoDocs"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat', 'colaborador_fedcorp']}>
                  <ImportacaoDocs />
                </PrivateRouter>
              }
            />

            {/* Administradoras */}
            <Route
              path="/interno/administradoras"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <Administradoras />
                </PrivateRouter>
              }
            />

            <Route
              path="/interno/cadastrar-administradora"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <CadastroAdministradora />
                </PrivateRouter>
              }
            />

            <Route
              path="/interno/administradoras/:id"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <DetalhesAdministradora />
                </PrivateRouter>
              }
            />

            <Route
              path="/interno/administradoras/editar/:id"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <EditarAdministradora />
                </PrivateRouter>
              }
            />

            <Route
              path="/interno/minha-administradora"
              element={
                <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                  <MinhaAdministradora />
                </PrivateRouter>
              }
            />

            {/* Importação de Base */}
            <Route
              path="/interno/importacao-base"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <ImportacaoBase />
                </PrivateRouter>
              }
            />

            {/* Usuários */}
            <Route
              path="/interno/usuarios"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat']}>
                  <Usuarios />
                </PrivateRouter>
              }
            />

            {/* Consultar Boletos */}
            <Route
              path="/interno/consultar-boletos"
              element={
                <PrivateRouter allowedRoles={['dev', 'fat', 'adm']}>
                  <ConsultarBoletos />
                </PrivateRouter>
              }
            />


            { /* Colaborador */}
            <Route
              path="/colaboradores/acompanhamento"
              element={
                <PrivateRouter allowedRoles={['adm', 'dep', 'dev', 'fat']}>
                  <AcompanhamentoFaturados />
                </PrivateRouter>
              }
            />

            { /* Pedidos de Cartão - Administradora */}
            <Route
              path="/pedidos-cartao"
              element={
                <PrivateRouter allowedRoles={['adm']}>
                  <PedidoCartao />
                </PrivateRouter>
              }
            />

            { /* Pedidos de Cartão - Operacional */}
            <Route
              path="/operacional/pedidos-cartao"
              element={
                <PrivateRouter allowedRoles={['fat', 'dev']}>
                  <PedidosCartaoOperacional />
                </PrivateRouter>
              }
            />

          </Route>
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  )
}

export default AppRouter
