// 토스 로그인 API 서비스
import { appLogin } from '@apps-in-toss/web-framework';
import type {
  AppLoginResponse,
  GenerateTokenRequest,
  GenerateTokenResponse,
  UserInfo,
  AuthTokens,
} from '../types/tossAuth';
import { apiRequest } from './api';

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
 * 
 * @returns 인가 코드와 referrer 정보
 */
export async function getTossAuthorizationCode(): Promise<AppLoginResponse> {
  console.log('[Step 1] 인가 코드 받기 시작');
  
  // 브라우저 환경에서는 목 데이터 반환 (개발용)
  if (!isTossAppEnvironment()) {
    console.warn('⚠️ 브라우저 환경입니다. 토스 앱에서만 실제 로그인이 가능합니다.');
    console.log('📝 개발 모드: 목(mock) 인가 코드를 반환합니다.');
    
    // 목 데이터로 다음 단계 테스트 가능
    return {
      authorizationCode: 'MOCK_AUTH_CODE_FOR_DEVELOPMENT',
      referrer: 'SANDBOX',
    };
  }
  
  try {
    console.log('🔐 토스 앱 로그인 창을 엽니다...');
    
    const result = await appLogin();
    
    console.log('✅ [Step 1] 인가 코드 받기 성공', {
      referrer: result.referrer,
      codeLength: result.authorizationCode.length,
    });
    
    return {
      authorizationCode: result.authorizationCode,
      referrer: result.referrer,
    };
  } catch (error) {
    console.error('❌ [Step 1] 토스 로그인 실패:', error);
    throw new Error('토스 로그인에 실패했습니다.');
  }
}

/**
 * Step 2: AccessToken 발급
 * 인가 코드로 AccessToken을 발급받습니다.
 * 
 * @param authorizationCode 인가 코드
 * @param referrer 'SANDBOX' 또는 'DEFAULT'
 * @returns AccessToken, RefreshToken 등
 */
export async function generateAccessToken(
  authorizationCode: string,
  referrer: string
): Promise<AuthTokens> {
  console.log('[Step 2] AccessToken 발급 시작', {
    authCodePrefix: authorizationCode.substring(0, 10) + '...',
    referrer,
  });
  
  const requestBody: GenerateTokenRequest = {
    authorizationCode,
    referrer,
  };

  try {
    // 백엔드 개발 후 실제 엔드포인트로 변경
    // 실제 URL: https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token
    console.log('📡 백엔드 API 호출: POST /auth/toss/token');
    
    const response = await apiRequest<GenerateTokenResponse>(
      '/auth/toss/token',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    if (response.resultType === 'FAIL' || !response.success) {
      console.error('❌ [Step 2] 토큰 발급 실패:', response.error);
      throw new Error(
        response.error?.reason || '토큰 발급에 실패했습니다.'
      );
    }

    console.log('✅ [Step 2] AccessToken 발급 성공', {
      tokenType: response.success.tokenType,
      expiresIn: response.success.expiresIn,
    });

    return {
      accessToken: response.success.accessToken,
      refreshToken: response.success.refreshToken,
      expiresIn: response.success.expiresIn,
    };
  } catch (error) {
    console.error('❌ [Step 2] API 요청 실패:', error);
    throw error;
  }
}

/**
 * Step 3: 사용자 정보 조회
 * AccessToken으로 사용자 정보를 조회합니다.
 * 
 * @param accessToken AccessToken
 * @returns 사용자 정보
 */
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  console.log('[Step 3] 사용자 정보 조회 시작');
  
  try {
    // 백엔드 개발 후 실제 엔드포인트로 변경
    // 실제 URL: https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me
    console.log('📡 백엔드 API 호출: GET /auth/toss/me');
    
    const response = await apiRequest<UserInfo>(
      '/auth/toss/me',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.resultType === 'FAIL' || !response.success) {
      console.error('❌ [Step 3] 사용자 정보 조회 실패:', response.error);
      throw new Error(
        response.error?.reason || '사용자 정보 조회에 실패했습니다.'
      );
    }

    console.log('✅ [Step 3] 사용자 정보 조회 성공', {
      userKey: response.success.userKey,
    });

    return response;
  } catch (error) {
    console.error('❌ [Step 3] API 요청 실패:', error);
    throw error;
  }
}

/**
 * 토스 로그인 전체 플로우 실행
 * 1. 인가 코드 받기
 * 2. AccessToken 발급
 * 3. 사용자 정보 조회
 * 
 * @returns 사용자 정보와 토큰
 */
export async function loginWithToss() {
  console.log('🚀 토스 로그인 플로우 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Step 1: 인가 코드 받기
    const { authorizationCode, referrer } = await getTossAuthorizationCode();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Step 2: AccessToken 발급
    const tokens = await generateAccessToken(authorizationCode, referrer);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Step 3: 사용자 정보 조회
    const userInfo = await getUserInfo(tokens.accessToken);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 토스 로그인 플로우 완료!');

    return {
      userInfo,
      tokens,
    };
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('💥 토스 로그인 플로우 중단:', error);
    throw error;
  }
}

/**
 * 로컬 스토리지에 토큰 저장
 */
export function saveAuthTokens(tokens: AuthTokens) {
  localStorage.setItem('toss_access_token', tokens.accessToken);
  localStorage.setItem('toss_refresh_token', tokens.refreshToken);
  localStorage.setItem('toss_token_expires_at', 
    String(Date.now() + tokens.expiresIn * 1000)
  );
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
 * 로컬 스토리지에서 토큰 불러오기
 */
export function getStoredAuthTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem('toss_access_token');
  const refreshToken = localStorage.getItem('toss_refresh_token');
  const expiresAt = localStorage.getItem('toss_token_expires_at');

  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }

  // 토큰 만료 확인
  if (Date.now() > Number(expiresAt)) {
    clearAuthTokens();
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor((Number(expiresAt) - Date.now()) / 1000),
  };
}

/**
 * 로컬 스토리지에서 토큰 삭제
 */
export function clearAuthTokens() {
  localStorage.removeItem('toss_access_token');
  localStorage.removeItem('toss_refresh_token');
  localStorage.removeItem('toss_token_expires_at');
  localStorage.removeItem('user_key');
}

