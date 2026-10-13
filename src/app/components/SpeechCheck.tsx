"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SpeechCheck.module.css";
import { playErrorBeep, playSuccessDing } from "./sound";
import { isCloseEnough, missedWords } from "../lib/speechMatch";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};


function correctMessage(missed: string[]): string {
  return missed.length === 0
    ? "소리 내어 정확하게 읽었어! 참 잘했어요."
    : `거의 정확해! 잘했어요. (‘${missed.join("’, ‘")}’ 부분은 조금 다르게 들렸어)`;
}

export default function SpeechCheck({
  target,
  onCorrect,
}: {
  target: string;
  /** Receives the praise to show — the parent usually swaps this component
   * out on success, so it has to display the message itself. */
  onCorrect: (message: string) => void;
}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [missed, setMissed] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as WindowWithSpeech;
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ko-KR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let text = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      setTranscript(text);

      if (isFinal) {
        const isCorrect = isCloseEnough(text, target);
        const missedNow = missedWords(target, text);
        setMissed(missedNow);
        if (isCorrect) {
          setResult("correct");
          playSuccessDing();
          onCorrect(correctMessage(missedNow));
        } else {
          setResult("wrong");
          playErrorBeep();
        }
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  function start() {
    if (!recognitionRef.current) return;
    setTranscript("");
    setResult("idle");
    setMissed([]);
    setListening(true);
    recognitionRef.current.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  if (!supported) {
    return (
      <p className={styles.unsupported}>
        이 브라우저에서는 음성 인식을 지원하지 않아요. 크롬 브라우저로
        시도해봐.
      </p>
    );
  }

  return (
    <div className={styles.voiceBox}>
      <button
        type="button"
        className={`${styles.micButton} ${listening ? styles.micButtonActive : ""}`}
        onClick={listening ? stop : start}
      >
        {listening ? "🎙️ 듣는 중... (누르면 멈춤)" : "🎤 소리 내어 읽기"}
      </button>

      <p className={styles.privacyNote}>
        🔒 마이크를 켜면 목소리를 글자로 바꾸기 위해 브라우저 회사(예: 크롬은
        Google)의 음성 인식 서버로 목소리가 보내질 수 있어요. MG스터디는 목소리를
        저장하지 않고, 바뀐 글자도 이 화면에서만 확인해요.
      </p>

      {transcript && <p className={styles.transcript}>“{transcript}”</p>}

      {result === "correct" && (
        <p className={styles.voiceCorrect}>{correctMessage(missed)}</p>
      )}
      {result === "wrong" && (
        <div className={styles.wrongBanner}>
          <span aria-hidden="true">⚠</span>
          <span>
            {missed.length > 0
              ? `‘${missed.join("’, ‘")}’ 부분이 다르게 들렸어. 다시 읽어볼까?`
              : "다르게 읽은 것 같아. 다시 읽어볼까?"}
          </span>
        </div>
      )}
    </div>
  );
}
