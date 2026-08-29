"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { DEFAULT_QUESTION, FRAMEWORK_LIST } from "../solve/frameworks";
import { useClientValue } from "../lib/useClientValue";
import { checkQuestion } from "../lib/ai";

const CHECK_FAILED_TEXT =
  "지금은 AI에게 확인을 받을 수 없어서 그냥 진행할게. 아래 방법 중 하나를 골라서 질문을 더 멋지게 완성해보자!";

export default function AnalyzePage() {
  const router = useRouter();
  const storedQuestion = useClientValue(
    () => sessionStorage.getItem("mgstudy:question") || DEFAULT_QUESTION,
    DEFAULT_QUESTION
  );
  const [overrideQuestion, setOverrideQuestion] = useState<string | null>(null);
  const question = overrideQuestion ?? storedQuestion;

  const [result, setResult] = useState<{
    question: string;
    isQuestion: boolean;
    message: string;
  } | null>(null);
  const [rewriteText, setRewriteText] = useState("");

  const checking = result === null || result.question !== question;
  const isQuestion = result?.isQuestion ?? true;
  const aiMessage = result?.message ?? "";

  useEffect(() => {
    let cancelled = false;
    checkQuestion(question)
      .then((r) => {
        if (cancelled) return;
        setResult({ question, isQuestion: r.isQuestion, message: r.message });
      })
      .catch(() => {
        if (cancelled) return;
        setResult({ question, isQuestion: true, message: CHECK_FAILED_TEXT });
      });
    return () => {
      cancelled = true;
    };
  }, [question]);

  function submitRewrite() {
    const next = rewriteText.trim();
    if (!next) return;
    sessionStorage.setItem("mgstudy:question", next);
    setOverrideQuestion(next);
    setRewriteText("");
  }

  function chooseFramework(id: string) {
    sessionStorage.setItem("mgstudy:framework", id);
    router.push("/solve");
  }

  return (
    <div className={styles.page}>
      <div className={styles.sparkle} aria-hidden="true" />

      <div className={styles.questionCard}>
        <span className={styles.questionLabel}>네가 물어본 질문</span>
        <p className={styles.questionText}>{question}</p>
      </div>

      {checking && (
        <div className={styles.analysisCard}>
          <span className={styles.analysisLabel}>AI의 분석</span>
          <p className={styles.analysisText}>질문을 살펴보고 있어요...</p>
        </div>
      )}

      {!checking && !isQuestion && (
        <div className={styles.warnCard}>
          <span className={styles.warnLabel}>AI의 분석</span>
          <p className={styles.warnText}>{aiMessage}</p>

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

      {!checking && isQuestion && (
        <>
          <div className={styles.analysisCard}>
            <span className={styles.analysisLabel}>AI의 분석</span>
            <p className={styles.analysisText}>{aiMessage}</p>
          </div>

          <p className={styles.pickLabel}>어떤 방식으로 질문을 완성해볼까?</p>

          <div className={styles.frameworkGrid}>
            {FRAMEWORK_LIST.map((f) => (
              <button
                key={f.id}
                className={styles.frameworkCard}
                onClick={() => chooseFramework(f.id)}
              >
                <span className={styles.frameworkTitle}>{f.label}</span>
                <span className={styles.frameworkDesc}>{f.shortDesc}</span>
                <span className={styles.frameworkArrow}>이 방식으로 시작하기 →</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
