import { TextField, Button } from '@toss/tds-mobile';

interface DiaryInputFormProps {
  dateText: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError: boolean;
  errorMessage: string | undefined;
  characterCount: string;
  hasTodayDiary: boolean;
  isSubmittable: boolean;
  isLoading: boolean;
  isChecking: boolean;
  onSubmit: () => void;
}

export const DiaryInputForm = ({
  dateText,
  value,
  onChange,
  hasError,
  errorMessage,
  characterCount,
  hasTodayDiary,
  isSubmittable,
  isLoading,
  isChecking,
  onSubmit,
}: DiaryInputFormProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <TextField.Clearable
          variant="box"
          hasError={hasError}
          label={`${dateText} 한 줄`}
          labelOption="sustain"
          value={value}
          onChange={onChange}
          placeholder={hasTodayDiary ? "오늘의 일기를 이미 작성했어요" : "50자 이내로 입력해주세요"}
          disabled={hasTodayDiary || isChecking || isLoading}
          style={{ textAlign: 'left' }}
        />
        <div style={{ 
          margin: '0 22px 24px 0', 
          fontSize: '14px', 
          color: hasError ? '#f04452' : '#8b95a1',
          textAlign: 'right'
        }}>
          {hasTodayDiary ? '내일 또 만나요' : (errorMessage || characterCount)}
        </div>
      </div>
      <Button 
        display="block" 
        disabled={(!hasTodayDiary && (!isSubmittable || isLoading || isChecking))} 
        onClick={onSubmit}
        variant={hasTodayDiary ? "weak" : "fill"}
        size="large"
        style={{ width: '100%' }}
      >
        {hasTodayDiary ? '그래프 확인하기' : (isLoading ? '분석하고 있어요' : '작성하기')}
      </Button>
    </div>
  );
};

