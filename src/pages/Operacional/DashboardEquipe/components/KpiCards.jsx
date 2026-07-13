import { useCountUp } from '../hooks/useCountUp';

function getCount(counts, key) {
  const value = Number(counts?.[key] || 0);
  return Number.isFinite(value) ? value : 0;
}

export default function KpiCards({ counts = {}, animate = false }) {
  const faturado = useCountUp(getCount(counts, 'faturado'), animate);
  const atrasado = useCountUp(getCount(counts, 'atrasado'), animate);
  const aprovado = useCountUp(getCount(counts, 'aprovado'), animate);
  const pago = useCountUp(getCount(counts, 'pago'), animate);

  return (
    <div className="dashboard-cards">
      <div className="card">
        <div className="card-title">Faturado</div>
        <div className="card-value">{faturado}</div>
      </div>

      <div className="card">
        <div className="card-title">Confirmar Pagamento</div>
        <div className="card-value">{atrasado}</div>
      </div>

      <div className="card">
        <div className="card-title">Boleto VR Enviado</div>
        <div className="card-value">{aprovado}</div>
      </div>

      <div className="card">
        <div className="card-title">Pago</div>
        <div className="card-value">{pago}</div>
      </div>
    </div>
  );
}