// src/utils/datePickerUtils.js


/**
 * Utilitários para manipulação de datas no formato YYYY-MM-DD
 */

/**
 * Converte uma string YYYY-MM-DD para objeto Date
 */
export function parseDateInput(value) {
  if (!value) return null

  const [year, month, day] = String(value).split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

/**
 * Converte objeto Date para string YYYY-MM-DD
 */
export function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Verifica se a data cai em fim de semana (sábado=6 ou domingo=0)
 */
export function isWeekend(value) {
  const date = typeof value === 'string' ? parseDateInput(value) : value
  if (!date) return false
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Se a data cair em fim de semana, avança para a segunda-feira (próximo dia útil)
 */
export function proximoDiaUtil(value) {
  const date = typeof value === 'string' ? parseDateInput(value) : value
  if (!date) return value

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1)
  }
  return date
}

/**
 * Se a data cair em fim de semana, volta para a sexta-feira (dia útil anterior)
 */
export function diaUtilAnterior(value) {
  const date = typeof value === 'string' ? parseDateInput(value) : value
  if (!date) return value

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1)
  }
  return date
}

/**
 * Adiciona N dias úteis a uma data string YYYY-MM-DD.
 * Pula sábados e domingos ao contar.
 * Ex: Sexta + 4 dias úteis = Quinta (pula sáb, dom, seg, ter, qua)
 */
export function addDaysToDateInput(value, days) {
  const date = parseDateInput(value)
  if (!date) return ''

  let remaining = Number(days || 0)
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--
    }
  }

  return formatDateInput(date)
}

/**
 * Subtrai N dias úteis de uma data string YYYY-MM-DD.
 * Pula sábados e domingos ao contar.
 * Ex: Quinta - 4 dias úteis = Segunda (pula qua, ter, seg, dom, sáb)
 */
export function subtractDaysFromDateInput(value, days) {
  const date = parseDateInput(value)
  if (!date) return ''

  let remaining = Number(days || 0)
  while (remaining > 0) {
    date.setDate(date.getDate() - 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--
    }
  }

  return formatDateInput(date)
}

/**
 * Verifica se dataA é posterior a dataB
 */
export function isAfterDateInput(dateA, dateB) {
  const parsedA = parseDateInput(dateA)
  const parsedB = parseDateInput(dateB)

  if (!parsedA || !parsedB) return false

  return parsedA.getTime() > parsedB.getTime()
}

/**
 * Formata data para exibição em português (DD/MM/YYYY)
 */
export function formatDateBR(value) {
  if (!value) return '-'

  const raw = String(value).trim()
  if (!raw) return '-'

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }

  return raw
}

/**
 * Obtém data atual no formato YYYY-MM-DD
 */
export function getTodayDateInput() {
  return formatDateInput(new Date())
}

/**
 * Obtém data de vencimento (data atual + X dias, ajustada para dia útil)
 */
export function getDueDateInput(daysToAdd = 1) {
  const today = new Date()
  today.setDate(today.getDate() + Number(daysToAdd))
  return formatDateInput(proximoDiaUtil(today))
}

/**
 * Valida se uma string está no formato YYYY-MM-DD
 */
export function isValidDateInput(value) {
  if (!value) return false
  const date = parseDateInput(value)
  return date !== null && !isNaN(date.getTime())
}

/**
 * Verifica se duas datas são iguais
 */
export function isSameDateInput(dateA, dateB) {
  const parsedA = parseDateInput(dateA)
  const parsedB = parseDateInput(dateB)
  
  if (!parsedA || !parsedB) return false
  
  return parsedA.getTime() === parsedB.getTime()
}

/**
 * Compara duas datas (retorna -1 se A < B, 0 se igual, 1 se A > B)
 */
export function compareDateInput(dateA, dateB) {
  const parsedA = parseDateInput(dateA)
  const parsedB = parseDateInput(dateB)
  
  if (!parsedA && !parsedB) return 0
  if (!parsedA) return -1
  if (!parsedB) return 1
  
  const timeA = parsedA.getTime()
  const timeB = parsedB.getTime()
  
  if (timeA < timeB) return -1
  if (timeA > timeB) return 1
  return 0
}