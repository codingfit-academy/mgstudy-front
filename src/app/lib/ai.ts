import { config } from "@/config";

export type QuizOption = { id: string; label: string; value: string };

export type Quiz = {
  id: string;
  title: string;
  desc: string;
  options: QuizOption[];
  correctId: string;
  wrongMsg: string;
  correctMsg: string;
};

type RawQuizStep = {
  id: string;
  title: string;
  desc: string;
  options: QuizOption[];
  correct_id: string;
  wrong_msg: string;
  correct_msg: string;
};

export type AnalyzeQuestionResult = {
  isQuestion: boolean;
  message: string;
  quizzes: Quiz[];
  answer: string;
};

/** 백엔드(mgstudy-api)의 POST /ai/analyze-question 호출: 질문인지 확인하고,
 * 질문이면 그 질문에서 막연한 부분 세 곳을 구체화하는 퀴즈와 설명을 한 번에 받음 */
export async function analyzeQuestion(
  question: string,
  age?: number
): Promise<AnalyzeQuestionResult> {
  const res = await fetch(`${config.apiUrl}/ai/analyze-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, age }),
  });
  if (!res.ok) throw new Error(`질문 분석 요청 실패: ${res.status}`);
  const data: {
    is_question: boolean;
    message: string;
    quizzes: RawQuizStep[];
    answer: string;
  } = await res.json();
  return {
    isQuestion: data.is_question,
    message: data.message,
    quizzes: data.quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      desc: q.desc,
      options: q.options,
      correctId: q.correct_id,
      wrongMsg: q.wrong_msg,
      correctMsg: q.correct_msg,
    })),
    answer: data.answer,
  };
}

/** 백엔드의 POST /ai/suggest-advanced-question 호출: 원래 질문보다 한 단계
 * 더 깊은 심화 질문을 추천 */
export async function suggestAdvancedQuestion(
  question: string,
  age?: number
): Promise<string> {
  const res = await fetch(`${config.apiUrl}/ai/suggest-advanced-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, age }),
  });
  if (!res.ok) throw new Error(`심화 질문 요청 실패: ${res.status}`);
  const data = await res.json();
  return data.question as string;
}

export type CheckCompositionResult = {
  isCorrect: boolean;
  message: string;
};

/** 백엔드의 POST /ai/check-composition 호출: 아이가 답 조각들을 직접 이어 쓴
 * 글(1~2문장)의 지칭 일관성/문법/맞춤법을 확인 */
export async function checkComposition(params: {
  pieces: string[];
  attempt: string;
  age?: number;
}): Promise<CheckCompositionResult> {
  const res = await fetch(`${config.apiUrl}/ai/check-composition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pieces: params.pieces,
      attempt: params.attempt,
      age: params.age,
    }),
  });
  if (!res.ok) throw new Error(`문장 확인 요청 실패: ${res.status}`);
  const data = await res.json();
  return { isCorrect: data.is_correct, message: data.message };
}
