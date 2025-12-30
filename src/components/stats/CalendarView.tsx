import { Text } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
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

  // Badge weak variant와 동일한 색상 사용 (TDS adaptive 색상)
  const getBackgroundColor = (score: number) => {
    if (score <= 30) return adaptive.red100;
    if (score <= 50) return adaptive.yellow100;
    if (score <= 70) return adaptive.green100;
    return adaptive.blue100;
  };

  // 배경색에 맞는 텍스트 색상
  const getTextColor = (score: number) => {
    if (score <= 30) return adaptive.red700;
    if (score <= 50) return adaptive.yellow700;
    if (score <= 70) return adaptive.green700;
    return adaptive.blue700;
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
          const textColor = entry ? getTextColor(entry.score) : adaptive.grey800;
          
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
                border: isSelected ? `2px solid ${adaptive.grey200}` : 'none',
                boxSizing: 'border-box',
              }}>
                <Text 
                  typography="t6" 
                  color={textColor}
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

