"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AuthNav from "../components/AuthNav";
import {
  isLoggedIn,
  getAccount,
  updateProfile,
  getHistory,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR,
} from "../lib/localAuth";
import { useClientValue } from "../lib/useClientValue";

export default function MyPage() {
  const router = useRouter();
  const loggedIn = useClientValue(() => isLoggedIn(), false);
  const account = useClientValue(
    () => ({
      nickname: getAccount()?.nickname ?? "",
      avatar: getAccount()?.avatar ?? DEFAULT_AVATAR,
    }),
    { nickname: "", avatar: DEFAULT_AVATAR }
  );
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

      <h1 className={styles.title}>마이페이지</h1>

      {/* Keyed on the loaded account so the form re-mounts (and its internal
          state re-initializes) once the real saved nickname/avatar are known,
          instead of being stuck with the values seen on the very first render. */}
      <ProfileForm
        key={`${account.nickname}:${account.avatar}`}
        initialNickname={account.nickname}
        initialAvatar={account.avatar}
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
}: {
  initialNickname: string;
  initialAvatar: string;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [savedMessage, setSavedMessage] = useState(false);

  function handleSave() {
    updateProfile({ nickname: nickname.trim() || "이름 없음", avatar });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 1500);
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

      <button className={styles.saveButton} onClick={handleSave}>
        저장하기
      </button>
      {savedMessage && <p className={styles.savedMessage}>저장했어요!</p>}
    </div>
  );
}
