import { useEffect } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';

interface UseAdMobOptions {
  adGroupId: string;
  shouldLoad?: boolean; // 로드 여부 제어 (예: 이미 작성된 경우 false)
}

export const useAdMob = ({ adGroupId, shouldLoad = true }: UseAdMobOptions) => {
  // 광고 로드
  useEffect(() => {
    if (!shouldLoad) return;

    if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) {
      // 샌드박스 등 미지원 환경에서는 로드 시도 안 함
      return;
    }

    GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (event) => {
        console.log('광고 이벤트:', event.type);
      },
      onError: (error) => {
        alert('광고 로드 실패:' + error.message);
      }
    });
  }, [adGroupId, shouldLoad]);

  // 광고 표시 함수 (Promise 반환)
  const showAd = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      // 지원되지 않는 환경 체크
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
        GoogleAdMob.showAppsInTossAdMob({
          options: { adGroupId },
          onEvent: (event) => {
            if (event.type === 'dismissed' || event.type === 'failedToShow') {
              clearTimeout(timeoutId);
              resolve();
            }
          },
          onError: (error) => {
            console.error('광고 표시 실패:', error);
            clearTimeout(timeoutId);
            resolve();
          }
        });
      } catch (error) {
        console.error('광고 호출 중 에러:', error);
        clearTimeout(timeoutId);
        resolve();
      }
    });
  };

  return { showAd };
};

