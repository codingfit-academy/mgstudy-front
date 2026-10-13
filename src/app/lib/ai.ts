import { config } from "@/config";

export type CheckQuestionResult = {
  isQuestion: boolean;
  message: string;
};

/** 백엔드(mgstudy-api)의 POST /ai/check-question 호출: 입력이 진짜 질문인지 AI로 확인 */
export async function checkQuestion(
  question: string,
  age?: number
): Promise<CheckQuestionResult> {
  const res = await fetch(`${config.apiUrl}/ai/check-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, age }),
  });
  if (!res.ok) throw new Error(`질문 확인 요청 실패: ${res.status}`);
  const data = await res.json();
  return { isQuestion: data.is_question, message: data.message };
}

/** 백엔드의 POST /ai/compose-question 호출: 답변 조각들을 완성된 질문 한 문장으로 종합 */
export async function composeQuestion(params: {
  originalQuestion: string;
  frameworkLabel: string;
  answers: string[];
  age?: number;
}): Promise<string> {
  const res = await fetch(`${config.apiUrl}/ai/compose-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      original_question: params.originalQuestion,
      framework_label: params.frameworkLabel,
      answers: params.answers,
      age: params.age,
    }),
  });
  if (!res.ok) throw new Error(`질문 종합 요청 실패: ${res.status}`);
  const data = await res.json();
  return data.question as string;
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

/** 백엔드의 POST /ai/generate-quiz 호출: 아이의 실제 질문 주제에 맞는 3단계
 * 퀴즈(육하원칙/원인과 결과)와 최종 설명을 생성 */
export async function generateQuiz(params: {
  question: string;
  framework: string;
  age?: number;
}): Promise<{ quizzes: Quiz[]; answer: string }> {
  const res = await fetch(`${config.apiUrl}/ai/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: params.question,
      framework: params.framework,
      age: params.age,
    }),
  });
  if (!res.ok) throw new Error(`퀴즈 생성 요청 실패: ${res.status}`);
  const data: { quizzes: RawQuizStep[]; answer: string } = await res.json();
  const quizzes: Quiz[] = data.quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    desc: q.desc,
    options: q.options,
    correctId: q.correct_id,
    wrongMsg: q.wrong_msg,
    correctMsg: q.correct_msg,
  }));
  return { quizzes, answer: data.answer };
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
