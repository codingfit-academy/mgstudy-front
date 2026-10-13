"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AuthNav from "../components/AuthNav";
import {
  updateProfile,
  getHistory,
  AVATAR_OPTIONS,
  type Account,
  type HistoryEntry,
} from "../lib/auth";
import { useRequireAuth } from "../lib/AuthContext";

export default function MyPage() {
  const router = useRouter();
  const { loading, loggedIn, account, setAccount } = useRequireAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!loggedIn) return;
    getHistory().then(setHistory);
  }, [loggedIn]);

  function askAgain(question: string) {
    sessionStorage.setItem("mgstudy:question", question);
    router.push("/analyze");
  }

  if (loading || !loggedIn || !account) return null;

  return (
    <div className={styles.page}>
      <AuthNav />

      <h1 className={styles.title}>마이페이지</h1>

      <ProfileForm
        initialNickname={account.nickname}
        initialAvatar={account.avatar}
        initialAge={account.age}
        onSaved={setAccount}
      />

      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>내가 물어본 질문</h2>
        {history.length === 0 ? (
          <p className={styles.emptyText}>
            아직 물어본 질문이 없어요.{" "}
            <Link href="/" className={styles.inlineLink}>
              질문하러 가기
            </Link>
          </p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((item, i) => (
              <li key={i} className={styles.historyItem}>
                <div className={styles.historyInfo}>
                  <p className={styles.historyQuestion}>{item.question}</p>
                  <p className={styles.historyMeta}>
                    {item.age !== null && `${item.age}살 · `}
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
      </div>

      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}

function ProfileForm({
  initialNickname,
  initialAvatar,
  initialAge,
  onSaved,
}: {
  initialNickname: string;
  initialAvatar: string;
  initialAge: number | null;
  onSaved: (account: Account) => void;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [age, setAge] = useState(initialAge === null ? "" : String(initialAge));
  const [ageError, setAgeError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  async function handleSave() {
    const ageNum = age.trim() === "" ? undefined : Number(age);
    if (ageNum !== undefined && !(Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 19)) {
      setAgeError(true);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        nickname: nickname.trim() || "이름 없음",
        avatar,
        age: ageNum,
      });
      onSaved(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.profileCard}>
      <div className={styles.avatarDisplay}>{avatar}</div>

      <label className={styles.label} htmlFor="nickname">
        닉네임
      </label>
      <input
        id="nickname"
        className={styles.input}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임을 입력해줘"
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
        value={age}
        onChange={(e) => {
          setAge(e.target.value);
          setAgeError(false);
        }}
        placeholder="예: 10"
      />
      <p className={ageError ? styles.ageError : styles.ageHint}>
        {ageError
          ? "나이는 1살부터 19살까지 숫자로 입력해줘."
          : "AI가 나이에 맞는 쉬운 낱말로 설명하는 데만 써요."}
      </p>

      <label className={styles.label}>아바타 고르기</label>
      <div className={styles.avatarGrid}>
        {AVATAR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.avatarOption} ${
              option === avatar ? styles.avatarOptionSelected : ""
            }`}
            onClick={() => setAvatar(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
        {saving ? "저장하는 중..." : "저장하기"}
      </button>
      {savedMessage && <p className={styles.savedMessage}>저장했어요!</p>}
    </div>
  );
}
