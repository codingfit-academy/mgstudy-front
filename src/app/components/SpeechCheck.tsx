"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SpeechCheck.module.css";
import { playErrorBeep, playSuccessDing } from "./sound";

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

function normalize(text: string) {
  return text.replace(/[\s.,!?~'"`]/g, "");
}

export default function SpeechCheck({
  target,
  onCorrect,
}: {
  target: string;
  onCorrect: () => void;
}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
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
        const isCorrect = normalize(text) === normalize(target);
        if (isCorrect) {
          setResult("correct");
          playSuccessDing();
          onCorrect();
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

      {transcript && <p className={styles.transcript}>“{transcript}”</p>}

      {result === "correct" && (
        <p className={styles.voiceCorrect}>정확하게 읽었어! 참 잘했어요.</p>
      )}
      {result === "wrong" && (
        <div className={styles.wrongBanner}>
          <span aria-hidden="true">⚠</span>
          <span>다르게 읽은 것 같아. 다시 읽어볼까?</span>
        </div>
      )}
    </div>
  );
}
