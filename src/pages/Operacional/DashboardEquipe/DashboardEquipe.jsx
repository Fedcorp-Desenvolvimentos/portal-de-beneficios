import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaSlidersH } from 'react-icons/fa';

import { useAuth } from '../../../context/AuthContext';
import { operacionalFaturaService } from '../../../services/operacionalService';

import { computeStatus } from './helpers';
import { useToast } from './hooks/useToast';

import ToastContainer from './components/ToastContainer';
import KpiCards from './components/KpiCards';
import WelcomeGreeting from './components/WelcomeGreeting';
import PersonalSection from './components/PersonalSection';
import UploadFaturaPanel from './components/UploadFaturaPanel';
import FaturaFilterPanel from './components/FaturaFilterPanel';
import FaturasTable from './components/FaturasTable';
import BoletoVrModal from './components/BoletoVrModal';

export default function DashboardEquipe() {
  const { user } = useAuth();

  const [faturas, setFaturas] = useState([]);
  const [animateKpis, setAnimateKpis] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    uploaderId: '',
  });

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [openRows, setOpenRows] = useState(new Set());
  const [boletoModalFaturaId, setBoletoModalFaturaId] = useState(null);

  const { toasts, showToast } = useToast();
  const refreshingRef = useRef(false);

  const userName =
    user?.name ||
    user?.nome ||
    user?.username ||
    user?.email ||
    'Usuário';

  useEffect(() => {
    document.title = 'Dashboard — Portal VR';
  }, []);

  const getErrorMessage = useCallback((error, fallback) => {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      error?.message ||
      fallback
    );
  }, []);

  const refresh = useCallback(
    async (animate = true) => {
      if (refreshingRef.current) return;

      refreshingRef.current = true;

      try {
        const response = await operacionalFaturaService.getAll();
        const raw = response?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

        setFaturas(data);
        setAnimateKpis(animate);
        setLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar faturas operacionais:', error);

        setLoaded(true);

        showToast?.(
          getErrorMessage(error, 'Erro ao carregar faturas.'),
          'error'
        );
      } finally {
        refreshingRef.current = false;
      }
    },
    [getErrorMessage, showToast]
  );

  useEffect(() => {
    refresh(true);

    const intervalId = setInterval(() => {
      refresh(false);
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  const kpiCounts = useMemo(() => {
    const counts = {
      faturado: 0,
      atrasado: 0,
      aprovado: 0,
      pago: 0,
    };

    faturas.forEach((fatura) => {
      const status = computeStatus(fatura);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [faturas]);

  function handleAbrirBoleto(faturaId) {
    setBoletoModalFaturaId(faturaId);
  }

  function handleFecharBoleto() {
    setBoletoModalFaturaId(null);
  }

  function handleToggleOpen(id) {
    setOpenRows((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function handleDeleteFatura(faturaId) {
    try {
      await operacionalFaturaService.remove(faturaId);
      await refresh(true);

      showToast?.('Fatura excluída com sucesso.', 'success');

      return true;
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);

      showToast?.(
        getErrorMessage(error, 'Erro ao excluir fatura.'),
        'error'
      );

      return false;
    }
  }

  async function handlePagarTodos(faturaId) {
    try {
      await operacionalFaturaService.pagoTodos(faturaId);
      await refresh(true);

      showToast?.('Todos os itens foram marcados como pagos.', 'success');

      return true;
    } catch (error) {
      console.error('Erro ao marcar todos como pagos:', error);

      showToast?.(
        getErrorMessage(error, 'Erro ao marcar todos como pagos.'),
        'error'
      );

      return false;
    }
  }

  async function handleTogglePago(faturaId, idx) {
    try {
      await operacionalFaturaService.togglePago(faturaId, idx);
      await refresh(true);

      return true;
    } catch (error) {
      console.error('Erro ao alterar pagamento:', error);

      showToast?.(
        getErrorMessage(error, 'Erro ao alterar pagamento.'),
        'error'
      );

      return false;
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />

      {/* <section id="welcomeSection" style={{ marginBottom: 24 }}>
        <WelcomeGreeting userName={userName} />
      </section> */}

      <div className="dash-section-label" style={{ marginBottom: 12 }}>
        Visão da Equipe
      </div>

      <KpiCards counts={kpiCounts} animate={animateKpis} />

      <section id="personalSection">
        <PersonalSection
          faturas={faturas}
          userId={user?.id}
          userName={userName}
        />
      </section>

      <UploadFaturaPanel onSaved={() => refresh(true)} />

      {loaded && faturas.length > 0 && (
        <section className="boletos-section" id="sectionFaturas">
          <div className="section-header">
            <h3 className="section-title">Faturas Gravadas</h3>

            <button
              className={`btn-filter-toggle${filterPanelOpen ? ' active' : ''}`}
              id="btnToggleFiltros"
              title="Filtrar"
              type="button"
              onClick={() => setFilterPanelOpen((value) => !value)}
            >
              <FaSlidersH />
            </button>
          </div>

          <FaturaFilterPanel
            open={filterPanelOpen}
            faturas={faturas}
            filters={filters}
            onChange={setFilters}
          />

          <FaturasTable
            faturas={faturas}
            filterUploaderId={filters.uploaderId}
            filterStatus={filters.status}
            filterSearch={filters.search}
            openRows={openRows}
            setOpenRows={setOpenRows}
            onToggleOpen={handleToggleOpen}
            onRefresh={() => refresh(true)}
            onDelete={handleDeleteFatura}
            onPagarTodos={handlePagarTodos}
            onTogglePago={handleTogglePago}
            onAbrirBoleto={handleAbrirBoleto}
          />
        </section>
      )}

      {loaded && faturas.length === 0 && (
        <section className="boletos-section" id="sectionFaturas">
          <div className="empty-state">
            <strong>Nenhuma fatura encontrada.</strong>
            <span>
              Importe uma fatura para iniciar o acompanhamento operacional.
            </span>
          </div>
        </section>
      )}

      {boletoModalFaturaId && (
        <BoletoVrModal
          faturaId={boletoModalFaturaId}
          onClose={handleFecharBoleto}
          onSent={() => refresh(true)}
          showToast={showToast}
        />
      )}
    </>
  );
}