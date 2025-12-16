import { Text } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: adaptive.background,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px'
    }}>
      <Text typography="t4" fontWeight="bold">
        일기를 분석하고 있어요
      </Text>
      <Text typography="t6" color={adaptive.grey600}>
        잠시만 기다려주세요
      </Text>
    </div>
  );
};

