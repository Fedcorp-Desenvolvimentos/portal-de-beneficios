import React, { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import { Plus, PencilLine, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { taxaConfigService } from '../../../services/taxaConfigService';
import { userService } from '../../../services/userService';
import PageLayout from '../../../Layouts/PageLayout/PageLayout';
import TaxaConfigModal from './TaxaConfigModal';

const Container = styled.div`width: 100%;`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaeaea;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 12px;

  h2 { margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; }
`;

const NovoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #1d4ed8; }
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #fff;
  color: #0f172a;
  cursor: pointer;

  &:focus { outline: none; border-color: #2563eb; }
`;

const TableWrapper = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }

  tbody td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tbody tr:hover td { background: #f8fafc; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  ${({ $active }) => $active && `
    background: #dcfce7;
    color: #16a34a;
  `}

  ${({ $active }) => !$active && `
    background: #f1f5f9;
    color: #64748b;
  `}
`;

const TipoBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  ${({ $tipo }) => $tipo === 'PERC' && `
    background: #eff6ff;
    color: #2563eb;
  `}

  ${({ $tipo }) => $tipo === 'FIXO' && `
    background: #fef3c7;
    color: #d97706;
  `}
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }

  ${({ $variant }) => $variant === 'danger' && `
    color: #ef4444;
    &:hover { background: #fef2f2; border-color: #fecaca; }
  `}
`;

const Empty = styled.div`
  padding: 48px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
`;

const ConfirmModal = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
`;

const ConfirmTitle = styled.h3`margin: 0 0 8px; font-size: 16px; font-weight: 600;`;
const ConfirmText = styled.p`margin: 0 0 20px; font-size: 14px; color: #64748b;`;

const ConfirmActions = styled.div`display: flex; justify-content: flex-end; gap: 10px;`;

const ConfirmBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;

  ${({ $variant }) => $variant === 'cancel' && `
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  `}

  ${({ $variant }) => $variant === 'delete' && `
    background: #ef4444;
    color: #fff;
    &:hover { background: #dc2626; }
  `}
`;

export default function TaxasPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [taxas, setTaxas] = useState([]);
  const [vinculos, setVinculos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [administradoras, setAdministradoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAdm, setFiltroAdm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [taxaSelecionada, setTaxaSelecionada] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroAdm) params.administradora = filtroAdm;
      if (filtroStatus) params.ativo = filtroStatus === 'ativo';

      const [taxasData, vinculosData, produtosData] = await Promise.all([
        taxaConfigService.listar(params),
        taxaConfigService.listarVinculos(filtroAdm ? { administradora: filtroAdm } : {}),
        Promise.resolve([]),
      ]);

      setTaxas(Array.isArray(taxasData) ? taxasData : taxasData?.results || []);
      setVinculos(Array.isArray(vinculosData) ? vinculosData : vinculosData?.results || []);
      setProdutos(Array.isArray(produtosData) ? produtosData : produtosData?.results || []);

      try {
        const { userService: us } = await import('../../../services/userService');
        const adms = await us.listarAdministradoras();
        setAdministradoras(Array.isArray(adms) ? adms : adms?.results || []);
      } catch {
        setAdministradoras([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      enqueueSnackbar('Erro ao carregar configurações de taxa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filtroAdm, filtroStatus, enqueueSnackbar]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await taxaConfigService.remover(confirmDelete.id);
      enqueueSnackbar('Taxa removida com sucesso', { variant: 'success' });
      setConfirmDelete(null);
      await carregarDados();
    } catch (error) {
      enqueueSnackbar('Erro ao remover taxa', { variant: 'error' });
    }
  };

  const formatValor = (tipo, valor) => {
    if (tipo === 'PERC') return `${valor}%`;
    return `R$ ${Number(valor).toFixed(2)}`;
  };

  return (
    <PageLayout title="Configuração de Taxas" subtitle="Gerencie as taxas de administração por vínculo e produto">
      <Container>
        <Card>
          <CardHeader>
            <h2>Configurações de Taxa</h2>
            <NovoBtn onClick={() => { setTaxaSelecionada(null); setModalOpen(true); }}>
              <Plus size={16} /> Nova Taxa
            </NovoBtn>
          </CardHeader>

          <Filters>
            <Select value={filtroAdm} onChange={(e) => setFiltroAdm(e.target.value)}>
              <option value="">Todas as administradoras</option>
              {administradoras.map((adm) => (
                <option key={adm.id} value={adm.id}>
                  {adm.razao_social || adm.nome_fantasia || `ADM ${adm.id}`}
                </option>
              ))}
            </Select>

            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </Select>
          </Filters>

          {loading ? (
            <Empty>Carregando...</Empty>
          ) : taxas.length === 0 ? (
            <Empty>Nenhuma configuração de taxa encontrada.</Empty>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>Vínculo</th>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {taxas.map((t) => (
                    <tr key={t.id}>
                      <td>{t.vinculo_display || `Vínculo ${t.vinculo}`}</td>
                      <td>{t.produto_nome || 'Todos'}</td>
                      <td>
                        <TipoBadge $tipo={t.taxa_tipo}>
                          {t.taxa_tipo === 'PERC' ? 'Percentual' : 'Fixo'}
                        </TipoBadge>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatValor(t.taxa_tipo, t.taxa_valor)}</td>
                      <td>
                        <Badge $active={t.ativo}>
                          {t.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <Actions>
                          <ActionBtn
                            onClick={() => { setTaxaSelecionada(t); setModalOpen(true); }}
                            title="Editar"
                          >
                            <PencilLine size={14} />
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => taxaConfigService.atualizarParcial(t.id, { ativo: !t.ativo }).then(() => { carregarDados(); enqueueSnackbar('Status alterado', { variant: 'success' }); })}
                            title={t.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {t.ativo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </ActionBtn>
                          <ActionBtn $variant="danger" onClick={() => setConfirmDelete(t)} title="Excluir">
                            <Trash2 size={14} />
                          </ActionBtn>
                        </Actions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </Card>

        {modalOpen && (
          <TaxaConfigModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setTaxaSelecionada(null); }}
            onSave={carregarDados}
            taxa={taxaSelecionada}
            vinculos={vinculos}
            produtos={produtos}
          />
        )}

        {confirmDelete && (
          <ConfirmOverlay onClick={() => setConfirmDelete(null)}>
            <ConfirmModal onClick={(e) => e.stopPropagation()}>
              <ConfirmTitle>Excluir configuração de taxa?</ConfirmTitle>
              <ConfirmText>Esta ação não pode ser desfeita.</ConfirmText>
              <ConfirmActions>
                <ConfirmBtn $variant="cancel" onClick={() => setConfirmDelete(null)}>Cancelar</ConfirmBtn>
                <ConfirmBtn $variant="delete" onClick={handleDelete}>Excluir</ConfirmBtn>
              </ConfirmActions>
            </ConfirmModal>
          </ConfirmOverlay>
        )}
      </Container>
    </PageLayout>
  );
}
