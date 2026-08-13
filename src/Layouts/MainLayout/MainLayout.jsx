import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import * as S from './MainLayoutStyles';

// Preferência de sidebar recolhida no desktop persiste entre sessões.
const SIDEBAR_STORAGE_KEY = 'sidebar_recolhida';

const sidebarInicial = () => {
  if (window.innerWidth <= 768) return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== '1';
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(sidebarInicial);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      // Ao cruzar o breakpoint, respeita a preferência salva no desktop
      // (antes o resize sempre forçava aberto e descartava a escolha).
      setSidebarOpen(desktop ? localStorage.getItem(SIDEBAR_STORAGE_KEY) !== '1' : false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () =>
    setSidebarOpen(prev => {
      const next = !prev;
      if (window.innerWidth > 768) {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '0' : '1');
      }
      return next;
    });

  return (
    <S.Layout>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleSidebar={toggleSidebar} />
      <S.Main>
        <Breadcrumb 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <S.Content $withSidebar={sidebarOpen} $isDesktop={isDesktop}>
          <S.PageContainer>
            <S.ContentWrapper>
              <Outlet context={{ withSidebar: sidebarOpen }} />
            </S.ContentWrapper>
          </S.PageContainer>
        </S.Content>
      </S.Main>
    </S.Layout>
  );
};

export default MainLayout;