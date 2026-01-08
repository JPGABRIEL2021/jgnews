import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SchedulePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const SchedulePicker = ({ value, onChange }: SchedulePickerProps) => {
  const [isScheduled, setIsScheduled] = useState(!!value);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [time, setTime] = useState(value ? format(new Date(value), 'HH:mm') : '09:00');

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (!checked) {
      onChange(null);
    } else if (date) {
      updateDateTime(date, time);
    }
  };

  const updateDateTime = (newDate: Date, newTime: string) => {
    const [hours, minutes] = newTime.split(':').map(Number);
    const dateTime = new Date(newDate);
    dateTime.setHours(hours, minutes, 0, 0);
    onChange(dateTime.toISOString());
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && isScheduled) {
      updateDateTime(newDate, time);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date && isScheduled) {
      updateDateTime(date, newTime);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          id="schedule"
          checked={isScheduled}
          onCheckedChange={handleScheduleToggle}
        />
        <Label htmlFor="schedule" className="cursor-pointer flex items-center gap-2">
          <Clock size={16} />
          Agendar publicação
        </Label>
      </div>

      {isScheduled && (
        <div className="flex flex-wrap gap-4 pl-10">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-[140px]"
            />
          </div>

          {value && (
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground pb-2">
                Será publicado em:{' '}
                <span className="font-medium text-foreground">
                  {format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePicker;
