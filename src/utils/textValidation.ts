/**
 * 텍스트 유효성 검사 유틸리티
 */

const MAX_LENGTH = 50;
const MIN_LENGTH = 3;
const MAX_REPEATED_CHARS = 10;

/**
 * 완성형 한글 체크 (가-힣)
 */
function hasCompleteHangul(text: string): boolean {
  return /[가-힣]/.test(text);
}

/**
 * 자모음만 있는지 체크 (ㄱ-ㅎ, ㅏ-ㅣ)
 */
function hasOnlyJamoeum(text: string): boolean {
  const jamoeumRegex = /[ㄱ-ㅎㅏ-ㅣ]/;
  
  // 자모음이 있으면서 완성형 한글이 없으면 true
  return jamoeumRegex.test(text) && !hasCompleteHangul(text);
}

/**
 * 동일 문자가 연속으로 반복되는지 체크
 */
function hasExcessiveRepetition(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    let count = 1;
    for (let j = i + 1; j < text.length && text[i] === text[j]; j++) {
      count++;
      if (count >= MAX_REPEATED_CHARS) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 줄바꿈이 포함되어 있는지 체크
 */
function hasLineBreak(text: string): boolean {
  return /[\n\r]/.test(text);
}

/**
 * 공백 제외 최소 길이 체크
 */
function meetsMinLength(text: string): boolean {
  const withoutSpaces = text.replace(/\s/g, '');
  return withoutSpaces.length >= MIN_LENGTH;
}

/**
 * 최대 길이 체크
 */
function meetsMaxLength(text: string): boolean {
  return text.length <= MAX_LENGTH;
}

/**
 * 앞뒤 공백 제거
 */
export function trimText(text: string): string {
  return text.trim();
}

/**
 * 현재 글자 수 반환
 */
export function getCharacterCount(text: string): number {
  return text.length;
}

/**
 * 글자 수 표시 문자열 생성 (ex: "34 / 50")
 */
export function getCharacterCountDisplay(text: string): string {
  return `${getCharacterCount(text)} / ${MAX_LENGTH}`;
}

/**
 * 텍스트 유효성 검사
 * @returns { isValid: boolean, errorMessage?: string }
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateText(text: string): ValidationResult {
  // 빈 값 체크
  if (!text) {
    return { isValid: false, errorMessage: '내용을 입력해주세요.' };
  }

  // 줄바꿈 체크
  if (hasLineBreak(text)) {
    return { isValid: false, errorMessage: '줄바꿈은 입력할 수 없어요.' };
  }

  // 최대 길이 체크
  if (!meetsMaxLength(text)) {
    return { isValid: false, errorMessage: `최대 ${MAX_LENGTH}자까지 입력할 수 있어요.` };
  }

  const trimmedText = trimText(text);

  // 공백만 있는지 체크
  if (!trimmedText) {
    return { isValid: false, errorMessage: '공백만 입력할 수 없어요.' };
  }

  // 공백 제외 최소 길이 체크
  if (!meetsMinLength(trimmedText)) {
    return { isValid: false, errorMessage: `공백을 제외하고 최소 ${MIN_LENGTH}자 이상 입력해주세요.` };
  }

  // 자모음만 있는지 체크
  if (hasOnlyJamoeum(trimmedText)) {
    return { isValid: false, errorMessage: '자음이나 모음만 입력할 수 없어요.' };
  }

  // 동일 문자 반복 체크
  if (hasExcessiveRepetition(trimmedText)) {
    return { isValid: false, errorMessage: '동일한 문자를 10자 이상 반복할 수 없어요.' };
  }

  return { isValid: true };
}

/**
 * 제출 가능한 텍스트인지 체크
 */
export function canSubmit(text: string): boolean {
  return validateText(text).isValid;
}

export const TEXT_VALIDATION = {
  MAX_LENGTH,
  MIN_LENGTH,
  MAX_REPEATED_CHARS,
} as const;

