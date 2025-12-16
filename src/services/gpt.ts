/**
 * GPT API 서비스
 */

interface DiaryAnalysisResponse {
  line: string;
  score: number;
}

interface GPTChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 일기 텍스트를 GPT로 분석하여 점수를 받아옵니다
 */
export async function analyzeDiaryText(text: string): Promise<DiaryAnalysisResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
    alert('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 사용자의 하루 일기를 분석하여 감정 점수를 매기는 AI입니다. 0-100점 사이의 점수로 평가하며, 긍정적일수록 높은 점수를 부여합니다.',
          },
          {
            role: 'user',
            content: text,
          },
        ] as GPTChatMessage[],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'diary_score',
            schema: {
              type: 'object',
              properties: {
                score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: '감정 점수 (0-100)',
                },
              },
              required: ['score'],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GPT API 오류: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // GPT 응답에서 content 추출
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('GPT 응답에서 내용을 찾을 수 없습니다.');
    }

    // JSON 파싱
    const result: { score: number } = JSON.parse(content);
    
    // GPT 응답에는 score만 있으므로, line은 사용자가 입력한 원본 텍스트 사용
    return {
      line: text,
      score: result.score,
    };
  } catch (error) {
    console.error('GPT API 호출 실패:', error);
    throw error;
  }
}

