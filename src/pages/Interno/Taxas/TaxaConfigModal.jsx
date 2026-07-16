import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import { taxaConfigService } from '../../../services/taxaConfigService';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
`;

const Modal = styled.div`
  width: min(500px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  input, select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: #fff;
    color: #0f172a;
    transition: border-color 0.15s;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #0f172a;
  cursor: pointer;

  input {
    width: 16px !important;
    min-width: 16px;
    accent-color: #2563eb;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
`;

const Btn = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => $variant === 'primary' && `
    background: #2563eb;
    color: #fff;
    &:hover:not(:disabled) { background: #1d4ed8; }
  `}

  ${({ $variant }) => $variant === 'secondary' && `
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    &:hover:not(:disabled) { background: #e2e8f0; }
  `}
`;

const PERCENTUAIS = [
  { value: '', label: 'Selecione' },
  { value: '0', label: '0%' },
  { value: '0.5', label: '0,5%' },
  { value: '1', label: '1%' },
  { value: '1.5', label: '1,5%' },
  { value: '2', label: '2%' },
  { value: '2.5', label: '2,5%' },
  { value: '3', label: '3%' },
  { value: '3.5', label: '3,5%' },
  { value: '4', label: '4%' },
  { value: '4.5', label: '4,5%' },
  { value: '5', label: '5%' },
  { value: '6', label: '6%' },
  { value: '7', label: '7%' },
  { value: '8', label: '8%' },
  { value: '9', label: '9%' },
  { value: '10', label: '10%' },
];

export default function TaxaConfigModal({
  isOpen,
  onClose,
  onSave,
  taxa,
  vinculos,
  produtos,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vinculo: '',
    produto: '',
    taxa_tipo: 'PERC',
    taxa_valor: '',
    ativo: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (taxa) {
        setFormData({
          vinculo: taxa.vinculo || '',
          produto: taxa.produto || '',
          taxa_tipo: taxa.taxa_tipo || 'PERC',
          taxa_valor: taxa.taxa_valor || '',
          ativo: taxa.ativo !== false,
        });
      } else {
        setFormData({
          vinculo: '',
          produto: '',
          taxa_tipo: 'PERC',
          taxa_valor: '',
          ativo: true,
        });
      }
    }
  }, [taxa, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        vinculo: Number(formData.vinculo),
        produto: formData.produto ? Number(formData.produto) : null,
        taxa_tipo: formData.taxa_tipo,
        taxa_valor: parseFloat(formData.taxa_valor) || 0,
        ativo: formData.ativo,
      };

      if (!payload.vinculo) {
        enqueueSnackbar('Selecione um vínculo', { variant: 'warning' });
        setLoading(false);
        return;
      }

      if (taxa?.id) {
        await taxaConfigService.atualizar(taxa.id, payload);
        enqueueSnackbar('Taxa atualizada com sucesso!', { variant: 'success' });
      } else {
        await taxaConfigService.criar(payload);
        enqueueSnackbar('Taxa criada com sucesso!', { variant: 'success' });
      }

      onSave();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Erro ao salvar taxa';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>{taxa?.id ? 'Editar Taxa' : 'Nova Taxa'}</h3>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Vínculo (Admin - Condomínio) *</label>
            <select
              name="vinculo"
              value={formData.vinculo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {(vinculos || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.administradora_nome || v.condominio_nome || `Vínculo ${v.id}`}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Produto (vazio = todos)</label>
            <select
              name="produto"
              value={formData.produto}
              onChange={handleChange}
            >
              <option value="">Todos os produtos</option>
              {(produtos || []).map((p) => (
                <option key={p.codigo_produto} value={p.codigo_produto}>
                  {p.nome} ({p.codigo_produto})
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Tipo da Taxa *</label>
            <select
              name="taxa_tipo"
              value={formData.taxa_tipo}
              onChange={handleChange}
              required
            >
              <option value="PERC">Percentual (%)</option>
              <option value="FIXO">Valor Fixo (R$)</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label>Valor da Taxa *</label>
            {formData.taxa_tipo === 'PERC' ? (
              <select
                name="taxa_valor"
                value={formData.taxa_valor}
                onChange={handleChange}
                required
              >
                {PERCENTUAIS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                name="taxa_valor"
                value={formData.taxa_valor}
                onChange={handleChange}
                placeholder="Ex: 5.00"
                step="0.01"
                min="0"
                required
              />
            )}
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
              />
              Configuração ativa
            </CheckboxLabel>
          </FormGroup>

          <Footer>
            <Btn type="button" $variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Btn>
            <Btn type="submit" $variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : taxa?.id ? 'Atualizar' : 'Criar'}
            </Btn>
          </Footer>
        </Form>
      </Modal>
    </Overlay>
  );
}
