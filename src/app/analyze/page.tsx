"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useClientValue } from "../lib/useClientValue";
import { analyzeQuestion, type AnalyzeQuestionResult, type Quiz } from "../lib/ai";

// Reuse the last successful analysis for the same question+age within this tab,
// so refreshing /analyze or coming back from /solve doesn't pay for a new AI call.
const ANALYSIS_CACHE_KEY = "mgstudy:analysis";

function readCachedAnalysis(
  question: string,
  age: number | undefined
): AnalyzeQuestionResult | null {
  try {
    const raw = sessionStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.question !== question || cached.age !== (age ?? null)) return null;
    return cached.result as AnalyzeQuestionResult;
  } catch {
    return null;
  }
}

function writeCachedAnalysis(
  question: string,
  age: number | undefined,
  result: AnalyzeQuestionResult
) {
  sessionStorage.setItem(
    ANALYSIS_CACHE_KEY,
    JSON.stringify({ question, age: age ?? null, result })
  );
}

const ANALYZE_FAILED_TEXT =
  "지금은 AI에게 질문을 보낼 수 없어요. 잠시 후 다시 시도해줘.";

type AnalyzeState =
  | {
      key: string;
      status: "done";
      isQuestion: boolean;
      message: string;
      quizzes: Quiz[];
      answer: string;
    }
  | { key: string; status: "failed" };

export default function AnalyzePage() {
  const router = useRouter();
  // null = not read yet (SSR/hydration render), "" = genuinely no question.
  // Effects from the hydration render still see the fallback, so the redirect
  // below must not treat "not read yet" as "missing".
  const storedQuestion = useClientValue<string | null>(
    () => sessionStorage.getItem("mgstudy:question") ?? "",
    null
  );
  const age = useClientValue(() => {
    const raw = Number(sessionStorage.getItem("mgstudy:age"));
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  }, undefined);
  const [overrideQuestion, setOverrideQuestion] = useState<string | null>(null);
  const question = overrideQuestion ?? storedQuestion;

  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${question}#${retryCount}`;
  const [result, setResult] = useState<AnalyzeState | null>(null);
  const [rewriteText, setRewriteText] = useState("");

  const analyzing = result === null || result.key !== requestKey;

  useEffect(() => {
    if (question === null) return;
    if (question === "") {
      router.replace("/");
      return;
    }
    let cancelled = false;
    const key = `${question}#${retryCount}`;
    const cached = readCachedAnalysis(question, age);
    const request = cached
      ? Promise.resolve(cached)
      : analyzeQuestion(question, age).then((r) => {
          if (!r.isQuestion || r.quizzes.length > 0) {
            writeCachedAnalysis(question, age, r);
          }
          return r;
        });
    request
      .then((r) => {
        if (cancelled) return;
        if (r.isQuestion && r.quizzes.length === 0) {
          setResult({ key, status: "failed" });
          return;
        }
        setResult({ key, status: "done", ...r });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, status: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [question, age, retryCount, router]);

  function submitRewrite() {
    const next = rewriteText.trim();
    if (!next) return;
    sessionStorage.setItem("mgstudy:question", next);
    setOverrideQuestion(next);
    setRewriteText("");
  }

  function startQuiz(quizzes: Quiz[], answer: string) {
    sessionStorage.setItem("mgstudy:quizData", JSON.stringify({ quizzes, answer }));
    router.push("/solve");
  }

  if (!question) return null;

  return (
    <div className={styles.page}>
      <div className={styles.sparkle} aria-hidden="true" />

      <div className={styles.questionCard}>
        <span className={styles.questionLabel}>네가 물어본 질문</span>
        <p className={styles.questionText}>{question}</p>
      </div>

      {analyzing && (
        <div className={styles.analysisCard}>
          <span className={styles.analysisLabel}>AI의 분석</span>
          <p className={styles.analysisText}>
            질문을 살펴보고, 더 구체적으로 만들 부분을 찾고 있어요...
          </p>
        </div>
      )}

      {!analyzing && result?.status === "failed" && (
        <div className={styles.warnCard}>
          <span className={styles.warnLabel}>AI의 분석</span>
          <p className={styles.warnText}>{ANALYZE_FAILED_TEXT}</p>
          <button
            className={styles.rewriteButton}
            onClick={() => setRetryCount((n) => n + 1)}
          >
            다시 시도
          </button>
        </div>
      )}

      {!analyzing && result?.status === "done" && !result.isQuestion && (
        <div className={styles.warnCard}>
          <span className={styles.warnLabel}>AI의 분석</span>
          <p className={styles.warnText}>{result.message}</p>

          <p className={styles.rewritePrompt}>질문을 다시 적어볼까?</p>
          <textarea
            className={styles.rewriteInput}
            rows={3}
            placeholder="궁금한 걸 짧게 물어봐 (예: 공룡은 왜 사라졌어?)"
            value={rewriteText}
            onChange={(e) => setRewriteText(e.target.value)}
          />
          <button
            className={styles.rewriteButton}
            onClick={submitRewrite}
            disabled={rewriteText.trim() === ""}
          >
            다시 확인하기
          </button>
        </div>
      )}

      {!analyzing && result?.status === "done" && result.isQuestion && (
        <>
          <div className={styles.analysisCard}>
            <span className={styles.analysisLabel}>AI의 분석</span>
            <p className={styles.analysisText}>{result.message}</p>
          </div>

          <div className={styles.focusCard}>
            <p className={styles.pickLabel}>
              이 질문을 더 구체적으로 만들려면, 이 세 가지를 채워보자!
            </p>
            <ol className={styles.focusList}>
              {result.quizzes.map((q) => (
                <li key={q.id} className={styles.focusItem}>
                  {q.title}
                </li>
              ))}
            </ol>
            <button
              className={styles.startButton}
              onClick={() => startQuiz(result.quizzes, result.answer)}
            >
              퀴즈 시작하기 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
