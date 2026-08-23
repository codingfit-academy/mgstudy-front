"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AuthNav from "../components/AuthNav";
import { isLoggedIn, getCurrentEmail, getHistory } from "../lib/localAuth";
import { useClientValue } from "../lib/useClientValue";

export default function HistoryPage() {
  const router = useRouter();
  const loggedIn = useClientValue(() => isLoggedIn(), false);
  const email = useClientValue(() => getCurrentEmail(), null);
  const history = useClientValue(() => getHistory(), []);

  useEffect(() => {
    if (!loggedIn) {
      router.replace("/login");
    }
  }, [loggedIn, router]);

  function askAgain(question: string) {
    sessionStorage.setItem("mgstudy:question", question);
    router.push("/analyze");
  }

  if (!loggedIn) return null;

  return (
    <div className={styles.page}>
      <AuthNav />
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>내 질문 기록</h1>
          <p className={styles.subtitle}>{email}님이 지금까지 물어본 질문이에요.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>아직 물어본 질문이 없어요.</p>
          <Link href="/" className={styles.homeLink}>
            질문하러 가기
          </Link>
        </div>
      ) : (
        <ul className={styles.historyList}>
          {history.map((item, i) => (
            <li key={i} className={styles.historyItem}>
              <div className={styles.historyInfo}>
                <p className={styles.historyQuestion}>{item.question}</p>
                <p className={styles.historyMeta}>
                  {item.age}살 ·{" "}
                  {new Date(item.date).toLocaleString("ko-KR")}
                </p>
              </div>
              <button
                className={styles.retryButton}
                onClick={() => askAgain(item.question)}
              >
                다시 풀기
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}
