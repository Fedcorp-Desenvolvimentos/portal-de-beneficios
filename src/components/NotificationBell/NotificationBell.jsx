import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell } from 'react-icons/fi'
import { operacionalFaturaService } from '../../services/operacionalService'
import { computeStatus } from '../../pages/Operacional/DashboardEquipe/helpers'
import * as S from './NotificationBellStyles'

const fmtMoney = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const fmtDate = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.results)) return response.results
  return []
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [faturas, setFaturas] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  const fetchFaturas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await operacionalFaturaService.getAll()
      setFaturas(normalizeList(response?.data))
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchFaturas()
    }
  }, [open, fetchFaturas])

  useEffect(() => {
    if (!open) return
    const interval = setInterval(fetchFaturas, 60000)
    return () => clearInterval(interval)
  }, [open, fetchFaturas])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const atrasados = faturas
    .filter((f) => computeStatus(f) === 'atrasado')
    .map((f) => ({
      id: f.id,
      title: f.estipulante?.name || f.nome_administradora || f.administradora_nome || `Fatura #${f.id}`,
      vencimento: f.dueDate || f.vencimento || f.data_vencimento,
      valor: f.valorTotal || f.valor_total || 0,
    }))

  const pagos = faturas
    .filter((f) => computeStatus(f) === 'pago')
    .map((f) => ({
      id: f.id,
      title: f.estipulante?.name || f.nome_administradora || f.administradora_nome || `Fatura #${f.id}`,
      valor: f.valorTotal || f.valor_total || 0,
    }))

  const totalAtrasados = atrasados.length

  return (
    <S.BellWrapper ref={wrapperRef}>
      <S.BellButton
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Notificações"
      >
        <FiBell size={18} />
        {totalAtrasados > 0 && <S.Badge>{totalAtrasados}</S.Badge>}
      </S.BellButton>

      {open && (
        <>
          <S.Overlay onClick={() => setOpen(false)} />
          <S.Dropdown>
            <S.DropdownHeader>
              Notificações
              {totalAtrasados > 0 && (
                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                  {totalAtrasados} pendente(s)
                </span>
              )}
            </S.DropdownHeader>

            <S.DropdownBody>
              {loading && faturas.length === 0 ? (
                <S.EmptyState>Carregando...</S.EmptyState>
              ) : (
                <>
                  <S.SectionLabel>Precisa verificar</S.SectionLabel>
                  {atrasados.length === 0 ? (
                    <S.EmptyState>Nenhum item pendente</S.EmptyState>
                  ) : (
                    atrasados.map((item) => (
                      <S.NotificationCard key={item.id} $variant="atrasado">
                        <S.CardContent>
                          <S.CardTitle>{item.title}</S.CardTitle>
                          <S.CardMeta>
                            <span>Venceu: {fmtDate(item.vencimento)}</span>
                            <S.CardValue>{fmtMoney(item.valor)}</S.CardValue>
                          </S.CardMeta>
                        </S.CardContent>
                      </S.NotificationCard>
                    ))
                  )}

                  <S.SectionLabel>Pagos</S.SectionLabel>
                  {pagos.length === 0 ? (
                    <S.EmptyState>Nenhum pagamento recente</S.EmptyState>
                  ) : (
                    pagos.map((item) => (
                      <S.NotificationCard key={item.id} $variant="pago">
                        <S.CardContent>
                          <S.CardTitle>{item.title}</S.CardTitle>
                          <S.CardMeta>
                            <S.CardValue>{fmtMoney(item.valor)}</S.CardValue>
                          </S.CardMeta>
                        </S.CardContent>
                      </S.NotificationCard>
                    ))
                  )}
                </>
              )}
            </S.DropdownBody>

            <S.DropdownFooter>
              <S.FooterLink onClick={() => { navigate('/operacional/kanban'); setOpen(false) }}>
                Ver kanban →
              </S.FooterLink>
            </S.DropdownFooter>
          </S.Dropdown>
        </>
      )}
    </S.BellWrapper>
  )
}
