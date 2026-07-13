import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiClock, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import * as S from './StatusBadgeStyles';

const statusConfig = {
  sucesso: {
    icon: FiCheckCircle,
    label: 'Sucesso',
  },
  erro: {
    icon: FiAlertCircle,
    label: 'Erro',
  },
  processando: {
    icon: FiClock,
    label: 'Processando',
  },
  warning: {
    icon: FiAlertTriangle,
    label: 'Atenção',
  },
  info: {
    icon: FiInfo,
    label: 'Info',
  },
};

export default function StatusBadge({ status, label, showIcon = true, className }) {
  const config = statusConfig[status] || statusConfig.info;
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <S.Badge $status={status} className={className}>
      {showIcon && (
        <S.BadgeIcon>
          <Icon size={12} />
        </S.BadgeIcon>
      )}
      {displayLabel}
    </S.Badge>
  );
}