"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import AuthNav from "./components/AuthNav";
import { addHistoryEntry, getHistory, type HistoryEntry } from "./lib/auth";
import { useAuth } from "./lib/AuthContext";
import { suggestAdvancedQuestion } from "./lib/ai";
import { useClientValue } from "./lib/useClientValue";

function dedupeReviewItems(items: HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<string>();
  const unique: HistoryEntry[] = [];
  for (const entry of items) {
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
  const cachedAge = useClientValue(
    () => localStorage.getItem("mgstudy:savedAge") || "",
    ""
  );
  const [age, setAge] = useState("");
  const [question, setQuestion] = useState("");
  const { loggedIn } = useAuth();
  const [fetchedReviewItems, setFetchedReviewItems] = useState<HistoryEntry[]>([]);
  const reviewItems = loggedIn ? fetchedReviewItems : [];

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    getHistory().then((items) => {
      if (!cancelled) setFetchedReviewItems(dedupeReviewItems(items));
    });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const canSubmit = age.trim() !== "" && question.trim() !== "";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    sessionStorage.setItem("mgstudy:age", age);
    sessionStorage.setItem("mgstudy:question", question);
    localStorage.setItem("mgstudy:savedAge", age);
    const ageNum = Number(age);
    void addHistoryEntry({
      question,
      age: Number.isFinite(ageNum) && ageNum > 0 ? ageNum : undefined,
    });
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
            {reviewItems.map((item, i) => (
              <div className={styles.reviewCard} key={i}>
                <p className={styles.reviewQuestion}>{item.question}</p>
                <button
                  type="button"
                  className={styles.reviewButton}
                  onClick={() =>
                    startQuestion(item.question, String(item.age ?? ""))
                  }
                >
                  복습하기
                </button>

                <AdvancedQuestionBox
                  question={item.question}
                  age={item.age ?? undefined}
                  onPick={(q) => startQuestion(q, String(item.age ?? ""))}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <form className={styles.card} onSubmit={handleSubmit}>
        <AgeRow key={cachedAge} initialAge={cachedAge} onAgeChange={setAge} />

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

      <Link href="/about" className={styles.aboutLink}>
        MG스터디는 왜 다를까요? 자세히 보기 →
      </Link>

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

/** Fetches its own AI-suggested follow-up question on mount instead of
 * blocking the whole review list on one slow/failed call. */
function AdvancedQuestionBox({
  question,
  age,
  onPick,
}: {
  question: string;
  age?: number;
  onPick: (question: string) => void;
}) {
  const [advanced, setAdvanced] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    suggestAdvancedQuestion(question, age)
      .then((q) => {
        if (!cancelled) setAdvanced(q);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [question, age]);

  if (failed) return null;

  return (
    <div className={styles.advancedBox}>
      <span className={styles.advancedLabel}>🚀 심화 질문</span>
      {advanced === null ? (
        <p className={styles.advancedText}>생각하는 중...</p>
      ) : (
        <>
          <p className={styles.advancedText}>{advanced}</p>
          <button
            type="button"
            className={styles.advancedButton}
            onClick={() => onPick(advanced)}
          >
            이것도 풀어보기
          </button>
        </>
      )}
    </div>
  );
}

/** Keyed by the cached age in the parent so this re-mounts (and re-initializes
 * its own state) once the real localStorage value is known post-hydration. */
function AgeRow({
  initialAge,
  onAgeChange,
}: {
  initialAge: string;
  onAgeChange: (value: string) => void;
}) {
  const [age, setAge] = useState(initialAge);

  useEffect(() => {
    onAgeChange(initialAge);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
        onChange={(e) => {
          setAge(e.target.value);
          onAgeChange(e.target.value);
        }}
      />
      <span className={styles.ageUnit}>살</span>
    </div>
  );
}
