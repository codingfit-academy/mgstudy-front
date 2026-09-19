"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./AuthNav.module.css";
import {
  isLoggedIn,
  getCurrentEmail,
  getAccount,
  logout,
  DEFAULT_AVATAR,
} from "../lib/localAuth";
import { useClientValue } from "../lib/useClientValue";

export default function AuthNav() {
  const router = useRouter();
  const loggedIn = useClientValue(() => isLoggedIn(), false);
  const email = useClientValue(() => getCurrentEmail(), null);
  const nickname = useClientValue(() => getAccount()?.nickname ?? null, null);
  const avatar = useClientValue(
    () => getAccount()?.avatar ?? DEFAULT_AVATAR,
    DEFAULT_AVATAR
  );

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className={styles.nav}>
      {loggedIn && (
        <span className={styles.greeting}>
          {avatar} {nickname ?? email}님
        </span>
      )}

      {loggedIn ? (
        <>
          <Link href="/mypage" className={styles.link}>
            마이페이지
          </Link>
          <Link href="/history" className={styles.link}>
            내 질문 기록
          </Link>
          <button className={styles.linkButton} onClick={handleLogout}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className={styles.link}>
            로그인
          </Link>
          <Link href="/signup" className={styles.linkPrimary}>
            회원가입
          </Link>
        </>
      )}
    </div>
  );
}
