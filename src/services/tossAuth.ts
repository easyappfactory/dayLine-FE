// 토스 로그인 API 서비스
import { appLogin } from '@apps-in-toss/web-framework';
import type {
  TossLoginRequest,
  TossLoginData,
} from '../types/tossAuth';
import type { SuccessResponse } from '../types/api';

/**
 * 토스 앱 환경인지 확인
 */
function isTossAppEnvironment(): boolean {
  return typeof window !== 'undefined' && 
    'ReactNativeWebView' in window;
}

/**
 * Step 1: 토스 앱에서 인가 코드 받기
 * SDK를 통해 사용자 인증을 요청하고 인가 코드를 받습니다.
 */
export async function getTossAuthorizationCode(): Promise<{ authorizationCode: string; referrer: string }> {
  console.log('[Step 1] 인가 코드 받기 시작');
  
  // 브라우저 환경에서는 목 데이터 반환 (개발용)
  if (!isTossAppEnvironment()) {
    console.warn(' 브라우저 환경입니다. 토스 앱에서만 실제 로그인이 가능합니다.');
    console.log(' 개발 모드: 목(mock) 인가 코드를 반환합니다.');
    
    return {
      authorizationCode: 'MOCK_AUTH_CODE_FOR_DEVELOPMENT',
      referrer: 'SANDBOX',
    };
  }
  
  try {
    console.log(' 토스 앱 로그인 창을 엽니다...');
    
    const result = await appLogin();
    
    console.log('인가 코드 받기 성공', {
      referrer: result.referrer,
      codeLength: result.authorizationCode.length,
    });
    
    return {
      authorizationCode: result.authorizationCode,
      referrer: result.referrer,
    };
  } catch (error) {
    console.error(' [Step 1] 토스 로그인 실패:', error);
    throw new Error('토스 로그인에 실패했습니다.');
  }
}

/**
 * Step 2: 백엔드 로그인 요청
 * 인가 코드를 백엔드로 전송하여 로그인을 완료합니다.
 * 
 * [중요] userKey 획득 전략
 * 1. 응답 Body(DTO)의 data 필드 확인 (권장)
 * 2. 응답 Header의 Authorization 필드 확인 (fallback)
 */
export async function loginToBackend(
  authorizationCode: string,
  referrer: string
): Promise<TossLoginData> {
  console.log('[Step 2] 백엔드 로그인 요청 시작', { referrer });

  const requestBody: TossLoginRequest = {
    authorizationCode,
    referrer,
  };

  try {
    // apiRequest 대신 fetch를 직접 사용하여 헤더와 바디 모두 검사
    // TODO: 실제 백엔드 엔드포인트로 변경 필요 (현재: /api/auth/login)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '로그인에 실패했습니다.');
    }

    // 1. JSON Body 파싱 시도
    const body: SuccessResponse<TossLoginData> = await response.json();

    // Case 1: Body에 userKey가 있는 경우 (팀에서 정의한 규칙에 따라 가드 체크용)
    if (body.success && typeof body.data === 'number') {
      console.log('[Step 2] Body에서 userKey 획득:', body.data);
      return body.data;
    }

    // Case 2: Header에서 확인 (Authorization 또는 X-User-Key)
    // 백엔드에서 "Authorization" 헤더에 값(숫자)만 넣어서 보냄 (Bearer 없음)
    const authHeader = response.headers.get('Authorization');
    
    console.log('[Step 2] 헤더 확인:', { 
      Authorization: authHeader, 
    });

    const headerValue = authHeader;

    if (headerValue) {
      // Bearer 없이 숫자만 오므로 숫자만 추출 시도
      // 예: "12345" -> 12345
      const userKey = Number(headerValue.trim());
      
      if (!isNaN(userKey) && userKey > 0) {
        console.log('Header에서 userKey 획득:', userKey);
        return userKey;
      }
    }
    
    // Case 3: 둘 다 없는 경우
    console.warn('백엔드 로그인 응답에 userKey가 없습니다.', { body, headers: Object.fromEntries(response.headers.entries()) });
    throw new Error('로그인 응답에서 사용자 식별 키(userKey)를 찾을 수 없습니다.');
    
  } catch (error) {
    console.error('[Step 2] 로그인 API 요청 실패:', error);
    throw error;
  }
}

/**
 * 통합 로그인 플로우
 */
export async function loginWithToss() {
  console.log('토스 로그인 플로우 시작');
  
  try {
    // 1. 인가 코드 획득
    const { authorizationCode, referrer } = await getTossAuthorizationCode();
    
    // 2. 백엔드 로그인
    const userKey = await loginToBackend(authorizationCode, referrer);
    
    // 3. UserKey 저장
    saveUserKey(userKey);
    console.log('UserKey 저장 완료:', userKey);

    console.log('로그인 완료!');
    return userKey;
  } catch (error) {
    console.error('로로그인 프로세스 중단:', error);
    throw error;
  }
}

/**
 * 로컬 스토리지에 userKey 저장
 */
export function saveUserKey(userKey: number) {
  localStorage.setItem('user_key', String(userKey));
}

/**
 * 로컬 스토리지에서 userKey 가져오기
 */
export function getUserKey(): number | null {
  const userKey = localStorage.getItem('user_key');
  return userKey ? Number(userKey) : null;
}

/**
 * 로그아웃 (로컬 데이터 삭제)
 */
export function logout() {
  localStorage.removeItem('user_key');
}
