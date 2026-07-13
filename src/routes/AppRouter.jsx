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
            <Route path="/home" element={<Dashboard />} />

            {/* Minha Conta */}
            <Route path="/minha-conta" element={<MinhaConta />} />

            {/* Client */}
            <Route path="/importacao" element={<Importacao />} />

            <Route path="/faturamento" element={<Faturamento />} />

            <Route path="/faturamento/individual" element={<FaturamentoIndividual />} />

            <Route
              path="/faturamento/repetir"
              element={<FaturamentoFormulario modo="repetir" />}
            />

            <Route
              path="/faturamento/novo"
              element={<FaturamentoFormulario modo="novo" />}
            />

            <Route path="/pendentes" element={<Pendentes />} />
            <Route path="/historico" element={<Historico />} />

            <Route
              path="/gerenciamento"
              element={<GerenciamentoCondominios />}
            />

            <Route
              path="/dashboard"
              element={<ColaboradorDashboard />}
            />

            <Route
              path="/relatorios"
              element={<RelatoriosBeneficios />}
            />

            <Route
              path="/boletos-vr"
              element={<BoletosVR view="dashboard" />}
            />

            <Route
              path="/boletos-vr/kanban"
              element={<BoletosVR view="kanban" />}
            />

            <Route
              path="/boletos-vr/faturas"
              element={<BoletosVR view="faturas" />}
            />

            <Route
              path="/boletos-vr/analises"
              element={<BoletosVR view="analises" />}
            />

            {/* Operacional */}
            <Route
              path="/operacional"
              element={<Operacional view="dashboard" />}
            />
            <Route
              path="/operacional/kanban"
              element={<Operacional view="kanban" />}
            />
            <Route
              path="/operacional/faturas"
              element={<Operacional view="faturas" />}
            />
            <Route
              path="/operacional/analises"
              element={<Operacional view="analises" />}
            />

            <Route
              path="/colaborador/importacaoDocs"
              element={
                <PrivateRouter allowedRoles={['dev', 'colaborador_fedcorp']}>
                  <ImportacaoDocs />
                </PrivateRouter>
              }
            />

            {/* Administradoras */}
            <Route
              path="/interno/administradoras"
              element={<Administradoras />}
            />

            <Route
              path="/interno/cadastrar-administradora"
              element={<CadastroAdministradora />}
            />

            <Route
              path="/interno/administradoras/:id"
              element={<DetalhesAdministradora />}
            />

            <Route
              path="/interno/administradoras/editar/:id"
              element={<EditarAdministradora />}
            />

            <Route
              path="/interno/minha-administradora"
              element={<MinhaAdministradora />}
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
              element={<Usuarios />}
            />


            { /* Colaborador */}
            <Route
              path="/colaboradores/acompanhamento"
              element={
                <AcompanhamentoFaturados />
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
