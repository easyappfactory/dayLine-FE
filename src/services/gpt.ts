/**
 * GPT API 서비스
 */

interface DiaryAnalysisResponse {
  line: string;
  score: number;
  description: string;
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
            content: `당신은 사용자의 하루 일기를 분석하여 감정 점수를 산출하는 AI입니다.
                      또한 점수를 매긴 이유를 설명하고, 사용자에게 따뜻한 조언, 위로, 또는 응원의 메시지를 전달해주세요. 최대 100자 이내로 작성해주세요.
                      
                      규칙:
                      점수는 0~100 사이의 양의 정수입니다.
                      5점 또는 10점 단위 점수를 사용하지 마십시오.
                      반올림, 구간화, 등급화를 절대 하지 마십시오.
                      점수는 연속적인 값처럼 분포해야 합니다.

                      절차:
                      1. 내부적으로 감정 상태를 0.0~1.0 사이의 실수로 계산합니다.
                      2. 해당 값을 0~100 범위의 정수로 변환합니다.
                      3. 자연스러운 정수를 선택하며 반올림 규칙은 사용하지 않습니다.
                      4. 사용자에게 전하는 조언, 위로, 또는 응원의 메시지는 한글로 작성해주세요.
                      `,
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
                description: {
                  type: 'string',
                  description: '점수에 대한 설명과 사용자에게 전하는 조언/위로/응원 메시지',
                },
              },
              required: ['score', 'description'],
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
    const result: { score: number; description: string } = JSON.parse(content);
    
    // line은 사용자가 입력한 원본 텍스트 사용
    return {
      line: text,
      score: result.score,
      description: result.description,
    };
  } catch (error) {
    console.error('GPT API 호출 실패:', error);
    throw error;
  }
}

