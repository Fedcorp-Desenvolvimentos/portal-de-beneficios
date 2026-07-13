import { useRef, useState } from 'react';
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFolderOpen,
  FaSave,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

import { operacionalFaturaService } from '../../../../services/operacionalService';
import { fmtDate, formatBRL } from '../helpers';

export default function UploadFaturaPanel({ onSaved }) {
  const [dzState, setDzState] = useState('idle');
  const [dzErrorMsg, setDzErrorMsg] = useState('');
  const [dzOver, setDzOver] = useState(false);

  const [pendingFile, setPendingFile] = useState(null);
  const [parsed, setParsed] = useState(null);

  const [creditoDates, setCreditoDates] = useState([]);
  const [bulkCredito, setBulkCredito] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState({ text: '', type: '' });

  const fileInputRef = useRef(null);

  function getErrorMessage(error, fallback) {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      error?.message ||
      fallback
    );
  }

  function normalizeParsedData(data) {
    if (!data) {
      return null;
    }

    const coEstipulantes = Array.isArray(data.coEstipulantes)
      ? data.coEstipulantes
      : Array.isArray(data.co_estipulantes)
        ? data.co_estipulantes
        : Array.isArray(data.condominios)
          ? data.condominios
          : [];

    return {
      ...data,
      faturaNum: data.faturaNum || data.fatura_num || data.numero_fatura || data.numero || '',
      emissao: data.emissao || data.data_emissao || data.created_at || '',
      estipulante: {
        name:
          data.estipulante?.name ||
          data.estipulante?.nome ||
          data.estipulante_nome ||
          data.administradora_nome ||
          '—',
        cnpj:
          data.estipulante?.cnpj ||
          data.estipulante_cnpj ||
          data.administradora_cnpj ||
          '',
      },
      coEstipulantes: coEstipulantes.map((item, index) => ({
        ...item,
        id: item.id || item.codigo || index,
        name:
          item.name ||
          item.nome ||
          item.condominio ||
          item.condominio_nome ||
          item.razao_social ||
          '—',
        cnpj: item.cnpj || item.documento || item.cpf_cnpj || '',
        valorCents:
          item.valorCents ??
          item.valor_cents ??
          item.valorCentavos ??
          moneyToCents(item.valor_total ?? item.valor ?? item.total ?? 0),
        dueDate:
          item.dueDate ||
          item.due_date ||
          item.vencimento ||
          item.data_vencimento ||
          '',
        dataCredito:
          item.dataCredito ||
          item.data_credito ||
          '',
      })),
    };
  }

  function moneyToCents(value) {
    if (typeof value === 'number') {
      return Math.round(value * 100);
    }

    const clean = String(value || '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const number = Number(clean);

    if (Number.isNaN(number)) {
      return 0;
    }

    return Math.round(number * 100);
  }

  async function handleFile(file) {
    if (!file) {
      return;
    }

    const isPdf =
      file.type === 'application/pdf' ||
      file.name?.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setDzState('error');
      setDzErrorMsg('Apenas arquivos PDF são aceitos.');
      return;
    }

    setPendingFile(file);
    setDzState('loading');
    setDzErrorMsg('');
    setSaveFeedback({ text: '', type: '' });

    try {
      const response = await operacionalFaturaService.parsePdf(file);
      const normalized = normalizeParsedData(response?.data);

      if (!normalized || !Array.isArray(normalized.coEstipulantes)) {
        throw new Error('Não foi possível interpretar os dados extraídos do PDF.');
      }

      setParsed(normalized);
      setCreditoDates(
        normalized.coEstipulantes.map((item) => item.dataCredito || '')
      );
      setBulkCredito('');
      setDzState('idle');
    } catch (error) {
      console.error('Erro ao analisar PDF:', error);

      setParsed(null);
      setPendingFile(null);
      setCreditoDates([]);
      setBulkCredito('');
      setDzState('error');
      setDzErrorMsg(getErrorMessage(error, 'Erro ao analisar PDF.'));
    }
  }

  function hidePreview() {
    setParsed(null);
    setPendingFile(null);
    setCreditoDates([]);
    setBulkCredito('');
    setSaveFeedback({ text: '', type: '' });
    setSaving(false);
    setDzState('idle');
  }

  function handleBulkCreditoChange(value) {
    setBulkCredito(value);
    setCreditoDates((prev) => prev.map(() => value));
  }

  function handleCreditoChange(idx, value) {
    setCreditoDates((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  async function handleGravar() {
    if (!pendingFile) return;

    setSaving(true);
    setSaveFeedback({ text: '', type: '' });

    try {
      const payload = {
        dataCreditoList: JSON.stringify(
          creditoDates.map((value) => value || null)
        ),
      };

      const response = await operacionalFaturaService.upload(pendingFile, payload);
      const saved = response?.data;

      const totalCoEstipulantes =
        saved?.coEstipulantes?.length ??
        saved?.co_estipulantes?.length ??
        parsed?.coEstipulantes?.length ??
        0;

      setSaveFeedback({
        text: `Fatura gravada! ${totalCoEstipulantes} co-estipulante(s) registrado(s).`,
        type: 'ok',
      });

      setTimeout(() => {
        hidePreview();
        onSaved?.();
      }, 1200);
    } catch (error) {
      console.error('Erro ao gravar fatura:', error);

      setSaveFeedback({
        text: getErrorMessage(error, 'Erro ao gravar fatura.'),
        type: 'err',
      });

      setSaving(false);
    }
  }

  function onDragOver(event) {
    event.preventDefault();
    setDzOver(true);
  }

  function onDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDzOver(false);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDzOver(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  if (parsed) {
    const coEstipulantes = parsed.coEstipulantes || [];
    const total = coEstipulantes.reduce(
      (sum, item) => sum + Number(item.valorCents || 0),
      0
    );

    return (
      <div id="previewPanel" className="preview-panel">
        <div className="preview-panel-header">
          <div>
            <h3 className="preview-panel-title">
              <FaCheckCircle /> Dados Extraídos — Revise antes de gravar
            </h3>

            <div className="preview-meta" id="previewMeta">
              <span>
                <strong>Estipulante:</strong> {parsed.estipulante?.name || '—'}
              </span>

              <span className="sep">·</span>

              <span>
                <strong>Fatura Nº:</strong> {parsed.faturaNum || '—'}
              </span>

              <span className="sep">·</span>

              <span>
                <strong>Emissão:</strong> {fmtDate(parsed.emissao)}
              </span>

              <span className="sep">·</span>

              <span>
                <strong>{coEstipulantes.length} condomínios</strong>
              </span>
            </div>
          </div>

          <div className="preview-panel-actions">
            <button
              className="btn-outline"
              type="button"
              onClick={hidePreview}
              disabled={saving}
            >
              <FaTimes /> Cancelar
            </button>

            <button
              className="btn-action"
              type="button"
              onClick={handleGravar}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="fa-spin" /> Gravando…
                </>
              ) : (
                <>
                  <FaSave /> Gravar Fatura
                </>
              )}
            </button>
          </div>
        </div>

        <div id="bulkDataCreditoArea">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0 4px',
              flexWrap: 'wrap',
            }}
          >
            <label
              style={{
                fontSize: '.82rem',
                fontWeight: 500,
                color: 'var(--tx2)',
                whiteSpace: 'nowrap',
              }}
            >
              <FaCalendarCheck
                style={{ color: 'var(--accent)', marginRight: 4 }}
              />
              Data de Crédito (todos):
            </label>

            <input
              type="date"
              id="bulkDataCredito"
              style={{
                padding: '5px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: '.82rem',
                background: 'var(--bg2)',
                color: 'var(--tx1)',
              }}
              value={bulkCredito}
              onChange={(event) => handleBulkCreditoChange(event.target.value)}
            />

            <span style={{ fontSize: '.77rem', color: 'var(--tx3)' }}>
              Preenche todos · Altere individualmente se necessário
            </span>
          </div>
        </div>

        <div className="preview-table-wrap" style={{ maxHeight: 400 }}>
          <table className="co-table preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Condomínio</th>
                <th>CNPJ</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Data Crédito</th>
              </tr>
            </thead>

            <tbody>
              {coEstipulantes.map((item, index) => (
                <tr key={item.id || index}>
                  <td
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '.78rem',
                    }}
                  >
                    {index + 1}
                  </td>

                  <td className="co-name">{item.name}</td>
                  <td className="co-cnpj">{item.cnpj || '—'}</td>
                  <td className="co-valor">{formatBRL(item.valorCents)}</td>
                  <td className="co-venc">{fmtDate(item.dueDate)}</td>

                  <td>
                    <input
                      type="date"
                      className="co-data-credito"
                      style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: 5,
                        fontSize: '.8rem',
                        background: 'var(--bg2)',
                        color: 'var(--tx1)',
                      }}
                      title={`Data de crédito — ${item.name}`}
                      value={creditoDates[index] || ''}
                      onChange={(event) =>
                        handleCreditoChange(index, event.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="preview-total" id="previewTotal">
          <strong>Total:</strong> {formatBRL(total)} &nbsp;·&nbsp;{' '}
          {coEstipulantes.length} condomínio(s)
        </div>

        <div id="saveFeedback" className={`feedback ${saveFeedback.type}`}>
          {saveFeedback.text}
        </div>
      </div>
    );
  }

  return (
    <div
      id="dropZone"
      className={`drop-zone${dzOver ? ' dz-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        id="fileInput"
        accept="application/pdf"
        hidden
        ref={fileInputRef}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleFile(file);
          }

          event.target.value = '';
        }}
      />

      {dzState === 'idle' && (
        <div className="dz-content">
          <p className="dz-title">Arraste o RECIBOQ aqui</p>
          <p className="dz-sub">
            Importe o PDF da fatura para processar automaticamente.
          </p>

          <button
            className="dz-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaFolderOpen /> Selecionar arquivo
          </button>
        </div>
      )}

      {dzState === 'loading' && (
        <div className="dz-loading">
          <FaSpinner className="dz-icon fa-spin" />
          <p className="dz-title">Analisando PDF…</p>
        </div>
      )}

      {dzState === 'error' && (
        <div className="dz-error">
          <FaExclamationTriangle className="dz-icon" />
          <p className="dz-title">{dzErrorMsg}</p>

          <button
            className="dz-btn"
            type="button"
            onClick={() => {
              setDzState('idle');
              setPendingFile(null);
              setDzErrorMsg('');
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}