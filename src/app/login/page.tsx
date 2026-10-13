"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { login } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const account = await login(email.trim(), password);
      setAccount(account);
      router.push("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했어요.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.sparkle} aria-hidden="true" />
      <h1 className={styles.title}>로그인</h1>
      <p className={styles.subtitle}>
        로그인하면 그동안 물어본 질문 기록을 볼 수 있어요.
      </p>

      <form className={styles.card} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          placeholder="example@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className={styles.switchText}>
        계정이 없으신가요?{" "}
        <Link href="/signup" className={styles.switchLink}>
          회원가입
        </Link>
      </p>
      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}
