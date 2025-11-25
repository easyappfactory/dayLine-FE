// 토스 로그인 관련 타입 정의

export interface AppLoginResponse {
  authorizationCode: string;
  referrer: 'SANDBOX' | 'DEFAULT';
}

export interface GenerateTokenRequest {
  authorizationCode: string;
  referrer: string;
}

export interface GenerateTokenResponse {
  resultType: 'SUCCESS' | 'FAIL';
  success?: {
    accessToken: string;
    refreshToken: string;
    scope: string;
    tokenType: string;
    expiresIn: number;
  };
  error?: {
    errorCode: string;
    reason: string;
  };
}

export interface UserInfo {
  resultType: 'SUCCESS' | 'FAIL';
  success?: {
    userKey: number;  // 사용자 식별자 (일기 API에서 사용)
  };
  error?: {
    errorCode: string;
    reason: string;
  };
}

// 토스 API에서 받는 전체 사용자 정보 (백엔드 전용)
export interface TossUserInfoFull {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  name?: string;
  phone?: string;
  birthday?: string;
  ci?: string;
  di?: string | null;
  gender?: string;
  nationality?: string;
  email?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

