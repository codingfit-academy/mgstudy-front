"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Fireworks from "../components/Fireworks";
import SpeechCheck from "../components/SpeechCheck";
import { playErrorBeep } from "../components/sound";
import { useClientValue } from "../lib/useClientValue";
import { checkComposition, type Quiz } from "../lib/ai";

const CUSTOM_OPTION_ID = "custom";

const MANUSCRIPT_COLUMNS = 10;

type QuizData = { quizzes: Quiz[]; answer: string };

function readQuizData(): QuizData | null {
  const raw = sessionStorage.getItem("mgstudy:quizData");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuizData;
    return Array.isArray(parsed.quizzes) ? parsed : null;
  } catch {
    return null;
  }
}

type StepState = "locked" | "active" | "done";

function stateOf(stepIndex: number, current: number): StepState {
  if (stepIndex < current) return "done";
  if (stepIndex === current) return "active";
  return "locked";
}

export default function SolvePage() {
  const router = useRouter();
  const question = useClientValue(
    () => sessionStorage.getItem("mgstudy:question") || "",
    ""
  );
  const age = useClientValue(() => {
    const raw = Number(sessionStorage.getItem("mgstudy:age"));
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  }, undefined);
  // undefined = not read yet (SSR/hydration render), null = genuinely missing.
  // Effects from the hydration render still see the fallback, so only a real
  // null may trigger the redirect (otherwise a refresh of /solve bounces away).
  const quizData = useClientValue<QuizData | null | undefined>(
    readQuizData,
    undefined
  );
  const [current, setCurrent] = useState(0);
  const quizzes = quizData?.quizzes ?? [];

  useEffect(() => {
    if (quizData === null) {
      router.replace("/analyze");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData]);

  // Sized lazily as answers come in rather than pre-sized to `quizzes.length`,
  // since `quizData` above swaps from the SSR fallback to the real stored
  // value right after hydration — every read of these arrays already
  // tolerates missing/undefined entries, so no fixed size is needed.
  const [choices, setChoices] = useState<(string | null)[]>([]);
  const [customTexts, setCustomTexts] = useState<string[]>([]);
  const [wrongFlags, setWrongFlags] = useState<boolean[]>([]);
  const [celebrate, setCelebrate] = useState(0);

  function selectOption(quizIndex: number, optionId: string) {
    setChoices((prev) => {
      const next = [...prev];
      next[quizIndex] = optionId;
      return next;
    });
    setWrongFlags((prev) => {
      const next = [...prev];
      next[quizIndex] = false;
      return next;
    });
  }

  function setCustomText(quizIndex: number, text: string) {
    setCustomTexts((prev) => {
      const next = [...prev];
      next[quizIndex] = text;
      return next;
    });
  }

  function checkQuiz(quizIndex: number) {
    const quiz = quizzes[quizIndex];
    const chosenId = choices[quizIndex];
    const isCorrect =
      chosenId === CUSTOM_OPTION_ID
        ? (customTexts[quizIndex] ?? "").trim() !== ""
        : chosenId === quiz.correctId;
    setWrongFlags((prev) => {
      const next = [...prev];
      next[quizIndex] = !isCorrect;
      return next;
    });
    if (isCorrect) {
      setCurrent(quizIndex + 1);
      setCelebrate((n) => n + 1);
    }
  }

  const allDone = quizzes.length > 0 && current >= quizzes.length;
  const assembledValues = quizzes.map((quiz, i) => {
    const chosenId = choices[i];
    if (chosenId === CUSTOM_OPTION_ID) return (customTexts[i] ?? "").trim();
    const option = quiz.options.find((o) => o.id === chosenId);
    return option ? option.value : "";
  });

  const [attempt, setAttempt] = useState("");
  const [checkingComposition, setCheckingComposition] = useState(false);
  const [compositionResult, setCompositionResult] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [compositionAttempts, setCompositionAttempts] = useState(0);
  const [lastCheckedAttempt, setLastCheckedAttempt] = useState<string | null>(null);
  const [finalComposition, setFinalComposition] = useState<string | null>(
    null
  );
  const assembledQuestion = finalComposition ?? "";

  async function submitComposition() {
    const text = attempt.trim();
    if (!text) return;
    // Resubmitting the exact text that was just marked wrong would only pay
    // for the same feedback again — keep showing it instead.
    if (text === lastCheckedAttempt && compositionResult && !compositionResult.isCorrect) {
      playErrorBeep();
      return;
    }
    setLastCheckedAttempt(text);
    setCheckingComposition(true);
    try {
      const result = await checkComposition({
        pieces: assembledValues,
        attempt: text,
        age,
      });
      setCompositionResult(result);
      if (result.isCorrect) {
        setFinalComposition(text);
        setCelebrate((n) => n + 1);
      } else {
        setCompositionAttempts((n) => n + 1);
        playErrorBeep();
      }
    } catch {
      // AI 확인을 받을 수 없을 때는 아이가 쓴 글 그대로 진행시켜줌
      setFinalComposition(text);
    } finally {
      setCheckingComposition(false);
    }
  }

  function skipComposition() {
    const text = attempt.trim();
    if (!text) return;
    setFinalComposition(text);
  }

  function speakQuestion() {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(assembledQuestion);
    utterance.lang = "ko-KR";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  const [retypedText, setRetypedText] = useState("");
  const [retypeWrong, setRetypeWrong] = useState(false);
  const [retypeDone, setRetypeDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState(
    "오타 없이 정확하게 옮겨 적었어요!"
  );
  const [shake, setShake] = useState(false);
  const [caretPos, setCaretPos] = useState(0);
  const manuscriptInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const lastCheckedLengthRef = useRef(0);

  useEffect(() => {
    if (allDone && finalComposition !== null && !retypeDone) {
      manuscriptInputRef.current?.focus();
    }
  }, [allDone, finalComposition, retypeDone]);

  useEffect(() => {
    if (!shake) return;
    const t = setTimeout(() => setShake(false), 400);
    return () => clearTimeout(t);
  }, [shake]);

  function syncCaret(el: HTMLInputElement) {
    setCaretPos(el.selectionStart ?? el.value.length);
  }

  /** Beeps once per newly-typed character that doesn't match the target. */
  function checkNewCharacters(newValue: string) {
    const prevChecked = lastCheckedLengthRef.current;
    if (newValue.length <= prevChecked) {
      lastCheckedLengthRef.current = newValue.length;
      return;
    }
    for (let i = prevChecked; i < newValue.length; i++) {
      if (newValue[i] !== assembledQuestion[i]) {
        playErrorBeep();
        break;
      }
    }
    lastCheckedLengthRef.current = newValue.length;
  }

  function handleManuscriptChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setRetypedText(newValue);
    setRetypeWrong(false);
    syncCaret(e.target);
    if (!isComposingRef.current) {
      checkNewCharacters(newValue);
    }
  }

  function handleCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    checkNewCharacters(e.currentTarget.value);
    syncCaret(e.currentTarget);
  }

  function focusManuscriptAt(pos: number) {
    const input = manuscriptInputRef.current;
    if (!input) return;
    const clamped = Math.min(Math.max(pos, 0), retypedText.length);
    input.focus();
    input.setSelectionRange(clamped, clamped);
    setCaretPos(clamped);
  }

  function checkRetype() {
    const isCorrect = retypedText.trim() === assembledQuestion.trim();
    setRetypeWrong(!isCorrect);
    setRetypeDone(isCorrect);
    if (isCorrect) {
      setCelebrate((n) => n + 1);
    } else {
      setShake(true);
      playErrorBeep();
    }
  }

  function goToResult() {
    sessionStorage.setItem("mgstudy:finalQuestion", assembledQuestion);
    router.push("/result");
  }

  const manuscriptRowCount = Math.max(
    1,
    Math.ceil(assembledQuestion.length / MANUSCRIPT_COLUMNS)
  );

  return (
    <div className={styles.page}>
      <Fireworks trigger={celebrate} />
      <div className={styles.questionCard}>
        <span className={styles.questionLabel}>네가 물어본 질문</span>
        <p className={styles.questionText}>{question}</p>
      </div>

      <ol className={styles.timeline}>
        {quizzes.map((quiz, i) => {
          const state = stateOf(i, current);
          return (
            <li className={styles.stepRow} key={quiz.id}>
              <div className={styles.circleCol}>
                <div className={`${styles.circle} ${styles[state]}`}>
                  {state === "done" ? "✓" : i + 1}
                </div>
                <div className={styles.line} />
              </div>
              <div
                className={`${styles.stepCard} ${
                  state === "locked" ? styles.stepCardLocked : ""
                }`}
              >
                <h2 className={styles.stepTitle}>{quiz.title}</h2>
                <p className={styles.stepDesc}>{quiz.desc}</p>

                {state !== "locked" && (
                  <>
                    <div className={styles.checkList}>
                      {quiz.options.map((o) => (
                        <label key={o.id} className={styles.checkItem}>
                          <input
                            type="radio"
                            name={quiz.id}
                            checked={choices[i] === o.id}
                            onChange={() => selectOption(i, o.id)}
                            disabled={state !== "active"}
                          />
                          {o.label}
                        </label>
                      ))}
                      <label className={styles.checkItem}>
                        <input
                          type="radio"
                          name={quiz.id}
                          checked={choices[i] === CUSTOM_OPTION_ID}
                          onChange={() => selectOption(i, CUSTOM_OPTION_ID)}
                          disabled={state !== "active"}
                        />
                        직접 쓰기
                      </label>
                      {choices[i] === CUSTOM_OPTION_ID && (
                        <input
                          type="text"
                          className={styles.customInput}
                          placeholder="내 생각을 직접 적어보자"
                          value={customTexts[i] ?? ""}
                          onChange={(e) => setCustomText(i, e.target.value)}
                          disabled={state !== "active"}
                        />
                      )}
                    </div>

                    {state === "active" && (
                      <>
                        <button
                          className={styles.checkButton}
                          onClick={() => checkQuiz(i)}
                          disabled={
                            !choices[i] ||
                            (choices[i] === CUSTOM_OPTION_ID &&
                              (customTexts[i] ?? "").trim() === "")
                          }
                        >
                          확인
                        </button>
                        {wrongFlags[i] && (
                          <p className={styles.feedbackWrong}>{quiz.wrongMsg}</p>
                        )}
                      </>
                    )}

                    {state === "done" && (
                      <p className={styles.feedbackCorrect}>
                        {choices[i] === CUSTOM_OPTION_ID
                          ? "네가 직접 쓴 답으로 진행할게!"
                          : quiz.correctMsg}
                      </p>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && finalComposition === null && (
        <div className={styles.assembleCard}>
          <span className={styles.assembleLabel}>
            내가 찾은 답 조각들
          </span>
          <ul className={styles.pieceList}>
            {assembledValues.map((v, i) => (
              <li className={styles.pieceItem} key={i}>
                {v}
              </li>
            ))}
          </ul>
          <p className={styles.retypePrompt}>
            이 조각들을 살려서 궁금한 점을 네 힘으로 이어 써보자. 한
            문장이어도, 두 문장이어도 괜찮아!
          </p>
          <textarea
            className={styles.compositionInput}
            rows={3}
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="위의 조각들을 넣어서 한두 문장으로 써보자"
          />
          <button
            type="button"
            className={styles.checkButton}
            onClick={submitComposition}
            disabled={attempt.trim() === "" || checkingComposition}
          >
            {checkingComposition ? "확인하는 중..." : "확인하기"}
          </button>
          {compositionResult && !compositionResult.isCorrect && (
            <div className={styles.wrongBanner}>
              <span className={styles.wrongIcon} aria-hidden="true">
                ⚠
              </span>
              <span>{compositionResult.message}</span>
            </div>
          )}
          {compositionAttempts >= 3 && (
            <button
              type="button"
              className={styles.resultButton}
              onClick={skipComposition}
              disabled={attempt.trim() === ""}
            >
              이대로 진행할래요
            </button>
          )}
        </div>
      )}

      {allDone && finalComposition !== null && (
        <div className={styles.assembleCard}>
          <span className={styles.assembleLabel}>
            구체적으로 완성한 질문
          </span>
          <p className={styles.assembleQuestion}>{assembledQuestion}</p>
          <button
            type="button"
            className={styles.speakButton}
            onClick={speakQuestion}
          >
            🔊 들어보기
          </button>
          <p className={styles.assemblePraise}>
            네가 찾은 조각들을 스스로 이어서 훨씬 더 제대로 된 질문을
            완성했어요!
          </p>

          {!retypeDone && (
            <div className={styles.retypeSection}>
              <p className={styles.retypePrompt}>
                이 질문을 오타 없이 그대로 옮겨 적어보자.
              </p>

              <div
                className={`${styles.manuscript} ${
                  retypeWrong ? styles.manuscriptWrong : ""
                } ${shake ? styles.manuscriptShake : ""}`}
                onClick={() => focusManuscriptAt(retypedText.length)}
              >
                {Array.from({ length: manuscriptRowCount }).map((_, ri) => (
                  <div className={styles.manuscriptRow} key={ri}>
                    {Array.from({ length: MANUSCRIPT_COLUMNS }).map((_, ci) => {
                      const idx = ri * MANUSCRIPT_COLUMNS + ci;
                      const ch = retypedText[idx] ?? "";
                      const isCursor = idx === caretPos;
                      const isError =
                        idx < retypedText.length &&
                        ch !== assembledQuestion[idx];
                      return (
                        <span
                          key={ci}
                          className={`${styles.manuscriptCell} ${
                            isCursor ? styles.manuscriptCellCursor : ""
                          } ${isError ? styles.manuscriptCellError : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            focusManuscriptAt(idx);
                          }}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </div>
                ))}
                <input
                  ref={manuscriptInputRef}
                  className={styles.manuscriptHiddenInput}
                  value={retypedText}
                  maxLength={assembledQuestion.length}
                  onChange={handleManuscriptChange}
                  onCompositionStart={() => {
                    isComposingRef.current = true;
                  }}
                  onCompositionEnd={handleCompositionEnd}
                  onClick={(e) => syncCaret(e.currentTarget)}
                  onKeyUp={(e) => syncCaret(e.currentTarget)}
                  aria-label="완성된 질문 따라 적기"
                />
              </div>

              <button className={styles.checkButton} onClick={checkRetype}>
                확인
              </button>
              {retypeWrong && (
                <div className={styles.wrongBanner}>
                  <span className={styles.wrongIcon} aria-hidden="true">
                    ⚠
                  </span>
                  <span>오타가 있어요! 다시 확인해봐</span>
                </div>
              )}

              <SpeechCheck
                target={assembledQuestion}
                onCorrect={(message) => {
                  setDoneMessage(message);
                  setRetypeDone(true);
                  setCelebrate((n) => n + 1);
                }}
              />
            </div>
          )}

          {retypeDone && (
            <div className={styles.retypeSection}>
              <p className={styles.feedbackCorrect}>{doneMessage}</p>
              <button className={styles.resultButton} onClick={goToResult}>
                결과보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
