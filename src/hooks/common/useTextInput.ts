import { useState, useCallback } from 'react';
import { 
  validateText, 
  getCharacterCountDisplay, 
  trimText,
  TEXT_VALIDATION 
} from '../../utils/textValidation';
import type { ValidationResult } from '../../utils/textValidation';

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

  const trimmedValue = trimText(value);
  const characterCount = getCharacterCountDisplay(value);
  const validation = validateText(value);
  
  // 제출 가능 여부는 전체 유효성 검사 결과 사용
  const isSubmittable = validation.isValid;

  // 입력 중 에러 표시 로직
  // 1. 50자에 도달했을 때
  // 2. 입력된 내용이 있고, 유효하지 않을 때 (자모음만, 반복 등)
  const shouldShowError = touched && value.length > 0 && !validation.isValid;
  const hasError = shouldShowError;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // 줄바꿈 제거
    newValue = newValue.replace(/[\n\r]/g, '');
    
    // 최대 길이 제한
    if (newValue.length > TEXT_VALIDATION.MAX_LENGTH) {
      newValue = newValue.slice(0, TEXT_VALIDATION.MAX_LENGTH);
    }
    
    setValue(newValue);
    if (!touched) {
      setTouched(true);
    }
  }, [touched]);

  const reset = useCallback(() => {
    setValue('');
    setTouched(false);
  }, []);

  return {
    value,
    trimmedValue,
    characterCount,
    validation,
    hasError,
    errorMessage: hasError ? validation.errorMessage : undefined,
    isSubmittable,
    handleChange,
    setValue,
    reset,
  };
}

