import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  const selectedOption = options.find((o) => String(o.id) === String(value))

  useEffect(() => {
    if (!open && selectedOption) {
      setSearch(selectedOption.razao_social || selectedOption.nome_fantasia || selectedOption.nome || '')
    }
    if (!open && !selectedOption) {
      setSearch('')
    }
  }, [open, selectedOption])

  const filtered = search
    ? options.filter((o) => {
        const text = (o.razao_social || o.nome_fantasia || o.nome || '').toLowerCase()
        return text.includes(search.toLowerCase())
      })
    : options

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback((opt) => {
    onChange(opt.id)
    setSearch(opt.razao_social || opt.nome_fantasia || opt.nome || '')
    setOpen(false)
  }, [onChange])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: 200 }}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
          if (selectedOption && e.target.value !== (selectedOption.razao_social || selectedOption.nome_fantasia || selectedOption.nome || '')) {
            onChange('')
          }
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'Selecionar...'}
        disabled={disabled}
        style={{
          width: '100%',
          height: 38,
          padding: '0 12px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          background: disabled ? '#f3f4f6' : '#fff',
          color: '#0f172a',
          boxSizing: 'border-box',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      />

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 240,
            overflowY: 'auto',
            zIndex: 999,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>
              Nenhum resultado
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#0f172a',
                  background: String(opt.id) === String(value) ? '#eff6ff' : 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => {
                  if (String(opt.id) !== String(value)) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {opt.razao_social || opt.nome_fantasia || opt.nome || `ID ${opt.id}`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
