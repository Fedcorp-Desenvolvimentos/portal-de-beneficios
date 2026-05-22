import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaBriefcase,
  FaTools,
  FaWallet,
  FaChartBar,
  FaCalendarAlt,
  FaChartLine,
  FaCog,
  FaProjectDiagram,
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaFileUpload,
  FaFileInvoiceDollar,
  FaUserPlus,
  FaExchangeAlt,
  FaDatabase,
  FaUserCircle
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import * as S from "./SidebarStyles";

function Sidebar({ sidebarOpen, setSidebarOpen, toggleSidebar }) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();

  const nivelAcesso = user?.tipo;
  const emailUsuario = user?.email;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (isMobile) setOverlayVisible(sidebarOpen);
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    function handleClickOutside(e) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
        setOverlayVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, setSidebarOpen, isMobile]);

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
      setOverlayVisible(false);
    }
  };

  // Função para verificar se o usuário tem acesso ao item
  const hasAccess = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(nivelAcesso);
  };

  const navItems = [
    // Rotas base (liberadas)
    {
      path: "/home",
      label: "Início",
      icon: <FaHome />,
      allowed: ["adm", "dev"]
    },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaChartBar />,
      allowed: ["fat", "fin", "dev"]
    },
    {
      path: "/importacao",
      label: "Upload",
      icon: <FaFileUpload />,
      allowed: ["adm", "dev"]
    },
    {
      path: "/faturamento",
      label: "Faturamento",
      icon: <FaFileInvoiceDollar />,
      allowed: ["fat", "dev"]
    },
    {
      path: "/gerenciamento",
      label: "Condomínios",
      icon: <FaBuilding />,
      allowed: ["fat", "adm", "dev"]
    },
    {
      path: "/interno/usuarios",
      label: "Usuários",
      icon: <FaUsers />,
      allowed: ["dev", "fat"]
    },
    { 
      path: "/colaboradores/acompanhamento", 
      label: "Acompanhamento", 
      icon: <FaChartLine />, 
      allowed: ["adm", "dev"] 
    },
    // {
    //   path: "/colaboradores/acompanhamento",
    //   label: "Acompanhamento",
    //   icon: <FaChartLine />,
    //   allowed: ["fat", "dev"]
    // },
    {
      path: "/interno/administradoras",
      label: "Administradoras",
      icon: <FaBuilding />,
      allowed: ["dev", "fat"]
    },
    {
      path: "/interno/minha-administradora",
      label: "Minha Administradora",
      icon: <FaBuilding />,
      allowed: ["adm", "fat", "dev"]
    },
    // {
    //   path: '/minha-conta',
    //   label: 'Minha Conta',
    //   icon: <FaUserCircle />,
    //   allowed: ['adm', 'cli', 'fin', 'fat', 'dev']
    // }
    // { 
    //   path: "/movimentacoes", 
    //   label: "Movimentações", 
    //   icon: <FaExchangeAlt />, 
    //   allowed: ["adm", "fat", "dev"] 
    // },
    // { 
    //   path: "/beneficios", 
    //   label: "Benefícios", 
    //   icon: <FaWallet />, 
    //   allowed: ["adm", "cli", "fin", "fat", "dev"] 
    // },
  ];

  // Filtra os itens baseado no nível de acesso do usuário
  const filteredNavItems = navItems.filter(item => hasAccess(item.allowed));

  return (
    <>
      {isMobile && overlayVisible && (
        <S.Overlay onClick={() => {
          setSidebarOpen(false);
          setOverlayVisible(false);
        }} />
      )}

      <S.SidebarContainer
        ref={sidebarRef}
        $isOpen={sidebarOpen}
        aria-label="Menu lateral principal"
      >
        <S.SidebarHeader>
          <S.LogoLink href="/home" onClick={handleLinkClick}>
            <S.Logo
              src="/imagens/LOGO.png"
              alt="Fedcorp Logo"
              $isClosed={!sidebarOpen}
              $isMobile={isMobile}
            />
          </S.LogoLink>

          {isMobile && (
            <S.CloseButton
              $isOpen={sidebarOpen}
              onClick={() => {
                setSidebarOpen(false);
                setOverlayVisible(false);
              }}
              aria-label="Fechar menu"
            >
              <i className="bi bi-x-lg"></i>
            </S.CloseButton>
          )}
        </S.SidebarHeader>

        <S.Nav>
          <ul>
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              return (
                <li key={item.path} className={isActive ? "active" : ""}>
                  <S.NavLink
                    as={Link}
                    to={item.path}
                    $isActive={isActive}
                    $isClosed={!sidebarOpen}
                    $isOpen={sidebarOpen}
                    data-tooltip={item.label}
                    onClick={handleLinkClick}
                  >
                    <S.IconTooltip $isClosed={!sidebarOpen} $isOpen={sidebarOpen}>
                      <S.IconWrapper>
                        {item.icon}
                      </S.IconWrapper>
                      <S.LinkText>{item.label}</S.LinkText>
                    </S.IconTooltip>
                  </S.NavLink>
                </li>
              );
            })}
          </ul>
        </S.Nav>
      </S.SidebarContainer>
    </>
  );
}

export default Sidebar;