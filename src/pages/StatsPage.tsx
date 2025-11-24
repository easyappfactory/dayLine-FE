import { useState } from 'react';
import { Tab, ListHeader, Text, Asset, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { CalendarView } from '../components/stats/CalendarView';
import { GraphView } from '../components/stats/GraphView';
import { StatsDetailView } from '../components/stats/StatsDetailView';
import type { DiaryEntry } from '../types/diary';
import { useDiaryData } from '../hooks/useDiaryData';

export default function Page() {
  const { getAllData, getRecentEntry, getEntryByDate } = useDiaryData();
  const allData = getAllData();

  // true면 완료 화면, false면 통계 화면을 보여줍니다.
  const [showComplete, setShowComplete] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0); // 0: 그래프, 1: 달력
  
  // 현재 보여줄 년월 (초기값 2025년 11월, index 10)
  const currentYear = 2025;
  const [currentMonth, setCurrentMonth] = useState(10); // 0-based index (11월)

  // 2025년 1월 ~ 12월 (0 ~ 11)
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 선택된 날짜 (YYYY-MM-DD)
  // 초기값으로 가장 최근 데이터 설정
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const recentEntry = getRecentEntry(2025, 10);
    return recentEntry ? recentEntry.date : '';
  });
  
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(() => {
    return getEntryByDate(selectedDate);
  });

  // 날짜 선택 핸들러
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const entry = getEntryByDate(date);
    setSelectedEntry(entry);
  };

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
          onClick={() => setShowComplete(false)}
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
            {currentYear}.{currentMonth + 1} 한 줄 
          </ListHeader.TitleParagraph>
        }
        descriptionPosition="bottom"
      />

      {/* 탭에 따라 다른 Swiper 렌더링 */}
      {selectedTab === 0 ? (
        // 그래프 탭: 좌우 스크롤
        <Swiper
          key="graph-swiper"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={currentMonth}
          onSlideChange={(swiper) => setCurrentMonth(swiper.activeIndex)}
        >
          {months.map((month) => (
            <SwiperSlide key={month}>
              <GraphView 
                year={currentYear} 
                month={month} 
                data={allData} 
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // 달력 탭: 상하 스크롤
        <Swiper
          key="calendar-swiper"
          direction="vertical"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={currentMonth}
          onSlideChange={(swiper) => setCurrentMonth(swiper.activeIndex)}
          style={{ height: '400px' }} // 세로 스크롤을 위해 높이 지정 필요
        >
          {months.map((month) => (
            <SwiperSlide key={month}>
              <CalendarView 
                year={currentYear} 
                month={month} 
                data={allData} 
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      
      <StatsDetailView entry={selectedEntry} selectedDate={selectedDate} />
    </>
  );
}
