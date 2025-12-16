import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithToss } from '../../../services/tossAuth';

export const useLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 토스 로그인 플로우 실행
      await loginWithToss();
      
      console.log('로그인 성공');
      // WritePage로 이동
      navigate('/write');
    } catch (error) {
      console.error('로그인 실패:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '로그인에 실패했습니다. 다시 시도해주세요.';
      
      alert(errorMessage);
      
      // [디버깅] 상세 에러 정보
      // if (error instanceof Error) {
      //   alert(`[에러]\n${error.message}\n\n[Stack]\n${error.stack?.slice(0, 200) || 'No stack'}`);
      // } else if (typeof error === 'object' && error !== null) {
      //   alert(`[에러 객체]\n${JSON.stringify(error, null, 2)}`);
      // } else {
      //   alert(`[알 수 없는 에러]\n${String(error)}`);
      // }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};


