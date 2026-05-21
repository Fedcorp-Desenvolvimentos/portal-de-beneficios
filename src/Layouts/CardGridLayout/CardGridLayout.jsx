//src/Layouts/CardGridLayout.jsx

import React from 'react';
import * as S from './CardGridLayoutStyles';
import PageLayout from '../PageLayout/PageLayout';

const CardGridLayout = ({ 
  title,
  subtitle,
  icon,
  loading,
  empty,
  emptyMessage,
  helpContent,
  items,
  renderCard,
  gridProps = {}
}) => {
  if (empty && (!items || items.length === 0)) {
    return (
      <PageLayout
        title={title}
        subtitle={subtitle}
        icon={icon}
        loading={loading}
        empty={empty}
        emptyMessage={emptyMessage}
        helpContent={helpContent}
      />
    );
  }

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      loading={loading}
      helpContent={helpContent}
    >
      <S.CardsGrid {...gridProps}>
        {items?.map((item, index) => renderCard(item, index))}
      </S.CardsGrid>
    </PageLayout>
  );
};

export default CardGridLayout;