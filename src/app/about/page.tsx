"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import AuthNav from "../components/AuthNav";

type CompositionDemo = {
  tag: string;
  s1: string;
  beforePrefix: string;
  beforeIssue: string;
  beforeSuffix: string;
  feedback: string;
  afterPrefix: string;
  afterFix: string;
  afterSuffix: string;
};

const COMPOSITION_DEMOS: CompositionDemo[] = [
  {
    tag: "지칭",
    s1: "공룡은 아주 먼 옛날에 살았다.",
    beforePrefix: "",
    beforeIssue: "그거는",
    beforeSuffix: " 왜 멸종했을까?",
    feedback: "‘그거’가 무엇을 가리키는지 헷갈려요!",
    afterPrefix: "",
    afterFix: "공룡은",
    afterSuffix: " 왜 멸종했을까?",
  },
  {
    tag: "맞춤법",
    s1: "비가 온 뒤에 무지개가 떴다.",
    beforePrefix: "무지개는 색깔이 ",
    beforeIssue: "이쁘게생겼다.",
    beforeSuffix: "",
    feedback: "‘이쁘게 생겼다’처럼 띄어 써야 해요!",
    afterPrefix: "무지개는 색깔이 ",
    afterFix: "이쁘게 생겼다.",
    afterSuffix: "",
  },
  {
    tag: "지칭",
    s1: "개미들이 줄지어 걸어갔다.",
    beforePrefix: "",
    beforeIssue: "쟤네는",
    beforeSuffix: " 먹이를 찾고 있었다.",
    feedback: "‘쟤네’보다 ‘개미들’이라고 다시 말해주면 더 또렷해요!",
    afterPrefix: "",
    afterFix: "개미들은",
    afterSuffix: " 먹이를 찾고 있었다.",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <AuthNav />

      <h1 className={styles.title}>MG스터디는 왜 다를까요?</h1>
      <p className={styles.subtitle}>
        답을 주는 대신, 더 좋은 질문을 만들도록 도와주는 이유를 소개할게요.
      </p>

      <section className={styles.aboutSection}>
        <span className={styles.aboutBadge}>MG스터디는 왜 다를까요?</span>
        <h2 className={styles.aboutTitle}>
          답을 주는 대신, 더 좋은 질문을 만들도록 도와줘요
        </h2>
        <p className={styles.aboutText}>
          아이가 AI에게 물어보면 답만 쏙 알려주는 경우가 많아요. 그러다
          보면 스스로 생각하는 힘과 문해력이 자라기 어려워질 수 있어요.
          MG스터디는 답 대신, 아이가 스스로 질문을 더 또렷하고 완전하게
          다듬어보도록 도와주는 학습 도우미예요.
        </p>

        <div className={styles.aboutCards}>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon} aria-hidden="true">
              🧭
            </span>
            <h3 className={styles.aboutCardTitle}>질문을 다시 잘 만들어요</h3>
            <p className={styles.aboutCardText}>
              짧고 서투른 질문을 육하원칙 등 다양한 방식으로 하나씩
              채워가며, 훨씬 더 또렷하고 제대로 된 질문으로 완성해요.
            </p>
          </div>

          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon} aria-hidden="true">
              ✍️
            </span>
            <h3 className={styles.aboutCardTitle}>원고지에 옮겨 적어요</h3>
            <p className={styles.aboutCardText}>
              완성한 질문을 원고지 칸에 한 글자씩 또박또박 옮겨 적으며
              다시 한 번 마음에 새겨요.
            </p>
          </div>

          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon} aria-hidden="true">
              🎤
            </span>
            <h3 className={styles.aboutCardTitle}>소리 내어 읽어봐요</h3>
            <p className={styles.aboutCardText}>
              완성한 질문을 소리 내어 읽으면 AI가 듣고 맞았는지 알려줘요.
              쓰기와 말하기, 두 가지 방법으로 확인할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.demoSection}>
        <span className={styles.aboutBadge}>새로 생긴 기능</span>
        <h2 className={styles.aboutTitle}>
          두 문장으로 이어 써도, 헷갈리는 부분을 AI가 콕 짚어줘요
        </h2>
        <p className={styles.aboutText}>
          한 문장으로 억지로 합칠 필요 없어요. 두 문장으로 나눠 써도 되고,
          대신 앞뒤 문장이 잘 이어지는지, 맞춤법은 맞는지 AI가 다정하게
          확인해줘요.
        </p>
        <CompositionDemoCard />
      </section>

      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}

/** Auto-cycles through COMPOSITION_DEMOS; the inner content div is keyed on
 * the current index so every entrance animation replays from scratch each
 * time the example changes. */
function CompositionDemoCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((n) => (n + 1) % COMPOSITION_DEMOS.length);
    }, 5600);
    return () => clearInterval(timer);
  }, []);

  const demo = COMPOSITION_DEMOS[index];

  return (
    <div className={styles.demoCard}>
      <div className={styles.demoContent} key={index}>
        <div className={styles.demoBlock}>
          <span className={styles.demoBlockLabel}>
            🧒 내가 쓴 글 · {demo.tag}
          </span>
          <p className={styles.demoLine}>{demo.s1}</p>
          <p className={styles.demoLine}>
            {demo.beforePrefix}
            <span className={styles.demoIssue}>{demo.beforeIssue}</span>
            {demo.beforeSuffix}
          </p>
        </div>

        <div className={styles.demoAiRow}>
          <span className={styles.demoAiIcon} aria-hidden="true" />
          <span className={styles.demoBubble}>{demo.feedback}</span>
        </div>

        <div className={`${styles.demoBlock} ${styles.demoBlockAfter}`}>
          <span className={styles.demoBlockLabelFixed}>
            ✨ AI가 도와준 글
          </span>
          <p className={styles.demoLine}>{demo.s1}</p>
          <p className={styles.demoLine}>
            {demo.afterPrefix}
            <span className={styles.demoFix}>{demo.afterFix}</span>
            {demo.afterSuffix}
          </p>
        </div>
      </div>

      <div className={styles.demoDots}>
        {COMPOSITION_DEMOS.map((_, i) => (
          <span
            key={i}
            className={`${styles.demoDot} ${
              i === index ? styles.demoDotActive : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
