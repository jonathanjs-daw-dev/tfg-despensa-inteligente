import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * value: string "YYYY-MM-DD" o ""
 * onChange: (value: string) => void  — devuelve "YYYY-MM-DD" o ""
 */
export function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha', className }) {
  const [open, setOpen] = useState(false)

  const selected = value ? parseISO(value) : undefined

  function handleSelect(date) {
    onChange(date ? format(date, 'yyyy-MM-dd') : '')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start text-left font-normal',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: es }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
