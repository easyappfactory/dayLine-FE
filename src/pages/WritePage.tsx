import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
} from '@toss/tds-mobile';
import { getToday, formatDate } from '../utils/dateUtils';
import { useTextInput } from '../hooks/useTextInput';
//import { adaptive } from '@toss/tds-colors';

export default function Page() {
  const navigate = useNavigate();
  const {
    value,
    trimmedValue,
    characterCount,
    hasError,
    errorMessage,
    isSubmittable,
    handleChange,
  } = useTextInput();
  
  // 오늘 날짜 가져오기
  const today = getToday();
  const formattedDate = formatDate(today);
  
  const handleConfirm = () => {
    if (isSubmittable) {
      // trimmedValue를 사용하여 저장 (앞뒤 공백 제거됨)
      console.log('저장할 내용:', trimmedValue);
      navigate('/stats');
      //추후 전면광고 이벤트 트리거 필요 
    }
  };
  
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <div>
        <TextField.Clearable
          variant="box"
          hasError={hasError}
          label={`${formattedDate} 한 줄`}
          labelOption="sustain"
          value={value}
          onChange={handleChange}
          placeholder="50자 이내로 입력"
          style={{ textAlign: 'left' }}
        />
        <div style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: hasError ? '#f04452' : '#8b95a1',
          textAlign: 'right'
        }}>
          {errorMessage || characterCount}
        </div>
      </div>
      <Button 
        display="block" 
        disabled={!isSubmittable} 
        onClick={handleConfirm}
      >
        확인
      </Button>
    </div>
  );
}