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
    adGroupId: 'ait.v2.live.8be900a4b263458c',
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
      // 2. 로딩 시작 (광고 및 데이터 처리 전)
      setIsLoading(true);

      // 3. 광고와 데이터 처리를 병렬로 실행
      //    광고 보는 동안 GPT 분석 + 백엔드 저장이 동시에 진행됨
      //    → 광고 중 앱이 백그라운드로 가도 데이터는 이미 저장된 상태!
      await Promise.all([
        // 광고 표시 (네이티브에서 독립적으로 실행)
        showAd(),
        
        // 데이터 처리 (GPT 분석 -> 백엔드 저장)
        (async () => {
          // GPT 분석
          const gptResponse = await analyzeDiaryText(trimmedValue);
          
          // 검증
          if (!gptResponse || !gptResponse.line || typeof gptResponse.score !== 'number') {
            throw new Error('GPT 응답이 올바르지 않습니다.');
          }
          
          // 백엔드 저장 (description 포함)
          const dateString = formatDate(today, '-');
          await saveDiaryMutation({
            date: dateString,
            content: gptResponse.line,
            emotion: gptResponse.score,
            description: gptResponse.description,
          });
        })()
      ]);
      
      // 4. 성공 시 이동
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

