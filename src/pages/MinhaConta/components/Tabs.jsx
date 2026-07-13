import React from 'react';
import { FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import * as S from '../MinhaContaStyles';

const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <FaUserCircle /> },
    { id: 'senha', label: 'Segurança', icon: <FaShieldAlt /> }
  ];

  return (
    <S.TabsContainer role="tablist">
      {tabs.map(tab => (
        <S.Tab
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </S.Tab>
      ))}
    </S.TabsContainer>
  );
};

export default Tabs;