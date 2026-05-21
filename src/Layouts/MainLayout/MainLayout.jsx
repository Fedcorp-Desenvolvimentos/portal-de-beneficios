import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import * as S from './MainLayoutStyles';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

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