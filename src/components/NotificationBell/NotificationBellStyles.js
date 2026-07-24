import styled from 'styled-components'

export const BellWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const BellButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`

export const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
`

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
`

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-height: 420px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const DropdownHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const DropdownBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`

export const SectionLabel = styled.div`
  padding: 6px 16px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
`

export const NotificationCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  cursor: default;
  transition: background 0.1s;
  border-left: 3px solid ${({ $variant }) => ($variant === 'pago' ? '#22c55e' : '#ef4444')};
  background: ${({ $variant }) => ($variant === 'pago' ? '#f0fdf4' : '#fef2f2')};

  &:hover {
    background: ${({ $variant }) => ($variant === 'pago' ? '#dcfce7' : '#fee2e2')};
  }
`

export const CardContent = styled.div`
  flex: 1;
  min-width: 0;
`

export const CardTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CardMeta = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
`

export const CardValue = styled.span`
  font-weight: 600;
  color: #16a34a;
`

export const EmptyState = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`

export const DropdownFooter = styled.div`
  padding: 10px 16px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
`

export const FooterLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: #eff6ff;
  }
`
