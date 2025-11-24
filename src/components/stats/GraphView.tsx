import { useMemo } from 'react';
import { Text } from '@toss/tds-mobile';
import { adaptive, colors } from '@toss/tds-colors';
import type { DiaryEntry } from '../../types/diary';
import { getDaysInMonth, isSameMonth } from '../../utils/dateUtils';

interface GraphViewProps {
  year: number;
  month: number;
  data: DiaryEntry[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export const GraphView = ({ year, month, data, selectedDate, onSelectDate }: GraphViewProps) => {
  const daysInMonth = getDaysInMonth(year, month);
  
  // 해당 월의 데이터만 필터링하고 날짜순 정렬
  const monthlyData = useMemo(() => {
    return data
      .filter(d => isSameMonth(d.date, year, month))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, year, month]);

  if (monthlyData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text typography="t5" color={adaptive.grey500}>데이터가 없습니다.</Text>
      </div>
    );
  }

  // 그래프 그리기 상수
  const padding = 20;
  const height = 200;
  const width = 300; // SVG viewBox width
  
  // 좌표 계산
  const points = monthlyData.map(d => {
    const day = new Date(d.date).getDate();
    const x = padding + ((day - 1) / (daysInMonth - 1)) * (width - 2 * padding);
    const y = height - padding - (d.score / 100) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Y축 가이드라인 (0, 50, 100) */}
        {[0, 50, 100].map(score => {
          const y = height - padding - (score / 100) * (height - 2 * padding);
          return (
            <g key={score}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={adaptive.grey200} strokeWidth="1" />
              <text x={0} y={y + 4} fontSize="10" fill={adaptive.grey500}>{score}</text>
            </g>
          );
        })}
        
        {/* 그래프 라인 */}
        <polyline
          points={points}
          fill="none"
          stroke={colors.blue500}
          strokeWidth="2"
        />
        
        {/* 데이터 포인트 */}
        {monthlyData.map((d, i) => {
          const day = new Date(d.date).getDate();
          const x = padding + ((day - 1) / (daysInMonth - 1)) * (width - 2 * padding);
          const y = height - padding - (d.score / 100) * (height - 2 * padding);
          const isSelected = selectedDate === d.date;

          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r={isSelected ? "6" : "4"} 
              fill={isSelected ? colors.blue700 : colors.blue500} 
              stroke={isSelected ? adaptive.background : 'none'}
              strokeWidth={isSelected ? "2" : "0"}
              onClick={() => onSelectDate(d.date)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

