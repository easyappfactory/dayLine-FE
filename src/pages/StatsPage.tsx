import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tab, ListHeader, Text, Asset, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { CalendarView } from '../components/stats/CalendarView';
import { GraphView } from '../components/stats/GraphView';
import { StatsDetailView } from '../components/stats/StatsDetailView';
import type { DiaryEntry } from '../types/diary';
import { useMonthlyDiaries } from '../hooks/domain/diary/useDiaryData';

export default function Page() {
  const location = useLocation();
  // state로 넘어온 skipComplete가 true이면 완료 화면을 건너뜀
  const skipComplete = location.state?.skipComplete || false;

  // true면 완료 화면, false면 통계 화면을 보여줍니다.
  const [showComplete, setShowComplete] = useState(!skipComplete);
  const [selectedTab, setSelectedTab] = useState(0); // 0: 그래프, 1: 달력
  
  // 현재 보여줄 년월
  const today = new Date();
  const currentYear = today.getFullYear();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based index

  // 1월 ~ 12월 (0 ~ 11)
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 백엔드 API로 받아온 월별 데이터 (React Query)
  const { data: monthlyData = [] } = useMonthlyDiaries(currentYear, currentMonth);

  // 선택된 날짜 (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 선택된 날짜의 일기 데이터
  const selectedEntry: DiaryEntry | null = monthlyData.find(d => d.date === selectedDate) || null;

  // 데이터 로드 시 초기 선택 날짜 설정 (가장 최근 데이터)
  useEffect(() => {
    if (monthlyData.length > 0 && !selectedDate) {
      // 날짜 내림차순 정렬 후 첫 번째
      const sorted = [...monthlyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted.length > 0) {
        // eslint-disable-next-line
        setSelectedDate(sorted[0].date);
      }
    }
  }, [monthlyData, selectedDate]);

  // 날짜 선택 핸들러
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
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
    <div>
      <div style={{ flexShrink: 0 }}>
        <Tab
          fluid={false}
          size="large"
          onChange={(index) => setSelectedTab(index)}
        >
          <Tab.Item selected={selectedTab === 0}>
            그래프
          </Tab.Item>
          <Tab.Item selected={selectedTab === 1}>
            달력
          </Tab.Item>
        </Tab>
      </div>

      {/* 탭 하단 구분선 - 스타일 명확화 */}
      <div style={{ 
        height: '1px', 
        backgroundColor: '#e5e8eb', // adaptive.grey200과 유사한 명시적 색상 (안전장치)
        width: '100%',
        minHeight: '1px' // 최소 높이 보장
      }} />

      <div>
        <ListHeader 
          title={
            <ListHeader.TitleParagraph
              color={adaptive.grey800}
              fontWeight="bold"
              typography="t5"
            >
              {currentYear}.{currentMonth + 1}월 한 줄 
            </ListHeader.TitleParagraph>
          }
          descriptionPosition="bottom"
          style={{ padding: '36px 0 8px' }}
        />
      </div>

      {/* 탭에 따라 다른 Swiper 렌더링 */}
      {selectedTab === 0 ? (
        // 그래프 탭: 좌우 스크롤
        <Swiper
          key="graph-swiper"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={currentMonth}
          onSlideChange={(swiper) => setCurrentMonth(swiper.activeIndex)}
          style={{ height: '350px' }} // 달력 탭과 동일한 높이 지정
        >
          {months.map((month) => (
            <SwiperSlide key={month}>
              <GraphView 
                year={currentYear} 
                month={month} 
                data={month === currentMonth ? monthlyData : []} // 현재 월 데이터만 전달
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
          style={{ height: '350px' }} // 세로 스크롤을 위해 높이 지정 필요
        >
          {months.map((month) => (
            <SwiperSlide key={month}>
              <CalendarView 
                year={currentYear} 
                month={month} 
                data={month === currentMonth ? monthlyData : []} // 현재 월 데이터만 전달
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      
      <StatsDetailView entry={selectedEntry} selectedDate={selectedDate} />
    </div>
  );
}
