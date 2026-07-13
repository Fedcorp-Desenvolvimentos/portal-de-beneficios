// src/components/DatePicker/DatePickerWrapper.jsx

import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ptBR from 'date-fns/locale/pt-BR'
import { formatDateInput, parseDateInput } from '../../utils/datePickerUtils'

/**
 * Wrapper para o React DatePicker que trabalha com strings YYYY-MM-DD
 * em vez de objetos Date
 */
const DatePickerWrapper = ({
  value, // string YYYY-MM-DD
  onChange, // (string) => void
  placeholderText = 'Selecione a data',
  disabled = false,
  required = false,
  minDate = null,
  maxDate = null,
  className = 'datepicker-custom',
  ...props
}) => {
  const selectedDate = value ? parseDateInput(value) : null

  const handleChange = (date) => {
    const formatted = date ? formatDateInput(date) : ''
    onChange(formatted)
  }

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="dd/MM/yyyy"
      locale={ptBR}
      placeholderText={placeholderText}
      className={className}
      disabled={disabled}
      required={required}
      minDate={minDate ? parseDateInput(minDate) : undefined}
      maxDate={maxDate ? parseDateInput(maxDate) : undefined}
      {...props}
    />
  )
}

export default DatePickerWrapper