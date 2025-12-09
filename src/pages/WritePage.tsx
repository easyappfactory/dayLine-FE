import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
} from '@toss/tds-mobile';
import { getToday, formatDate } from '../utils/dateUtils';
import { useTextInput } from '../hooks/useTextInput';
import { analyzeDiaryText } from '../services/gpt';
import { saveDiary } from '../services/diary';
//import { adaptive } from '@toss/tds-colors';

export default function Page() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleConfirm = async () => {
    if (isSubmittable && !isLoading) {
      try {
        setIsLoading(true);
        
        // 1단계: GPT API 호출하여 감정 분석
        console.log('GPT API 호출 시작...');
        const gptResponse = await analyzeDiaryText(trimmedValue);
        
        console.log('GPT API 응답 성공:', gptResponse);

        
        // 2단계: GPT 응답 검증
        if (!gptResponse || !gptResponse.line || typeof gptResponse.score !== 'number') {
          throw new Error('GPT 응답이 올바르지 않습니다.');
        }
        
        // 3단계: 백엔드에 저장
        console.log('백엔드 저장 요청 시작...');
        const dateString = formatDate(today, '-'); // YYYY-MM-DD 형식
        await saveDiary({
          date: dateString,
          content: gptResponse.line,
          emotion: gptResponse.score,
        });
        console.log('백엔드 저장 성공!');
        
        // 4단계: 성공 후 다음 페이지로 이동
        // 추후 전면광고 이벤트 트리거 필요
        navigate('/stats');
      } catch (error) {
        console.error('에러 발생:', error);
        
        // 사용자 친화적인 에러 메시지
        if (error instanceof Error) {
          if (error.message.includes('로그인')) {
            alert('로그인이 필요해요.');
          } else if (error.message.includes('GPT')) {
            alert('일기 분석 중 오류가 발생했어요. 다시 시도해주세요.');
          } else if (error.message.includes('네트워크')) {
            alert('네트워크 연결을 확인해주세요.');
          } else {
            alert('저장 중 오류가 발생했어요. 다시 시도해주세요.');
          }
        } else {
          alert('알 수 없는 오류가 발생했어요. 다시 시도해주세요.');
        }
      } finally {
        setIsLoading(false);
      }
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
        disabled={!isSubmittable || isLoading} 
        onClick={handleConfirm}
      >
        {isLoading ? '분석 중...' : '확인'}
      </Button>
    </div>
  );
}