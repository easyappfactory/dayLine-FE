import { Asset, Button, Top } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgreementBottomSheet } from '../components/bottomSheets';

export default function Page() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleAgree = (agreed: boolean) => {
    if (agreed) {
      // WritePage로 이동
      navigate('/write');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Top
        style={{ textAlign: 'left' }}
        // upperGap={32}
        title={
          <Top.TitleParagraph size={28} color={adaptive.grey900} aria-label="로그인 페이지 제목">
            오늘 한 줄에서 토스로 로그인할까요?
          </Top.TitleParagraph>
        }
        upper={
          <Top.UpperAssetContent
            content={
              <Asset.Lottie
                frameShape={Asset.frameShape.CleanW60}
                src="https://static.toss.im/lotties-common/agree-spot.json"
                loop={false}
                aria-hidden={true}
              />
            }
          />
        }
      />
      <Button display="block" onClick={() => setIsBottomSheetOpen(true)}>
        다음
      </Button>

      <AgreementBottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onAgree={handleAgree}
      />
    </div>
  );
}