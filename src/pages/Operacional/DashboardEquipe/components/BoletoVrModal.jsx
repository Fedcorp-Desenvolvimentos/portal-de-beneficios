import { useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaBarcode,
  FaBolt,
  FaCheckCircle,
  FaFilePdf,
  FaFolderOpen,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

import { operacionalFaturaService } from '../../../../services/operacionalService';
import { formatBRL } from '../helpers';

function fmtDateLocal(value) {
  if (!value) return '—';

  const raw = String(value).trim();

  if (!raw) return '—';

  if (raw.includes('/')) {
    return raw;
  }

  const date = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('pt-BR');
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.erro ||
    error?.message ||
    fallback
  );
}

function normalizeBoletoData(data) {
  if (!data) {
    return null;
  }

  return {
    ...data,
    beneficiario:
      data.beneficiario ||
      data.nome_beneficiario ||
      data.cedente ||
      '—',
    cpfCnpj:
      data.cpfCnpj ||
      data.cpf_cnpj ||
      data.cnpjCpf ||
      data.cnpj_cpf ||
      data.documento_beneficiario ||
      '—',
    pagador:
      data.pagador ||
      data.nome_pagador ||
      data.sacado ||
      '—',
    cnpjPagador:
      data.cnpjPagador ||
      data.cnpj_pagador ||
      data.documento_pagador ||
      '—',
    valorCents:
      data.valorCents ??
      data.valor_cents ??
      data.valorCentavos ??
      moneyToCents(data.valor ?? data.valor_total ?? data.total ?? 0),
    dataVencimento:
      data.dataVencimento ||
      data.data_vencimento ||
      data.vencimento ||
      '',
    banco:
      data.banco ||
      data.codigo_banco ||
      '—',
    agencia:
      data.agencia ||
      data.agencia_beneficiario ||
      '—',
    conta:
      data.conta ||
      data.conta_beneficiario ||
      '—',
    linhaDigitavel:
      data.linhaDigitavel ||
      data.linha_digitavel ||
      data.codigo_barras ||
      data.codigoBarras ||
      '—',
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

export default function BoletoVrModal({
  faturaId,
  onClose,
  onSent,
  showToast,
}) {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [parseFeedback, setParseFeedback] = useState({ text: '', type: '' });
  const [saveFeedback, setSaveFeedback] = useState({ text: '', type: '' });
  const [parsed, setParsed] = useState(null);
  const [forma, setForma] = useState('Boleto');
  const [sending, setSending] = useState(false);
  const [dzOver, setDzOver] = useState(false);

  const fileInputRef = useRef(null);

  async function handleBoletoFile(file) {
    const isPdf =
      file?.type === 'application/pdf' ||
      file?.name?.toLowerCase().endsWith('.pdf');

    if (!file || !isPdf) {
      setParseFeedback({
        text: 'Apenas arquivos PDF são aceitos.',
        type: 'err',
      });
      return;
    }

    setFileName(file.name);
    setParseFeedback({ text: 'Analisando boleto…', type: '' });
    setSaveFeedback({ text: '', type: '' });

    try {
      const response = await operacionalFaturaService.uploadBoletoVr(
        faturaId,
        file
      );

      const normalized = normalizeBoletoData(response?.data);

      if (!normalized) {
        throw new Error('Não foi possível interpretar os dados do boleto.');
      }

      setParsed(normalized);
      setParseFeedback({ text: '', type: '' });
      setStep(2);
    } catch (error) {
      console.error('Erro ao processar boleto VR:', error);

      setParsed(null);

      setParseFeedback({
        text: getErrorMessage(error, 'Erro ao processar boleto.'),
        type: 'err',
      });
    }
  }

  function handleVoltar() {
    setStep(1);
    setParsed(null);
    setFileName('');
    setParseFeedback({ text: '', type: '' });
    setSaveFeedback({ text: '', type: '' });
    setSending(false);
  }

  async function handleConfirmar() {
    setSending(true);
    setSaveFeedback({ text: '', type: '' });

    try {
      const response = await operacionalFaturaService.enviarContasPagar(
        faturaId,
        forma
      );

      const data = response?.data || {};
      const formaLabel = forma === 'PIX' ? 'PIX (Urgente)' : 'Boleto';

      const sent = data.sent ?? data.enviados ?? data.total_enviados ?? 0;
      const errors = data.errors || data.erros || [];
      const ok = data.ok ?? errors.length === 0;

      const message = errors.length
        ? `Enviados: ${sent}. Erros: ${errors.join(', ')}`
        : `${sent} co-estipulante(s) enviado(s) ao Contas a Pagar via ${formaLabel}.`;

      onClose?.();
      showToast?.(message, ok ? 'success' : 'warning');
      await onSent?.();
    } catch (error) {
      console.error('Erro ao enviar ao Contas a Pagar:', error);

      const message = getErrorMessage(
        error,
        'Erro ao enviar ao Contas a Pagar.'
      );

      setSaveFeedback({
        text: message,
        type: 'err',
      });

      showToast?.(message, 'error');
      setSending(false);
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
      handleBoletoFile(file);
    }
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  const isPix = forma === 'PIX';

  const previewRows = parsed
    ? [
        ['Beneficiário', parsed.beneficiario || '—'],
        ['CNPJ / CPF', parsed.cpfCnpj || '—'],
        ['Pagador', parsed.pagador || '—'],
        ['CNPJ Pagador', parsed.cnpjPagador || '—'],
        ['Valor', formatBRL(parsed.valorCents)],
        ['Vencimento', fmtDateLocal(parsed.dataVencimento)],
        ['Banco', parsed.banco || '—'],
        ['Agência', parsed.agencia || '—'],
        ['Conta', parsed.conta || '—'],
        ['Linha digitável', parsed.linhaDigitavel || '—'],
      ]
    : [];

  return (
    <div id="boletoModal" className="modal open" onClick={handleOverlayClick}>
      <div className="modal-content modal-wide">
        <button
          className="close-button"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          disabled={sending}
        >
          <FaTimes />
        </button>

        {step === 1 && (
          <div id="boletoStep1">
            <h2>
              <FaFilePdf /> Upload Boleto VR
            </h2>

            <p className="modal-hint">
              Selecione o PDF do boleto VR. Os dados serão extraídos e exibidos
              para confirmação antes de enviar ao Contas a Pagar.
            </p>

            <form id="boletoForm" onSubmit={(event) => event.preventDefault()}>
              <div className="detail-item" style={{ marginBottom: 16 }}>
                <label
                  htmlFor="boletoFileInput"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: '.82rem',
                    fontWeight: 500,
                    color: 'var(--tx2)',
                  }}
                >
                  Arquivo PDF do Boleto
                </label>

                <div
                  className={`boleto-file-area${dzOver ? ' dz-over' : ''}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <FaFilePdf
                    style={{
                      fontSize: '1.6rem',
                      color: 'var(--accent)',
                      marginBottom: 8,
                    }}
                  />

                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '.84rem',
                      color: 'var(--tx2)',
                    }}
                  >
                    Arraste o boleto aqui ou clique para selecionar
                  </p>

                  <button
                    type="button"
                    className="btn-action"
                    style={{ padding: '7px 18px', fontSize: '.82rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaFolderOpen /> Selecionar PDF
                  </button>
                </div>

                <input
                  type="file"
                  id="boletoFileInput"
                  accept="application/pdf"
                  hidden
                  ref={fileInputRef}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      handleBoletoFile(file);
                    }

                    event.target.value = '';
                  }}
                />

                {fileName && (
                  <div
                    id="boletoFileName"
                    style={{
                      marginTop: 8,
                      fontSize: '.8rem',
                      color: 'var(--tx3)',
                    }}
                  >
                    {fileName}
                  </div>
                )}
              </div>

              <div
                id="boletoParseFeedback"
                className={`feedback ${parseFeedback.type}`}
              >
                {parseFeedback.text}
              </div>
            </form>
          </div>
        )}

        {step === 2 && parsed && (
          <div id="boletoStep2">
            <h2>
              <FaCheckCircle /> Dados do Boleto — Confirme antes de enviar
            </h2>

            <p className="modal-hint">
              Verifique os dados extraídos, selecione a forma de pagamento e
              clique em &quot;Confirmar e Enviar&quot;.
            </p>

            <div className="boleto-preview-grid" id="boletoPreviewGrid">
              {previewRows.map(([label, value]) => (
                <div className="boleto-preview-row" key={label}>
                  <span className="boleto-preview-label">{label}</span>
                  <span className="boleto-preview-value">{value}</span>
                </div>
              ))}
            </div>

            <div className="payment-method-selector">
              <p className="payment-method-label">Forma de pagamento</p>

              <div className="payment-method-opts">
                <label className="payment-opt" id="optBoleto">
                  <input
                    type="radio"
                    name="boletoForma"
                    value="Boleto"
                    checked={forma === 'Boleto'}
                    onChange={() => setForma('Boleto')}
                    disabled={sending}
                  />

                  <div
                    className={`payment-opt-card${
                      !isPix ? ' payment-opt-selected' : ''
                    }`}
                  >
                    <FaBarcode />
                    <span className="payment-opt-name">Boleto</span>
                    <span className="payment-opt-sub">Prazo normal</span>
                  </div>
                </label>

                <label className="payment-opt" id="optPix">
                  <input
                    type="radio"
                    name="boletoForma"
                    value="PIX"
                    checked={forma === 'PIX'}
                    onChange={() => setForma('PIX')}
                    disabled={sending}
                  />

                  <div
                    className={`payment-opt-card${
                      isPix ? ' payment-opt-selected' : ''
                    }`}
                  >
                    <FaBolt />
                    <span className="payment-opt-name">PIX</span>
                    <span className="badge-urgente">Urgente</span>
                  </div>
                </label>
              </div>
            </div>

            <div
              id="boletoSaveFeedback"
              className={`feedback ${saveFeedback.type}`}
            >
              {saveFeedback.text}
            </div>

            <div className="step2-actions">
              <button
                className="btn-outline"
                id="btnBoletoVoltar"
                type="button"
                onClick={handleVoltar}
                disabled={sending}
              >
                <FaArrowLeft /> Voltar
              </button>

              <button
                className={`btn-action${isPix ? ' btn-action-pix' : ''}`}
                id="btnBoletoConfirmar"
                type="button"
                onClick={handleConfirmar}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <FaSpinner className="fa-spin" /> Enviando…
                  </>
                ) : isPix ? (
                  'Confirmar e Enviar via PIX (Urgente)'
                ) : (
                  'Confirmar e Enviar via Boleto'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}