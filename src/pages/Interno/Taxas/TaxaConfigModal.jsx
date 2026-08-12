import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import { taxaConfigService } from '../../../services/taxaConfigService';
import MultiSearchableSelect from '../../../components/MultiSearchableSelect/MultiSearchableSelect.jsx';

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

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 240px;
  overflow-y: auto;
  z-index: 999;
`;

const SearchOption = styled.button`
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: ${({ $selected }) => ($selected ? '#eff6ff' : 'transparent')};
  text-align: left;
  font-size: 14px;
  font-family: inherit;
  color: ${({ $selected }) => ($selected ? '#2563eb' : '#0f172a')};
  font-weight: ${({ $selected }) => ($selected ? '600' : '400')};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ $selected }) => ($selected ? '#eff6ff' : '#f8fafc')};
  }
`;

const SearchEmpty = styled.div`
  padding: 10px 12px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
`;

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
    vinculos: [],
    produto: '',
    taxa_tipo: 'PERC',
    taxa_valor: '',
    ativo: true,
  });
  const [produtoSearch, setProdutoSearch] = useState('');
  const [produtoDropdownOpen, setProdutoDropdownOpen] = useState(false);
  const produtoWrapperRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (taxa) {
        setFormData({
          vinculos: taxa.vinculo ? [taxa.vinculo] : [],
          produto: taxa.produto || '',
          taxa_tipo: taxa.taxa_tipo || 'PERC',
          taxa_valor: taxa.taxa_valor || '',
          ativo: taxa.ativo !== false,
        });
      } else {
        setFormData({
          vinculos: [],
          produto: '',
          taxa_tipo: 'PERC',
          taxa_valor: '',
          ativo: true,
        });
      }
      setProdutoSearch('');
      setProdutoDropdownOpen(false);
    }
  }, [taxa, isOpen]);

  useEffect(() => {
    if (!produtoDropdownOpen) {
      const selected = (produtos || []).find((p) => String(p.codigo_produto) === String(formData.produto));
      setProdutoSearch(selected ? `${selected.nome} (${selected.codigo_produto})` : '');
    }
  }, [produtoDropdownOpen, formData.produto, produtos]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (produtoWrapperRef.current && !produtoWrapperRef.current.contains(e.target)) {
        setProdutoDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const produtosFiltrados = produtoSearch
    ? (produtos || []).filter(
        (p) =>
          p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
          String(p.codigo_produto).includes(produtoSearch)
      )
    : (produtos || []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vinculos.length) {
      enqueueSnackbar('Selecione pelo menos um vínculo', { variant: 'warning' });
      return;
    }

    setLoading(true);

    const basePayload = {
      produto: formData.produto ? Number(formData.produto) : null,
      taxa_tipo: formData.taxa_tipo,
      taxa_valor: parseFloat(formData.taxa_valor) || 0,
      ativo: formData.ativo,
    };

    try {
      if (taxa?.id) {
        await taxaConfigService.atualizar(taxa.id, {
          ...basePayload,
          vinculo: Number(formData.vinculos[0]),
        });
        enqueueSnackbar('Taxa atualizada com sucesso!', { variant: 'success' });
        onSave();
        onClose();
        return;
      }

      // Criação em lote: uma requisição por vínculo, com upsert para não
      // violar a unicidade vinculo+produto do backend.
      let criadas = 0;
      let atualizadas = 0;
      const falhas = [];

      for (const vinculoId of formData.vinculos) {
        const payload = { ...basePayload, vinculo: Number(vinculoId) };
        try {
          const existentes = await taxaConfigService.listar({ vinculo: vinculoId });
          const lista = Array.isArray(existentes) ? existentes : existentes?.results || [];
          const existente = lista.find(
            (t) =>
              String(t.produto_codigo ?? t.produto ?? '') === String(formData.produto || '') &&
              !t.tipo
          );
          if (existente) {
            await taxaConfigService.atualizar(existente.id, payload);
            atualizadas += 1;
          } else {
            await taxaConfigService.criar(payload);
            criadas += 1;
          }
        } catch (error) {
          const vinculoInfo = (vinculos || []).find((v) => String(v.id) === String(vinculoId));
          const nome = vinculoInfo?.condominio_nome || `Vínculo ${vinculoId}`;
          const msg = error?.response?.data?.detail || 'erro ao salvar';
          falhas.push(`${nome}: ${msg}`);
        }
      }

      const resumo = [];
      if (criadas) resumo.push(`${criadas} taxa(s) criada(s)`);
      if (atualizadas) resumo.push(`${atualizadas} atualizada(s)`);
      if (resumo.length) {
        enqueueSnackbar(resumo.join(', '), { variant: falhas.length ? 'warning' : 'success' });
      }
      falhas.forEach((f) => enqueueSnackbar(f, { variant: 'error' }));

      if (criadas || atualizadas) {
        onSave();
        onClose();
      }
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
            <label>{taxa?.id ? 'Vínculo (Admin - Condomínio) *' : 'Vínculos (Admin - Condomínio) *'}</label>
            <MultiSearchableSelect
              options={(vinculos || []).map((v) => ({
                value: v.id,
                label: v.condominio_nome || v.administradora_nome || `Vínculo ${v.id}`,
                sublabel: [v.administradora_nome, v.condominio_cnpj].filter(Boolean).join(' — '),
              }))}
              values={formData.vinculos}
              onChange={(novos) =>
                setFormData((prev) => ({
                  ...prev,
                  // Em edição a taxa pertence a um único vínculo: mantém só o último escolhido.
                  vinculos: taxa?.id ? novos.slice(-1) : novos,
                }))
              }
              placeholder="Buscar por condomínio, CNPJ ou administradora..."
              disabled={loading}
            />
          </FormGroup>

          <FormGroup ref={produtoWrapperRef}>
            <label>Produto (vazio = todos)</label>
            <input
              type="text"
              value={produtoDropdownOpen ? produtoSearch : (formData.produto ? `${(produtos || []).find((p) => String(p.codigo_produto) === String(formData.produto))?.nome || ''} (${formData.produto})` : '')}
              onChange={(e) => {
                setProdutoSearch(e.target.value);
                setProdutoDropdownOpen(true);
              }}
              onFocus={() => setProdutoDropdownOpen(true)}
              placeholder="Buscar produto..."
              onKeyDown={(e) => {
                if (e.key === 'Escape') setProdutoDropdownOpen(false);
              }}
            />
            {produtoDropdownOpen && (
              <SearchDropdown>
                <SearchOption
                  $selected={!formData.produto}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, produto: '' }));
                    setProdutoSearch('');
                    setProdutoDropdownOpen(false);
                  }}
                >
                  Todos os produtos
                </SearchOption>
                {produtosFiltrados.length === 0 ? (
                  <SearchEmpty>Nenhum resultado</SearchEmpty>
                ) : (
                  produtosFiltrados.map((p) => (
                    <SearchOption
                      key={p.codigo_produto}
                      $selected={String(formData.produto) === String(p.codigo_produto)}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, produto: p.codigo_produto }));
                        setProdutoSearch(`${p.nome} (${p.codigo_produto})`);
                        setProdutoDropdownOpen(false);
                      }}
                    >
                      {p.nome} ({p.codigo_produto})
                    </SearchOption>
                  ))
                )}
              </SearchDropdown>
            )}
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
