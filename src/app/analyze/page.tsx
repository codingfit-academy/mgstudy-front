"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { DEFAULT_QUESTION, FRAMEWORK_LIST } from "../solve/frameworks";
import { useClientValue } from "../lib/useClientValue";

const ANALYSIS_TEXT =
  "이 질문은 '공룡'에게 일어난 일의 까닭을 궁금해하고 있어. 아래 방법 중 하나를 골라서 질문을 더 멋지게 완성해보자!";

export default function AnalyzePage() {
  const router = useRouter();
  const question = useClientValue(
    () => sessionStorage.getItem("mgstudy:question") || DEFAULT_QUESTION,
    DEFAULT_QUESTION
  );

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

      <div className={styles.analysisCard}>
        <span className={styles.analysisLabel}>AI의 분석</span>
        <p className={styles.analysisText}>{ANALYSIS_TEXT}</p>
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
    </div>
  );
}
