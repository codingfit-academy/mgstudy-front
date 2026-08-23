"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { FRAMEWORKS } from "../solve/frameworks";
import Fireworks from "../components/Fireworks";
import { useClientValue } from "../lib/useClientValue";

export default function ResultPage() {
  const finalQuestion = useClientValue(
    () => sessionStorage.getItem("mgstudy:finalQuestion") || "",
    ""
  );
  const answer = useClientValue(() => {
    const storedFramework = sessionStorage.getItem("mgstudy:framework");
    const framework = storedFramework ? FRAMEWORKS[storedFramework] : undefined;
    return framework?.answer ?? "";
  }, "");

  return (
    <div className={styles.page}>
      <Fireworks trigger={1} />
      <div className={styles.questionCard}>
        <span className={styles.questionLabel}>완성한 질문</span>
        <p className={styles.questionText}>{finalQuestion}</p>
      </div>

      <div className={styles.answerCard}>
        <span className={styles.answerLabel}>답</span>
        <p className={styles.answerText}>{answer}</p>
      </div>

      <Link href="/" className={styles.homeLink}>
        다른 질문 만들러 가기
      </Link>
    </div>
  );
}
