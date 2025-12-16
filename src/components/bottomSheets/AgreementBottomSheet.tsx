import { useState } from "react";
import { TextButton, BottomSheet, AgreementV3 } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { loginWithToss } from "../../services/tossAuth";

interface AgreementBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onAgree?: (agreed: boolean) => void;
}

export const AgreementBottomSheet = ({
  open,
  onClose,
  onAgree,
}: AgreementBottomSheetProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAgreeClick = async () => {
    if (!isChecked || isLoading) {
      return;
    }

    setIsLoading(true);
    
    try {
      // 토스 로그인 플로우 실행
      await loginWithToss();
      
      console.log('로그인 및 약관 동의 완료');
      
      onAgree?.(true);
      onClose();
    } catch (error) {
      console.error('로그인 실패:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '로그인에 실패했어요. 다시 시도해주세요.';
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet style={{ backgroundColor: "#fff" }}
      header={
        <BottomSheet.Header>
          오늘 한줄 로그인을 위해 꼭 필요한 동의만 추렸어요
        </BottomSheet.Header>
      }
      open={open}
      onClose={onClose}
      cta={
        <div onClick={handleAgreeClick}>
          <BottomSheet.CTA
            bottomAccessory={
              <TextButton size="xsmall" variant="underline" onClick={onClose}>
                다음에
              </TextButton>
            }
            color="primary"
            variant="fill"
            disabled={!isChecked || isLoading}
            loading={isLoading}
          >
            {isLoading ? '로그인 중...' : '동의하고 시작하기'}
          </BottomSheet.CTA>
        </div>
      }
    >
      <div style={{ padding: "20px 24px" }}>
        <style>
          {`
            .agreement-checkbox-wrapper {
              border-radius: 12px;
              padding: 16px;
              margin: -16px;
              transition: background-color 0.2s ease;
              cursor: pointer;
            }
            .agreement-checkbox-wrapper:hover {
              background-color: ${adaptive.grey50};
            }
            .agreement-unchecked label {
              color: ${adaptive.grey600} !important;
            }
            .agreement-checked label {
              color: ${adaptive.grey900} !important;
            }
          `}
        </style>
        
        <div className="agreement-checkbox-wrapper">
          <div className={isChecked ? 'agreement-checked' : 'agreement-unchecked'}>
            <AgreementV3.SingleCheckboxField
              type={isChecked ? "medium-bold" : "medium"}
              indent={0}
              necessity="mandatory"
              checked={isChecked}
              onCheckedChange={setIsChecked}
            >
              개인정보 수집 및 이용 동의
            </AgreementV3.SingleCheckboxField>
          </div>
        </div>
        
        <AgreementV3.Description indent={1}>
          <TextButton
            size="xsmall"
            variant="underline"
            onClick={() => {
              // 개인정보 처리방침 페이지로 이동
              console.log("개인정보 처리방침 상세 보기");
            }}
          >
            상세 내용 보기
          </TextButton>
        </AgreementV3.Description>
      </div>
    </BottomSheet>
  );
};

