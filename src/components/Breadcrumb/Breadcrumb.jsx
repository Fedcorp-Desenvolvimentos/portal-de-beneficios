import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiChevronDown, FiLogOut, FiHome, FiChevronRight, FiUsers, FiUserPlus, FiClock, FiCalendar } from 'react-icons/fi';
import { FaHistory, FaRegUser } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import { getAccessLevelLabel, getAccessLevelColor, ACCESS_LEVELS } from '../../utils/accessLevels';
import { formatarData, formatTempo } from '../../utils/formatar_data';
import * as S from './BreadcrumbStyles';

function Breadcrumb({ onToggleSidebar, sidebarOpen, className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const routeNames = {
    '/home': 'Dashboard',
    '/consultas': 'Consultas',
    '/consultas/consulta-pf': 'Consulta PF',
    '/consulta-comercial': 'Comercial',
    '/ferramentas': 'Ferramentas',
    '/faturamento': 'Faturamento',
    '/metricas': 'Métricas',
    '/agenda': 'Agenda de Salas',
    '/gerenciar-usuarios': 'Gerenciar Usuários',
    '/minha-conta': 'Minha Conta',
    '/cadastro': 'Cadastro',
    '/historico': 'Histórico'
  };

  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    let breadcrumbItems = [];
    let currentPath = '';
    
    if (location.pathname !== '/home') {
      breadcrumbItems.push({ label: 'Home', icon: <FiHome size={14} />, path: '/home' });
    }
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (segment === 'home' && index === 0) return;
      let label = routeNames[currentPath] || segment.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
      breadcrumbItems.push({ label, path: currentPath });
    });
    
    return breadcrumbItems;
  };

  const canManageUsers = () =>
    user?.tipo === ACCESS_LEVELS.ADM ||
    user?.tipo === ACCESS_LEVELS.DESENVOLVEDOR;

  const canRegisterUsers = () =>
    user?.tipo === ACCESS_LEVELS.ADM ||
    user?.tipo === ACCESS_LEVELS.DESENVOLVEDOR;

  const canViewHistory = () =>
    user?.tipo === ACCESS_LEVELS.ADM ||
    user?.tipo === ACCESS_LEVELS.DESENVOLVEDOR ||
    user?.tipo === ACCESS_LEVELS.CLIENTE;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const breadcrumbItems = getBreadcrumb();
  const getUserInitials = () => {
    if (user?.nome_completo) {
      const names = user.nome_completo.split(' ');
      return names.length > 1 ? (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase() : user.nome_completo.charAt(0).toUpperCase();
    }
    return user?.nome?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => user?.nome_completo?.split(' ')[0] || user?.nome?.split(' ')[0] || user?.username?.split(' ')[0] || user?.email?.split('@')[0].split(' ')[0] || 'Usuário';
  const getUserEmail = () => user?.email || 'usuario@email.com';
  const accessLevelLabel = getAccessLevelLabel(user?.tipo);
  const accessLevelColor = getAccessLevelColor(user?.tipo);

  // Formatação melhorada para data e hora
  const formatDateDetailed = (date) => {
    const options = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const formatTimeDetailed = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <S.Nav className={className} $sidebarOpen={sidebarOpen}>
      <S.LeftSection>
        <S.MenuButton onClick={onToggleSidebar} aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}>
          <FiMenu size={20} />
        </S.MenuButton>

        <S.BreadcrumbContainer>
          {breadcrumbItems.map((item, index) => (
            <S.BreadcrumbItem key={index}>
              {index > 0 && <S.Separator><FiChevronRight /></S.Separator>}
              <S.BreadcrumbLink
                $active={index === breadcrumbItems.length - 1}
                onClick={() => index < breadcrumbItems.length - 1 && navigate(item.path)}
                disabled={index === breadcrumbItems.length - 1}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </S.BreadcrumbLink>
            </S.BreadcrumbItem>
          ))}
        </S.BreadcrumbContainer>
      </S.LeftSection>

      <S.RightSection>
        <S.DateTimeContainer>
          <S.DateWrapper>
            <FiCalendar size={12} />
            <S.Date>{formatDateDetailed(currentTime)}</S.Date>
          </S.DateWrapper>
          <S.TimeWrapper>
            <FiClock size={12} />
            <S.Time>{formatTimeDetailed(currentTime)}</S.Time>
          </S.TimeWrapper>
        </S.DateTimeContainer>

        <S.UserContainer ref={dropdownRef}>
          <S.UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
            <S.UserAvatar>{getUserInitials()}</S.UserAvatar>
            {!isMobile && (
              <S.UserInfo>
                <S.UserName>{getUserName()}</S.UserName>
                <S.UserRole $color={accessLevelColor}>{accessLevelLabel}</S.UserRole>
              </S.UserInfo>
            )}
            <S.DropdownArrow $rotated={showUserMenu}>
              <FiChevronDown />
            </S.DropdownArrow>
          </S.UserButton>

          {showUserMenu && (
            <S.Dropdown>
              <S.DropdownHeader>
                <S.DropdownUserInfo>
                  <S.DropdownAvatar>{getUserInitials()}</S.DropdownAvatar>
                  <div>
                    <S.DropdownName>{getUserName()}</S.DropdownName>
                    <S.DropdownEmail>{getUserEmail()}</S.DropdownEmail>
                    <S.DropdownNivel>
                      <S.AccessBadge $color={accessLevelColor}>{accessLevelLabel}</S.AccessBadge>
                    </S.DropdownNivel>
                  </div>
                </S.DropdownUserInfo>
              </S.DropdownHeader>
              
              <S.Divider />
              
              <S.DropdownItem onClick={() => { navigate('/minha-conta'); setShowUserMenu(false); }}>
                <S.DropdownIcon><FaRegUser /></S.DropdownIcon> Minha Conta
              </S.DropdownItem>

              {/* {canManageUsers() && (
                <S.DropdownItem onClick={() => { navigate('/gerenciar-usuarios'); setShowUserMenu(false); }}>
                  <S.DropdownIcon><FiUsers /></S.DropdownIcon> Gerenciar Usuários
                </S.DropdownItem>
              )}

              {canRegisterUsers() && (
                <S.DropdownItem onClick={() => { navigate('/cadastro'); setShowUserMenu(false); }}>
                  <S.DropdownIcon><FiUserPlus /></S.DropdownIcon> Cadastrar Usuários
                </S.DropdownItem>
              )}

              {canViewHistory() && (
                <S.DropdownItem onClick={() => { navigate('/historico'); setShowUserMenu(false); }}>
                  <S.DropdownIcon><FaHistory /></S.DropdownIcon> Histórico
                </S.DropdownItem>
              )} */}
              
              <S.Divider />
              
              <S.DropdownItem $logout onClick={handleLogout}>
                <S.DropdownIcon><FiLogOut /></S.DropdownIcon> Sair
              </S.DropdownItem>
            </S.Dropdown>
          )}
        </S.UserContainer>
      </S.RightSection>

      {showUserMenu && <S.MenuOverlay onClick={() => setShowUserMenu(false)} />}
    </S.Nav>
  );
}

export default Breadcrumb;