import { useState, useEffect, useMemo } from 'react';
import { Tab, ListHeader, Text, Asset, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { CalendarView } from '../components/stats/CalendarView';
import { GraphView } from '../components/stats/GraphView';
import { StatsDetailView } from '../components/stats/StatsDetailView';
import type { DiaryEntry } from '../types/diary';
import { getMonthlyDiaries } from '../services/diary';

export default function Page() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based index

  // true면 완료 화면, false면 통계 화면을 보여줍니다.
  const [showComplete, setShowComplete] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0); // 0: 그래프, 1: 달력
  
  // 1월 ~ 12월 (0 ~ 11)
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 월별 데이터 캐싱 (monthIndex -> data)
  const [cachedData, setCachedData] = useState<Record<number, DiaryEntry[]>>({});
  
  // 선택된 날짜 (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // 월 변경 시 해당 월의 데이터를 백엔드에서 가져옴
  useEffect(() => {
    const fetchMonthData = async () => {
      // 이미 데이터가 있으면 다시 부르지 않음 (옵션) -> 하지만 최신 데이터 갱신을 위해 부르는게 나을 수 있음
      // 여기서는 매번 부르거나, 간단한 캐싱 적용
      // if (cachedData[currentMonth]) return;

      try {
        // currentMonth는 0-based이므로 +1 (1-12월)
        const data = await getMonthlyDiaries(currentMonth + 1);
        setCachedData(prev => ({
          ...prev,
          [currentMonth]: data
        }));

        // 데이터가 있으면 해당 월의 가장 최근 데이터 선택
        if (data && data.length > 0) {
          const recent = [...data].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          setSelectedDate(recent.date);
        } else {
          setSelectedDate(null);
        }
      } catch (error) {
        console.error('월별 데이터 조회 실패:', error);
        // 에러 시 빈 배열 처리 혹은 에러 UI
      }
    };
    
    fetchMonthData();
  }, [currentMonth]);

  // 선택된 날짜에 해당하는 일기 항목 찾기
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    const monthIndex = new Date(selectedDate).getMonth();
    // 해당 월의 데이터에서 찾기 (cachedData에 없을 수도 있으니 주의)
    const data = cachedData[monthIndex] || [];
    return data.find(d => d.date === selectedDate) || null;
  }, [selectedDate, cachedData]);

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
                data={cachedData[month] || []}
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
                data={cachedData[month] || []}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      
      <StatsDetailView entry={selectedEntry} selectedDate={selectedDate || ''} />
    </>
  );
}
