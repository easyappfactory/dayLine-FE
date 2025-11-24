import { useState } from 'react';
import { Tab, ListHeader, Text, Paragraph, Asset, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';

export default function Page() {
  // true면 완료 화면, false면 통계 화면을 보여줍니다.
  const [showComplete, setShowComplete] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  // 1. 완료 화면 렌더링 (showComplete가 true일 때)
  if (showComplete) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '24px',
        gap: '16px'
      }}>
        <Asset.Image
          frameShape={{ width: 100 }}
          src="https://static.toss.im/lotties/check-spot-apng.png"
          aria-hidden={true}
        />
        <Text
          display="block"
          color={adaptive.grey800}
          typography="t2"
          fontWeight="bold"
          textAlign="center"
        >
          오늘 한 줄 기록을 완료했어요
        </Text>
        <Text
          display="block"
          color={adaptive.grey700}
          typography="t5"
          fontWeight="regular"
          textAlign="center"
        >
          한 줄 일기와 감정 변화 그래프를 확인할 수 있어요
        </Text>
        <Button 
          display="block" 
          style={{ marginTop: '16px' }} 
          onClick={() => setShowComplete(false)} // 버튼 클릭 시 통계 화면으로 전환
        >
          이동하기
        </Button>
      </div>
    );
  }

  // 2. 통계 화면 렌더링 (showComplete가 false일 때)
  return (
    <>
      <Tab
        fluid={false}
        size="large"
        style={{ backgroundColor: adaptive.background }}
        onChange={(index) => setSelectedTab(index)}
      >
        <Tab.Item key="0-그래프" selected={selectedTab === 0}>
          그래프
        </Tab.Item>
        <Tab.Item key="1-달력" selected={selectedTab === 1}>
          달력
        </Tab.Item>
      </Tab>
      <ListHeader
        title={
          <ListHeader.TitleParagraph
            color={adaptive.grey800}
            fontWeight="bold"
            typography="t5"
          >
            2025.11.12 한 줄 
          </ListHeader.TitleParagraph>
        }
        descriptionPosition="bottom"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Paragraph typography="t5">
          <Paragraph.Badge color="blue" variant="fill">
            83
          </Paragraph.Badge>
        </Paragraph>
      </div>
      <Text
        display="block"
        color={adaptive.grey700}
        typography="t5"
        fontWeight="regular"
      >
       한 줄 일기 어쩌고 저쩌고
      </Text>
    </>
  );
}
