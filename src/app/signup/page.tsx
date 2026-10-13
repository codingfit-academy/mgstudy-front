"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { signup } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { setAccount } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [age, setAge] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("이름, 이메일, 비밀번호를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 서로 달라요. 다시 확인해주세요.");
      return;
    }
    const ageNum = age.trim() === "" ? undefined : Number(age);
    if (ageNum !== undefined && !(Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 19)) {
      setError("나이는 1살부터 19살까지 숫자로 입력해주세요.");
      return;
    }
    if (!agreed) {
      setError("개인정보 처리 안내를 읽고 동의해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const account = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        age: ageNum,
      });
      setAccount(account);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했어요.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.sparkle} aria-hidden="true" />
      <h1 className={styles.title}>회원가입</h1>
      <p className={styles.subtitle}>
        가입하면 물어본 질문들을 모아서 볼 수 있어요.
      </p>

      <form className={styles.card} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="name">
          이름
        </label>
        <input
          id="name"
          type="text"
          className={styles.input}
          placeholder="이름 또는 별명"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />

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

        <label className={styles.label} htmlFor="passwordConfirm">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          type="password"
          className={styles.input}
          placeholder="비밀번호 다시 입력"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            setError("");
          }}
        />

        <label className={styles.label} htmlFor="age">
          나이 (선택)
        </label>
        <input
          id="age"
          type="number"
          min={1}
          max={19}
          inputMode="numeric"
          className={styles.input}
          placeholder="예: 10"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setError("");
          }}
        />
        <p className={styles.hint}>
          AI가 나이에 맞는 쉬운 낱말로 설명하는 데만 써요. 비워두면 초등학생
          수준으로 맞춰요.
        </p>

        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setError("");
            }}
          />
          <span>
            <Link href="/privacy" target="_blank" className={styles.consentLink}>
              개인정보 처리 안내
            </Link>
            를 읽고 동의해요. (만 14세 미만이면 보호자와 함께 읽고 보호자가
            동의해 주세요.)
          </span>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? "가입하는 중..." : "회원가입"}
        </button>
      </form>

      <p className={styles.switchText}>
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className={styles.switchLink}>
          로그인
        </Link>
      </p>
      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}
