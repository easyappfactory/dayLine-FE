import { Text } from '@toss/tds-mobile';
import { adaptive, colors } from '@toss/tds-colors';
import type { DiaryEntry } from '../../types/diary';
import { getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateUtils';

interface CalendarViewProps {
  year: number;
  month: number;
  data: DiaryEntry[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export const CalendarView = ({ year, month, data, selectedDate, onSelectDate }: CalendarViewProps) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getEntryForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.find(d => d.date === dateStr);
  };

  const getBackgroundColor = (score: number) => {
    if (score <= 20) return colors.blue200;
    if (score <= 40) return colors.blue300;
    if (score <= 60) return colors.blue400;
    if (score <= 80) return colors.blue500;
    return colors.blue600;
  };

  return (
    <div style={{ padding: '16px', marginTop: '8px'}}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '16px' }}>
        {weekDays.map(day => (
          <Text key={day} typography="t6" color={adaptive.grey500} textAlign="center">
            {day}
          </Text>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '16px' }}>
        {blanks.map(blank => <div key={`blank-${blank}`} />)}
        {days.map(day => {
          const entry = getEntryForDay(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const bg = entry ? getBackgroundColor(entry.score) : 'transparent';
          
          return (
            <div 
              key={day} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={() => onSelectDate(dateStr)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isSelected ? `2px solid ${colors.blue900}` : 'none',
                boxSizing: 'border-box',
              }}>
                <Text 
                  typography="t6" 
                  color={entry ? 'white' : adaptive.grey800}
                  fontWeight={entry ? 'bold' : 'regular'}
                >
                  {day}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

