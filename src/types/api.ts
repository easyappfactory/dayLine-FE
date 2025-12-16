// API 공통 응답 구조
export interface SuccessResponse<T = void> {
  success: boolean;
  message: string;
  data: T | null;
}












