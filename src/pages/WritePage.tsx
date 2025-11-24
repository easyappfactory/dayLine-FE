import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
} from '@toss/tds-mobile';
import { getToday, formatDate } from '../utils/dateUtils';
//import { adaptive } from '@toss/tds-colors';

export default function Page() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  
  // 오늘 날짜 가져오기
  const today = getToday();
  const formattedDate = formatDate(today);
  
  const handleConfirm = () => {
    if (value.trim()) {
      navigate('/stats');
      //추후 전면광고 이벤트 트리거 필요 
    }
  };
  
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label={`${formattedDate} 한 줄`}
        labelOption="sustain"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="50자 이내로 입력"
        style={{ textAlign: 'left' }}
      />
      <Button 
        display="block" 
        disabled={!value.trim()} 
        onClick={handleConfirm}
      >
        확인
      </Button>
    </div>
  );
}