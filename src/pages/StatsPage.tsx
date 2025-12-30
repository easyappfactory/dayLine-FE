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
  
  // 현재 날짜 기준
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  // Swiper에서 현재 보고 있는 슬라이드 인덱스 (0~4, 중앙이 현재 월)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(2);

  // 현재 월 기준 ±2개월 범위 생성 (총 5개월)
  const getMonthRange = (year: number, month: number) => {
    const result = [];
    for (let offset = -2; offset <= 2; offset++) {
      const totalMonths = year * 12 + month + offset;
      const targetYear = Math.floor(totalMonths / 12);
      const targetMonth = totalMonths % 12;
      result.push({ year: targetYear, month: targetMonth });
    }
    return result;
  };

  const monthRange = getMonthRange(todayYear, todayMonth);

  // 각 월별 데이터를 개별적으로 가져오기
  const { data: month0Data = [] } = useMonthlyDiaries(monthRange[0].year, monthRange[0].month);
  const { data: month1Data = [] } = useMonthlyDiaries(monthRange[1].year, monthRange[1].month);
  const { data: month2Data = [] } = useMonthlyDiaries(monthRange[2].year, monthRange[2].month);
  const { data: month3Data = [] } = useMonthlyDiaries(monthRange[3].year, monthRange[3].month);
  const { data: month4Data = [] } = useMonthlyDiaries(monthRange[4].year, monthRange[4].month);

  const monthDataArray = [month0Data, month1Data, month2Data, month3Data, month4Data];

  // 모든 월의 데이터를 합침 (선택된 날짜 찾기용)
  const allMonthlyData = monthDataArray.flat();

  // 선택된 날짜 (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 선택된 날짜의 일기 데이터 (백엔드에서 description 포함하여 가져옴)
  const selectedEntry: DiaryEntry | null = allMonthlyData.find(d => d.date === selectedDate) || null;

  // 데이터 로드 시 초기 선택 날짜 설정 (가장 최근 데이터)
  useEffect(() => {
    if (allMonthlyData.length > 0 && !selectedDate) {
      // 날짜 내림차순 정렬 후 첫 번째
      const sorted = [...allMonthlyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted.length > 0) {
        // eslint-disable-next-line
        setSelectedDate(sorted[0].date);
      }
    }
  }, [allMonthlyData, selectedDate]);

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
      {/* <div style={{ 
        height: '1px', 
        backgroundColor: '#e5e8eb', // adaptive.grey200과 유사한 명시적 색상 (안전장치)
        width: '100%',
        minHeight: '1px' // 최소 높이 보장
      }} /> */}

      <div>
        <ListHeader 
          title={
            <ListHeader.TitleParagraph
              color={adaptive.grey800}
              fontWeight="bold"
              typography="t5"
            >
              {monthRange[currentSlideIndex].year}.{monthRange[currentSlideIndex].month + 1}월 한 줄 
            </ListHeader.TitleParagraph>
          }
          descriptionPosition="bottom"
          style={{ padding: '36px 0 8px' }}
        />
      </div>

      {/* 탭에 따라 다른 Swiper 렌더링 */}
      {selectedTab === 0 ? (
        // 그래프 탭: 앞뒤 2개월씩 총 5개월 표시
        <Swiper
          key="graph-swiper"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={2}
          onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
          style={{ height: '300px' }}
        >
          {monthRange.map((monthInfo, index) => (
            <SwiperSlide key={`${monthInfo.year}-${monthInfo.month}`}>
              <GraphView 
                year={monthInfo.year} 
                month={monthInfo.month} 
                data={monthDataArray[index]}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // 달력 탭: 앞뒤 2개월씩 총 5개월 표시
        <Swiper
          key="calendar-swiper"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={2}
          onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
          style={{ height: '300px' }}
        >
          {monthRange.map((monthInfo, index) => (
            <SwiperSlide key={`${monthInfo.year}-${monthInfo.month}`}>
              <CalendarView 
                year={monthInfo.year} 
                month={monthInfo.month} 
                data={monthDataArray[index]}
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
