import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Sidebar.css'

const navConfig = {
  cliente: [
     { to: '/', label: 'Início' },
    { to: '/importacao', label: 'Importação' },
    { to: '/faturamento', label: 'Faturamento' },
    // { to: '/pendentes', label: 'Pendentes' },
    // { to: '/historico', label: 'Histórico' },
    // { to: '/relatorios', label: 'Relatórios' },
    { to: '/gerenciamento', label: 'Gerenciamento' },
    // Temporariamente para acesso rápido
    { to: '/colaborador/dashboard', label: 'Dashboard Fedcorp' },
    { to: '/interno/administradoras', label: 'Administradoras' },

    { to: '/interno/usuarios', label: 'Gestão de Usuários' },

    { to: '/interno/administradoras/minha-administradora', label: 'Minha Administradora' },
    // { to: '/colaborador/importacaoDocs', label: 'Importação Fedcorp' },
  ],
  colaborador_fedcorp: [
    { to: '/colaborador/dashboard', label: 'Dashboard' },
     { to: '/colaborador/dashboard', label: 'Dashboard' },
    { to: '/pendentes', label: 'Pendentes' },
    { to: '/colaborador/importar-faturamento', label: 'Importar Faturamento' },
    { to: '/colaborador/historico', label: 'Histórico' },
    { to: '/interno/administradoras', label: 'Administradoras' },

    { to: '/interno/administradoras/minha-administradora', label: 'Minha Administradora' },
    
    { to: '/interno/usuarios', label: 'Gestão de Usuários' },

  ],
}

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const role = user?.role || 'cliente'
  const menuItems = navConfig[role] || navConfig.cliente

  return (
    <aside className="sidebar">
      <div className="logo-sidebar">
        <img
          src="\src\public\imagens\logo2.png"
          alt="Fedcorp Logo"
          className="logoImg"
        />
      </div>

      <nav className="nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}

        <div className="logout-section">
          <a onClick={handleLogout} role="button" className="logout-link">
            Sair
          </a>
        </div>
      </nav>
    </aside>
  )
}
