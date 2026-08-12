import React, { useState, useRef, useEffect } from 'react'
import './MultiSearchableSelect.css'

/**
 * Multi-seleção com busca e chips.
 *
 * options: [{ value, label, sublabel }] — busca casa label e sublabel.
 * values: array de values selecionados.
 * onChange(nextValues)
 */
const MAX_CHIPS_VISIVEIS = 6

export default function MultiSearchableSelect({
  options = [],
  values = [],
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedSet = new Set(values.map(String))
  const selecionados = options.filter((o) => selectedSet.has(String(o.value)))

  const termo = search.trim().toLowerCase()
  const filtrados = termo
    ? options.filter(
        (o) =>
          String(o.label || '').toLowerCase().includes(termo) ||
          String(o.sublabel || '').toLowerCase().includes(termo)
      )
    : options

  const naoSelecionadosFiltrados = filtrados.filter((o) => !selectedSet.has(String(o.value)))

  const toggle = (opt) => {
    const key = String(opt.value)
    if (selectedSet.has(key)) {
      onChange(values.filter((v) => String(v) !== key))
    } else {
      onChange([...values, opt.value])
    }
  }

  const selecionarFiltrados = () => {
    const novos = naoSelecionadosFiltrados.map((o) => o.value)
    if (novos.length) onChange([...values, ...novos])
  }

  return (
    <div className="mss-wrapper" ref={wrapperRef}>
      <div
        className={`mss-control${disabled ? ' disabled' : ''}`}
        onClick={() => {
          if (!disabled) setOpen(true)
        }}
      >
        {selecionados.slice(0, MAX_CHIPS_VISIVEIS).map((o) => (
          <span key={o.value} className="mss-chip">
            {o.label}
            {!disabled && (
              <button
                type="button"
                className="mss-chip-remove"
                aria-label={`Remover ${o.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(o)
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {selecionados.length > MAX_CHIPS_VISIVEIS && (
          <span className="mss-chip mss-chip-resumo">
            +{selecionados.length - MAX_CHIPS_VISIVEIS} selecionado(s)
          </span>
        )}
        <input
          type="text"
          className="mss-input"
          value={search}
          placeholder={selecionados.length === 0 ? placeholder : ''}
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              setSearch('')
            }
            if (e.key === 'Backspace' && !search && selecionados.length) {
              toggle(selecionados[selecionados.length - 1])
            }
          }}
        />
      </div>

      {open && !disabled && (
        <div className="mss-dropdown">
          <div className="mss-dropdown-actions">
            <button
              type="button"
              className="mss-action"
              disabled={naoSelecionadosFiltrados.length === 0}
              onClick={selecionarFiltrados}
            >
              Selecionar todos{termo ? ' os filtrados' : ''} ({naoSelecionadosFiltrados.length})
            </button>
            {values.length > 0 && (
              <button type="button" className="mss-action" onClick={() => onChange([])}>
                Limpar seleção
              </button>
            )}
          </div>
          {filtrados.length === 0 ? (
            <div className="mss-empty">Nenhum resultado</div>
          ) : (
            filtrados.map((o) => {
              const marcado = selectedSet.has(String(o.value))
              return (
                <button
                  key={o.value}
                  type="button"
                  className={`mss-option${marcado ? ' selected' : ''}`}
                  onClick={() => toggle(o)}
                >
                  <span className="mss-option-check">{marcado ? '☑' : '☐'}</span>
                  <span className="mss-option-texts">
                    <span className="mss-option-label">{o.label}</span>
                    {o.sublabel && <span className="mss-option-sublabel">{o.sublabel}</span>}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
