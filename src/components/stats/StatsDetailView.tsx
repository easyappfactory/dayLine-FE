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
        <Badge variant="weak" color="blue" size="medium">
          + {entry.score}
        </Badge>
      </div>

      <Text
        display="block"
        color={adaptive.grey700}
        typography="t5"
        fontWeight="regular"
        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
      >
        {entry.line}
      </Text>
    </div>
  );
};

