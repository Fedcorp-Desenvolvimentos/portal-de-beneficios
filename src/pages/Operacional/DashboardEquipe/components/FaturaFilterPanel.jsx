import { useEffect, useMemo, useRef, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function getUploaderId(fatura) {
  return (
    fatura?.uploaderId ??
    fatura?.uploader_id ??
    fatura?.usuario_id ??
    fatura?.responsavel_id ??
    ''
  );
}

function getUploaderName(fatura) {
  return (
    fatura?.uploaderName ||
    fatura?.uploader_name ||
    fatura?.usuario_nome ||
    fatura?.responsavel_nome ||
    fatura?.created_by_name ||
    '—'
  );
}

export default function FaturaFilterPanel({
  open,
  faturas,
  filters,
  onChange,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debounceRef = useRef(null);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onChange({
        ...filters,
        search: searchInput,
      });
    }, 180);

    return () => clearTimeout(debounceRef.current);
  }, [searchInput, filters, onChange]);

  const uploaders = useMemo(() => {
    const map = new Map();

    const list = Array.isArray(faturas) ? faturas : [];

    list.forEach((fatura) => {
      const id = getUploaderId(fatura);
      const name = getUploaderName(fatura);

      if (id !== undefined && id !== null && String(id).trim()) {
        map.set(String(id), name);
      }
    });

    return [...map.entries()].sort((a, b) =>
      String(a[1]).localeCompare(String(b[1]), 'pt-BR')
    );
  }, [faturas]);

  return (
    <div
      className={`faturas-filter-panel${open ? ' open' : ''}`}
      id="faturaFilterPanel"
    >
      <div className="filter-group">
        <FaSearch />

        <input
          type="search"
          className="filtro-input"
          id="filtroSearch"
          placeholder="Buscar nº fatura, estipulante, condomínio ou CNPJ…"
          autoComplete="off"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <div className="filter-group">
        <select
          className="filtro-select"
          id="filtroStatus"
          value={filters.status || ''}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value,
            })
          }
        >
          <option value="">Todos os status</option>
          <option value="faturado">Faturado</option>
          <option value="atrasado">Confirmar Pagamento</option>
          <option value="aprovado">Boleto VR Enviado</option>
          <option value="pago">Pago</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          className="filtro-select"
          id="filtroResponsavel"
          value={filters.uploaderId || ''}
          onChange={(event) =>
            onChange({
              ...filters,
              uploaderId: event.target.value,
            })
          }
        >
          <option value="">Todos os responsáveis</option>

          {uploaders.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}