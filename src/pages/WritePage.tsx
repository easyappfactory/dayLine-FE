import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Text,
} from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { useQueryClient } from '@tanstack/react-query';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { getToday, formatDate } from '../utils/dateUtils';
import { useTextInput } from '../hooks/useTextInput';
import { useHasTodayDiary, useSaveDiary, DIARY_KEYS } from '../hooks/useDiaryData';
import { analyzeDiaryText } from '../services/gpt';
import { AdPromotionBottomSheet } from '../components/bottomSheets/AdPromotionBottomSheet';

export default function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdSheetOpen, setIsAdSheetOpen] = useState(false);
  //const adLoadedRef = useRef(false);
  
  const {
    value,
    trimmedValue,
    characterCount,
    hasError,
    errorMessage,
    isSubmittable,
    handleChange,
  } = useTextInput();
  
  // 오늘 작성 여부 확인
  const { hasTodayDiary, isLoading: isChecking } = useHasTodayDiary();
  const { mutateAsync: saveDiaryMutation } = useSaveDiary();
  
  // 오늘 날짜 가져오기
  const today = useMemo(() => getToday(), []);
  const formattedDate = formatDate(today);

  // 페이지 진입 시 데이터 갱신 (뒤로가기로 왔을 때 대비)
  useEffect(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // 현재 월의 데이터 무효화하여 최신 상태 확인
    queryClient.invalidateQueries({ 
      queryKey: DIARY_KEYS.monthly(year, month) 
    });
  }, [queryClient, today]);
  
  // 광고 로드
  useEffect(() => {
    // 오늘 일기를 이미 작성했다면 광고 로드하지 않음
    if (hasTodayDiary) return;

    // 지원되지 않는 환경(샌드박스 등)에서는 알림 표시
    // 로그인 시점이 아니라, 실제로 광고를 '보여줘야 할 때' 알림을 띄우는 것이 좋으므로
    // 여기서는 로드만 시도하고 알림은 주석 처리하거나 제거합니다.
    if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) {
      // alert('현재 환경(샌드박스 등)에서는 광고가 표시되지 않아요.\n 실제 앱에서는 정상적으로 전면 광고가 표시돼요.');
      return;
    }

    // [수정] loadAppsInTossAdMob 사용 및 adGroupId 파라미터 사용
    GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: 'ait-ad-test-interstitial-id'
      },
      onEvent: (event) => {
        console.log('광고 이벤트:', event.type);
      },
      onError: (error) => {
        alert('광고 로드 실패:' + error.message);
      }
    });
  }, [hasTodayDiary]);

  const handleConfirm = async () => {
    // 이미 작성된 경우 StatsPage로 이동
    if (hasTodayDiary) {
      // 이미 작성된 상태에서 이동 시에는 완료 화면을 생략하고 바로 통계 화면을 보여줌
      navigate('/stats', { state: { skipComplete: true } });
      return;
    }

    if (isSubmittable && !isLoading) {
      // 바텀시트 열기
      setIsAdSheetOpen(true);
    }
  };

  const processDiarySubmission = async () => {
    // 바텀시트 닫기
    setIsAdSheetOpen(false);

    try {
      // 광고가 뜨는 동안 로딩 화면이 가리지 않도록, 로딩 상태 설정을 광고 이후로 미룹니다.
      // setIsLoading(true); 

      // 광고 표시 Promise
      const showAdPromise = new Promise<void>((resolve) => {
        // [수정] 지원되지 않는 환경이면 바로 통과
        if (GoogleAdMob.showAppsInTossAdMob.isSupported() !== true) {
          alert('현재 환경(샌드박스 등)에서는 광고가 표시되지 않아요.\n실제 앱에서는 정상적으로 전면 광고가 표시돼요.');
          resolve();
          return;
        }

        // 타임아웃 설정 (3초)
        const timeoutId = setTimeout(() => {
          console.warn('광고 응답 시간 초과: 강제 진행');
          resolve();
        }, 3000);

        try {
          // [수정] showAppsInTossAdMob 사용
          GoogleAdMob.showAppsInTossAdMob({
            options: {
              adGroupId: 'ait-ad-test-interstitial-id'
            },
            onEvent: (event) => {
              if (event.type === 'dismissed' || event.type === 'failedToShow') {
                clearTimeout(timeoutId);
                resolve();
              }
            },
            onError: (error) => {
              console.error('광고 표시 실패:', error);
              // alert 제거 (개발 편의성)
              clearTimeout(timeoutId);
              resolve(); // 에러 발생 시에도 진행
            }
          });
        } catch (error) {
          console.error('광고 호출 중 에러:', error);
          clearTimeout(timeoutId);
          resolve();
        }
      });

      // [수정] 광고가 닫힐 때까지 대기 (이 동안은 로딩 오버레이 없이 기존 화면 유지)
      await showAdPromise;

      // [수정] 광고 종료 후 로딩 표시 및 데이터 분석 시작
      setIsLoading(true);
      
      // 데이터 처리 Promise
      const dataPromise = (async () => {
        // 1단계: GPT API 호출하여 감정 분석
        console.log('GPT API 호출 시작...');
        const gptResponse = await analyzeDiaryText(trimmedValue);
        
        console.log('GPT API 응답 성공:', gptResponse);
        
        // 2단계: GPT 응답 검증
        if (!gptResponse || !gptResponse.line || typeof gptResponse.score !== 'number') {
          throw new Error('GPT 응답이 올바르지 않습니다.');
        }
        
        // 3단계: 백엔드에 저장 (useSaveDiary 사용)
        console.log('백엔드 저장 요청 시작...');
        const dateString = formatDate(today, '-'); // YYYY-MM-DD 형식
        
        // mutateAsync는 onSuccess(invalidateQueries)가 완료될 때까지 기다림
        await saveDiaryMutation({
          date: dateString,
          content: gptResponse.line,
          emotion: gptResponse.score,
        });

        console.log('백엔드 저장 및 데이터 갱신 완료!');
      })();

      // Unhandled Rejection 방지를 위해 catch 처리
      const safeDataPromise = dataPromise.catch(err => ({ error: err }));

      // [수정] 위에서 이미 광고 대기를 마쳤으므로 여기서는 await showAdPromise 제거
      // await showAdPromise;
      
      // 데이터 처리 결과 확인
      const result = await safeDataPromise;
      if (result && 'error' in result) {
        throw result.error;
      }
      
      // 4단계: 성공 후 다음 페이지로 이동
      navigate('/stats');
    } catch (error) {
      console.error('에러 발생:', error);
      
      // 사용자 친화적인 에러 메시지
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
  
  return (
    <>
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: adaptive.background,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <Text typography="t4" fontWeight="bold">
            일기를 분석하고 있어요
          </Text>
          <Text typography="t6" color={adaptive.grey600}>
            잠시만 기다려주세요
          </Text>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
        <div style={{ flex: 1 }}>
          <TextField.Clearable
            variant="box"
            hasError={hasError}
            label={`${formattedDate} 한 줄`}
            labelOption="sustain"
            value={value}
            onChange={handleChange}
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
          // 작성 완료 상태이거나 로딩 중이면 비활성화 처리하지 않고, 
          // hasTodayDiary일 때는 활성화하여 "보러가기" 버튼으로 사용
          disabled={(!hasTodayDiary && (!isSubmittable || isLoading || isChecking))} 
          onClick={handleConfirm}
          variant={hasTodayDiary ? "weak" : "fill"}
          size="large"
          style={{ width: '100%' }}
        >
          {hasTodayDiary ? '그래프 확인하기' : (isLoading ? '분석하고 있어요' : '작성하기')}
        </Button>
      </div>

      <AdPromotionBottomSheet
        open={isAdSheetOpen}
        onClose={() => setIsAdSheetOpen(false)}
        onNavigate={processDiarySubmission}
      />
    </>
  );
}
