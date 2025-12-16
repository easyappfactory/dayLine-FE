import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToday, formatDate } from '../../../utils/dateUtils';
import { useSaveDiary } from './useDiaryData';
import { analyzeDiaryText } from '../../../services/gpt';
import { useAdMob } from '../../common/useAdMob';

interface UseDiarySubmitProps {
  trimmedValue: string;
  hasTodayDiary: boolean;
}

export const useDiarySubmit = ({ trimmedValue, hasTodayDiary }: UseDiarySubmitProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // 오늘 날짜 정보
  const today = useMemo(() => getToday(), []);
  const formattedDate = formatDate(today);

  // 광고 훅 사용
  const { showAd } = useAdMob({
    adGroupId: 'ait-ad-test-interstitial-id',
    shouldLoad: !hasTodayDiary // 이미 작성했다면 광고 로드 안 함
  });

  const { mutateAsync: saveDiaryMutation } = useSaveDiary();

  const handleSubmit = async () => {
    // 1. 이미 작성된 경우 StatsPage로 이동
    if (hasTodayDiary) {
      navigate('/stats', { state: { skipComplete: true } });
      return;
    }

    try {
      // 2. 광고 표시 (완료될 때까지 대기)
      //    지원되지 않는 환경이면 내부적으로 alert 띄우고 바로 resolve 됨
      await showAd();

      // 3. 로딩 시작 (광고가 닫힌 후)
      setIsLoading(true);

      // 4. 데이터 처리 (GPT 분석 -> 저장)
      const dataPromise = (async () => {
        // GPT 분석
        const gptResponse = await analyzeDiaryText(trimmedValue);
        
        // 검증
        if (!gptResponse || !gptResponse.line || typeof gptResponse.score !== 'number') {
          throw new Error('GPT 응답이 올바르지 않습니다.');
        }
        
        // 백엔드 저장
        const dateString = formatDate(today, '-');
        await saveDiaryMutation({
          date: dateString,
          content: gptResponse.line,
          emotion: gptResponse.score,
        });
      })();

      // 에러 캐치용 래퍼
      const safeDataPromise = dataPromise.catch(err => ({ error: err }));
      
      // 실행 결과 확인
      const result = await safeDataPromise;
      if (result && 'error' in result) {
        throw result.error;
      }
      
      // 5. 성공 시 이동
      navigate('/stats');

    } catch (error) {
      console.error('에러 발생:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('로그인')) {
          alert('로그인이 필요해요.');
        } else if (error.message.includes('GPT')) {
          alert('일기 분석에 실패했어요. 다시 시도해주세요.');
        } else if (error.message.includes('네트워크')) {
          alert('네트워크 연결을 확인해주세요.');
        } else {
          alert('저장에 실패했어요. 다시 시도해주세요.');
        }
      } else {
        alert('알 수 없는 오류가 있어요. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
    formattedDate,
    today
  };
};

