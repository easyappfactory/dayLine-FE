import { BottomSheet, Button, Asset } from "@toss/tds-mobile";

interface AdPromotionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export const AdPromotionBottomSheet = ({
  open,
  onClose,
  onNavigate,
}: AdPromotionBottomSheetProps) => {
  return (
    <BottomSheet
      header={
        <BottomSheet.Header>
          광고를 보면 기록을 저장하고 그래프를 확인할 수 있어요
        </BottomSheet.Header>
      }
      open={open}
      onClose={onClose}
      cta={
        <BottomSheet.DoubleCTA
          leftButton={
            <Button color="dark" variant="weak" onClick={onClose}>
              닫기
            </Button>
          }
          rightButton={<Button onClick={onNavigate}>이동하기</Button>}
        />
      }
    >
      <div style={{ height: `16px` }} />
      <div
        style={{
          display: `flex`,
          justifyContent: `center`,
          alignItems: `center`,
        }}
      >
        <Asset.Image
          frameShape={{ width: 250 }}
          src="https://static.toss.im/ml-product/tosst-inapp_h7gz099ss0c8g8d32ydsfd81.png"
          aria-hidden={true}
        />
      </div>
    </BottomSheet>
  );
};




