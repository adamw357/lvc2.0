import React from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../styles/datepicker.css'

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  className?: string
  minDate?: Date
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholderText,
  className,
  minDate
}) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      className={className}
      minDate={minDate || new Date()}
      dateFormat="MM/dd/yyyy"
    />
  )
} 