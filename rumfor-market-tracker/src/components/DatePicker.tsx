import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react'

interface DatePickerProps {
  value: { from: string; to: string }
  onChange: (value: { from: string; to: string }) => void
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInput, setSelectedInput] = useState<'from' | 'to'>('from')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsMonthDropdownOpen(false)
        setIsYearDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleInputFocus = (input: 'from' | 'to') => {
    setSelectedInput(input)
    setIsOpen(true)
    
    // Set calendar to show the selected input's date
    if (input === 'from' && value.from) {
      const date = new Date(value.from)
      setCurrentMonth(date.getMonth())
      setCurrentYear(date.getFullYear())
    } else if (input === 'to' && value.to) {
      const date = new Date(value.to)
      setCurrentMonth(date.getMonth())
      setCurrentYear(date.getFullYear())
    }
  }

  const handleInputChange = (input: 'from' | 'to', newValue: string) => {
    if (input === 'from') {
      onChange({ from: newValue, to: value.to })
    } else {
      onChange({ from: value.from, to: newValue })
    }
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    if (selectedInput === 'from') {
      // Set 'from' date and auto-switch to 'to'
      // If 'to' is set and new 'from' is after 'to', clear 'to' to avoid invalid range
      if (value.to && dateStr > value.to) {
        onChange({ from: dateStr, to: '' })
      } else {
        onChange({ from: dateStr, to: value.to })
      }
      // Auto-switch to 'to' for better flow
      setSelectedInput('to')
    } else {
      // Set 'to' date
      // If 'from' is set and new 'to' is before 'from', clear 'from' to avoid invalid range
      if (value.from && dateStr < value.from) {
        onChange({ from: '', to: dateStr })
        setSelectedInput('from')
      } else {
        onChange({ from: value.from, to: dateStr })
      }
    }
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month)
    setIsMonthDropdownOpen(false)
  }

  const handleYearSelect = (year: number) => {
    setCurrentYear(year)
    setIsYearDropdownOpen(false)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const generateYears = () => {
    const years = []
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i)
    }
    return years
  }

  const isDateInRange = (date: Date) => {
    if (!value.from || !value.to) return false
    const dateStr = date.toISOString().split('T')[0]
    return dateStr >= value.from && dateStr <= value.to
  }

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return dateStr === value.from || dateStr === value.to
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  return (
    <div className={`relative ${className}`}>
      {/* Date Inputs */}
      <div className="flex gap-2">
        {/* From Date Input */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-muted-foreground mb-1">From</label>
          <button
            type="button"
            onClick={() => handleInputFocus('from')}
            className="w-full px-2 sm:px-3 py-2.5 text-xs sm:text-sm bg-surface text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow shadow-black/20 text-left truncate appearance-none"
            style={{ WebkitAppearance: 'none' }}
          >
            {value.from ? formatDate(value.from) : 'Select'}
          </button>
        </div>

        {/* To Date Input */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-muted-foreground mb-1">To</label>
          <button
            type="button"
            onClick={() => handleInputFocus('to')}
            className="w-full px-2 sm:px-3 py-2.5 text-xs sm:text-sm bg-surface text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow shadow-black/20 text-left truncate appearance-none"
            style={{ WebkitAppearance: 'none' }}
          >
            {value.to ? formatDate(value.to) : 'Select'}
          </button>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div 
          ref={calendarRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-background rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-amber-500" />
                Select Date Range
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ✕
              </button>
            </div>

            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors shadow shadow-black/20"
                title="Previous Month"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex gap-3">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsMonthDropdownOpen(!isMonthDropdownOpen)
                      setIsYearDropdownOpen(false)
                    }}
                    className="px-4 py-2 bg-surface rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-2 text-base font-medium shadow shadow-black/20"
                  >
                    {monthNames[currentMonth]}
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  {isMonthDropdownOpen && (
                    <div
                      ref={monthDropdownRef}
                      className="absolute top-full left-0 mt-1 bg-background rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto shadow shadow-black/20"
                    >
                      {monthNames.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => handleMonthSelect(index)}
                          className={`block w-full px-4 py-2 text-left text-base hover:bg-surface-2 transition-colors shadow shadow-black/20 ${
                            index === currentMonth ? 'bg-amber-100 text-amber-800' : ''
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsYearDropdownOpen(!isYearDropdownOpen)
                      setIsMonthDropdownOpen(false)
                    }}
                    className="px-4 py-2 bg-surface rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-2 text-base font-medium shadow shadow-black/20"
                  >
                    {currentYear}
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  {isYearDropdownOpen && (
                    <div
                      ref={yearDropdownRef}
                      className="absolute top-full left-0 mt-1 bg-background rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto shadow shadow-black/20"
                    >
                      {generateYears().map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className={`block w-full px-4 py-2 text-left text-base hover:bg-surface-2 transition-colors shadow shadow-black/20 ${
                            year === currentYear ? 'bg-amber-100 text-amber-800' : ''
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Selected Input Indicator */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedInput('from')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                  selectedInput === 'from'
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface hover:bg-surface-2'
                }`}
              >
                From: {value.from ? formatDate(value.from) : 'Not set'}
              </button>
              <button
                onClick={() => setSelectedInput('to')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                  selectedInput === 'to'
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface hover:bg-surface-2'
                }`}
              >
                To: {value.to ? formatDate(value.to) : 'Not set'}
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {(() => {
                const firstDay = new Date(currentYear, currentMonth, 1).getDay()
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                const days: JSX.Element[] = []
                
                // Add empty cells for days before the first day
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="h-10"></div>)
                }
                
                // Add days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentYear, currentMonth, day)
                  const isSelected = isDateSelected(date)
                  const inRange = isDateInRange(date)
                  
                  days.push(
                    <button
                      key={day}
                      onClick={() => handleDateClick(date)}
                      className={`
                        h-10 w-full rounded-lg transition-all text-sm shadow shadow-black/20
                        ${isSelected
                          ? 'bg-amber-500 text-white font-semibold'
                          : inRange
                          ? 'bg-amber-100 text-amber-800'
                          : 'hover:bg-surface-2'
                        }
                      `}
                    >
                      {day}
                    </button>
                  )
                }
                
                return days
              })()}
            </div>

            {/* Today, Clear, and Submit Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={goToToday}
                className="flex-1 px-3 py-2 text-sm bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-muted-foreground shadow shadow-black/20"
              >
                Today
              </button>
              <button
                onClick={() => onChange({ from: '', to: '' })}
                className="flex-1 px-3 py-2 text-sm bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-muted-foreground shadow shadow-black/20"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors text-white shadow shadow-black/20"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
