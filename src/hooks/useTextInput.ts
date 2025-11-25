import { useState, useCallback } from 'react';
import { 
  validateText, 
  getCharacterCountDisplay, 
  trimText,
  TEXT_VALIDATION 
} from '../utils/textValidation';
import type { ValidationResult } from '../utils/textValidation';

interface UseTextInputReturn {
  value: string;
  trimmedValue: string;
  characterCount: string;
  validation: ValidationResult;
  hasError: boolean;
  errorMessage?: string;
  isSubmittable: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setValue: (value: string) => void;
  reset: () => void;
}

/**
 * 텍스트 입력 커스텀 훅
 * 유효성 검사와 글자 수 카운팅을 포함
 */
export function useTextInput(initialValue: string = ''): UseTextInputReturn {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [attemptedExceedMax, setAttemptedExceedMax] = useState(false);

  const trimmedValue = trimText(value);
  const characterCount = getCharacterCountDisplay(value);
  const validation = validateText(value);
  
  // 제출 가능 여부는 전체 유효성 검사 결과 사용
  const isSubmittable = validation.isValid;

  // 입력 중 에러 표시 로직
  let currentError: string | undefined;
  let hasError = false;

  if (touched && value.length > 0) {
    if (!validation.isValid) {
      // 유효성 검사 실패 시 에러 메시지 표시
      currentError = validation.errorMessage;
      hasError = true;
    } else if (value.length === TEXT_VALIDATION.MAX_LENGTH && attemptedExceedMax) {
      // 50자 도달하고 더 입력하려고 시도했을 때만 메시지 표시
      currentError = '50자 이내로 입력해주세요.';
      hasError = true;
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // 줄바꿈 제거
    newValue = newValue.replace(/[\n\r]/g, '');
    
    // 최대 길이 초과 시도 감지
    const exceededMax = newValue.length > TEXT_VALIDATION.MAX_LENGTH;
    
    // 최대 길이 제한
    if (exceededMax) {
      newValue = newValue.slice(0, TEXT_VALIDATION.MAX_LENGTH);
      setAttemptedExceedMax(true);
    } else if (newValue.length < TEXT_VALIDATION.MAX_LENGTH) {
      // 50자 미만으로 줄어들면 플래그 리셋
      setAttemptedExceedMax(false);
    }
    
    setValue(newValue);
    
    if (!touched) {
      setTouched(true);
    }
  }, [touched]);

  const reset = useCallback(() => {
    setValue('');
    setTouched(false);
    setAttemptedExceedMax(false);
  }, []);

  return {
    value,
    trimmedValue,
    characterCount,
    validation,
    hasError,
    errorMessage: currentError,
    isSubmittable,
    handleChange,
    setValue,
    reset,
  };
}

