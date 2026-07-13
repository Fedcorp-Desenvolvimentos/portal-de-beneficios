import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './TopNav.module.css';

export default function TopNav({ extraActions }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${styles['topnav-shell']} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.topnav}>
        <div className={styles['topnav-links']}>
          <NavLink
            to="/operacional"
            end
            className={({ isActive }) =>
              `${styles['topnav-link']} ${isActive ? styles.active : ''}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/operacional/kanban"
            className={({ isActive }) =>
              `${styles['topnav-link']} ${isActive ? styles.active : ''}`
            }
          >
            Kanban
          </NavLink>

          <NavLink
            to="/operacional/faturas"
            className={({ isActive }) =>
              `${styles['topnav-link']} ${isActive ? styles.active : ''}`
            }
          >
            Faturas VR
          </NavLink>

          <NavLink
            to="/operacional/analises"
            className={({ isActive }) =>
              `${styles['topnav-link']} ${isActive ? styles.active : ''}`
            }
          >
            Análises
          </NavLink>
        </div>
      </nav>

      {extraActions && (
        <div className={styles['topnav-actions']}>
          {extraActions}
        </div>
      )}
    </div>
  );
}