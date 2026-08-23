"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AuthNav from "./components/AuthNav";
import {
  addHistoryEntry,
  isLoggedIn,
  getHistory,
  type HistoryEntry,
} from "./lib/localAuth";
import { suggestAdvancedQuestion } from "./lib/advancedQuestions";
import { useClientValue } from "./lib/useClientValue";

function getReviewItems(): HistoryEntry[] {
  if (!isLoggedIn()) return [];
  const seen = new Set<string>();
  const unique: HistoryEntry[] = [];
  for (const entry of getHistory()) {
    if (seen.has(entry.question)) continue;
    seen.add(entry.question);
    unique.push(entry);
    if (unique.length >= 3) break;
  }
  return unique;
}

const EXAMPLE_QUESTIONS = [
  "공룡은 왜 사라졌어?",
  "우주는 얼마나 커?",
  "하늘은 왜 파래?",
  "무지개는 왜 생겨?",
  "번개는 왜 쳐?",
  "개미는 왜 줄지어 다녀?",
];

type MediaLink = {
  type: "news" | "video";
  source: string;
  title: string;
  url: string;
};

const MEDIA_LINKS: MediaLink[] = [
  {
    type: "news",
    source: "서울신문",
    title: "청소년 10명 중 9명 생성형 AI 챗봇 사용…41% “챗봇 답변 행동으로”",
    url: "https://www.seoul.co.kr/news/society/2026/04/28/20260428500211",
  },
  {
    type: "video",
    source: "YouTube · 지식채널e",
    title: "AI에게서 좋은 답을 얻는 방법 | 다시 질문하는 인간이 필요한 시대",
    url: "https://www.youtube.com/watch?v=EBCBDaG6YQE",
  },
  {
    type: "news",
    source: "한경 생글생글",
    title: "[생글기자 코너] 숏폼과 AI가 불러온 문해력 저하",
    url: "https://sgsg.hankyung.com/article/2026032047681",
  },
  {
    type: "video",
    source: "YouTube",
    title: "[자녀교육] AI가 답하는 시대, 아이는 무엇을 배워야 하는가",
    url: "https://www.youtube.com/watch?v=fFaEGFGXTCk",
  },
  {
    type: "news",
    source: "오마이뉴스",
    title:
      "\"난 AI와 다르게 생각해\" 수업 때 딱 하나 바꾸니 아이들 답이 달라졌다",
    url: "https://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=A0003238408&PAGE_CD=ET001&BLCK_NO=1&CMPT_CD=T0016",
  },
  {
    type: "video",
    source: "YouTube · EBS지식",
    title: "\"쓰지 않으면 잃는다\" AI에게 의존한 인간의 뇌가 맞이한 결말",
    url: "https://www.youtube.com/watch?v=rQyiy6SPulA",
  },
  {
    type: "news",
    source: "머니투데이",
    title:
      "AI 매일 쓰는 청소년, '팩트체크'는 부족…성적 따라 갈리는 AI리터러시",
    url: "https://www.mt.co.kr/policy/2026/05/06/2026050614521659594",
  },
];

export default function Home() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [question, setQuestion] = useState("");
  const reviewItems = useClientValue(getReviewItems, []);

  const canSubmit = age.trim() !== "" && question.trim() !== "";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    sessionStorage.setItem("mgstudy:age", age);
    sessionStorage.setItem("mgstudy:question", question);
    addHistoryEntry({ question, age, date: new Date().toISOString() });
    router.push("/analyze");
  }

  function startQuestion(q: string, entryAge: string) {
    sessionStorage.setItem("mgstudy:age", entryAge);
    sessionStorage.setItem("mgstudy:question", q);
    router.push("/analyze");
  }

  return (
    <div className={styles.page}>
      <AuthNav />
      <div className={styles.sparkle} aria-hidden="true" />

      <h1 className={styles.greeting}>안녕! 무엇이 궁금해?</h1>
      <p className={styles.subtitle}>
        짧게 물어봐도 괜찮아요. 몇 가지 퀴즈를 풀면서 스스로 생각을
        더해, 훨씬 더 제대로 된 질문을 완성해봐요.
      </p>

      {reviewItems.length > 0 && (
        <section className={styles.reviewSection}>
          <p className={styles.reviewLabel}>
            지난번에 물어봤던 질문, 복습해볼까?
          </p>
          <div className={styles.reviewCards}>
            {reviewItems.map((item, i) => {
              const advanced = suggestAdvancedQuestion(item.question);
              return (
                <div className={styles.reviewCard} key={i}>
                  <p className={styles.reviewQuestion}>{item.question}</p>
                  <button
                    type="button"
                    className={styles.reviewButton}
                    onClick={() => startQuestion(item.question, item.age)}
                  >
                    복습하기
                  </button>

                  <div className={styles.advancedBox}>
                    <span className={styles.advancedLabel}>
                      🚀 심화 질문
                    </span>
                    <p className={styles.advancedText}>{advanced}</p>
                    <button
                      type="button"
                      className={styles.advancedButton}
                      onClick={() => startQuestion(advanced, item.age)}
                    >
                      이것도 풀어보기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.ageRow}>
          <label htmlFor="age" className={styles.ageLabel}>
            나이
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={1}
            max={19}
            inputMode="numeric"
            placeholder="예: 10"
            className={styles.ageInput}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <span className={styles.ageUnit}>살</span>
        </div>

        <textarea
          name="question"
          className={styles.questionInput}
          placeholder="궁금한 걸 짧게 물어봐 (예: 공룡은 왜 사라졌어?)"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
          생각 시작하기
          <span className={styles.arrow}>→</span>
        </button>
      </form>

      <div className={styles.exampleSection}>
        <p className={styles.exampleLabel}>이런 게 궁금하지 않아?</p>
        <div className={styles.exampleChips}>
          {EXAMPLE_QUESTIONS.map((example) => (
            <button
              key={example}
              type="button"
              className={styles.exampleChip}
              onClick={() => setQuestion(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.footnote}>
        AI가 네 질문을 육하원칙에 맞게 나눠 퀴즈로 만들고, 네가 하나씩
        직접 풀어낸 답들을 모아 더 제대로 된 질문으로 완성해줘요.
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

      <section className={styles.mediaSection}>
        <p className={styles.mediaLabel}>
          AI와 문해력, 이런 이야기도 있어요
        </p>
        <div className={styles.mediaScroll}>
          {MEDIA_LINKS.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mediaCard}
            >
              <span
                className={`${styles.mediaBadge} ${
                  item.type === "video" ? styles.mediaBadgeVideo : ""
                }`}
              >
                {item.type === "video" ? "▶ 영상" : "📰 뉴스"}
              </span>
              <span className={styles.mediaTitle}>{item.title}</span>
              <span className={styles.mediaSource}>{item.source}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
