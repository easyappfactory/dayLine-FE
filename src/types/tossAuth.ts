// 토스 로그인 관련 타입 정의

// 백엔드 요청 DTO
export interface TossLoginRequest {
  authorizationCode: string;
  referrer: string;
}

// 로그인 성공 시 응답 데이터 타입
// API 요청 헤더(Authorization)에 사용할 userKey(Int)를 응답으로 받아야 합니다.
export type TossLoginData = number; 
