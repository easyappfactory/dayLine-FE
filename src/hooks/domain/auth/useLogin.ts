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
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};

