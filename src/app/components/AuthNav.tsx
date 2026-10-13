"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./AuthNav.module.css";
import { logout } from "../lib/auth";
import { useAuth } from "../lib/AuthContext";

export default function AuthNav() {
  const router = useRouter();
  const { loading, loggedIn, account, setAccount } = useAuth();

  async function handleLogout() {
    // Navigate away first: logout can be triggered from a login-gated page
    // (mypage/history), and those pages redirect to /login the instant
    // `loggedIn` flips to false. Starting the navigation to "/" before
    // clearing the account lets it win that race instead of /login.
    router.push("/");
    await logout();
    setAccount(null);
  }

  if (loading) {
    return <div className={styles.nav} />;
  }

  return (
    <div className={styles.nav}>
      {loggedIn && account && (
        <span className={styles.greeting}>
          {account.avatar} {account.nickname || account.email}님
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
