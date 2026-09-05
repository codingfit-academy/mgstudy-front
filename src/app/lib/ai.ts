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
