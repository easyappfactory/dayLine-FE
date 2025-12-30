import { ListHeader, Text, Badge } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import type { DiaryEntry } from '../../types/diary';

interface StatsDetailViewProps {
  entry: DiaryEntry | null;
  selectedDate: string;
}

export const StatsDetailView = ({ entry, selectedDate }: StatsDetailViewProps) => {
  if (!entry) {
    return (
      <div style={{ padding: '0 24px', marginTop: '24px'}}>
         <Text
          typography="t5"
          color={adaptive.grey500}
        >
          한 줄 일기가 없습니다.
        </Text>
      </div>
    );
  }

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formattedDate = selectedDate.replace(/-/g, '.');

  // 점수에 따른 색상 결정
  const getBadgeColor = (score: number): "red" | "yellow" | "green" | "blue" => {
    if (score <= 30) return "red";
    if (score <= 50) return "yellow";
    if (score <= 70) return "green";
    return "blue";
  };

  return (
    <div>
      <ListHeader
        title={
          <ListHeader.TitleParagraph
            color={adaptive.grey800}
            fontWeight="bold"
            typography="t5"
          >
            {formattedDate} 한 줄
          </ListHeader.TitleParagraph>
        }
        descriptionPosition="bottom"
        style={{ padding: '24px 0 16px' }}
      />
      
      <div style={{ marginBottom: '16px', display: 'flex' , padding: '0 24px'}}>
        <Badge variant="weak" color={getBadgeColor(entry.score)} size="medium">
          + {entry.score}
        </Badge>
      </div>

      <Text
        display="block"
        color={adaptive.grey800}
        typography="t5"
        fontWeight="medium"
        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', padding: '0 24px', textAlign: 'left' }}
      >
        {entry.line}
      </Text>

      {entry.description && (
        <div style={{ 
          margin: '20px 24px 0',
          padding: '16px',
          backgroundColor: adaptive.grey50,
          borderRadius: '12px',
          border: `1px solid ${adaptive.grey100}`
        }}>
          <Text
            display="block"
            color={adaptive.grey600}
            typography="t7"
            fontWeight="semibold"
            style={{ marginBottom: '8px', textAlign: 'left' }}
          >
            💡 오늘의 한마디
          </Text>
          <Text
            display="block"
            color={adaptive.grey500}
            typography="t7"
            fontWeight="regular"
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', textAlign: 'left' }}
          >
            {entry.description}
          </Text>
        </div>
      )}
    </div>
  );
};

