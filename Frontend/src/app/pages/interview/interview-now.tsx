import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "@/contexts/use-interview";
import {
  ArrowLeft,
  AudioLines,
  BadgeCheck,
  Bot,
  Circle,
  CircleCheck,
  CircleDot,
  Lightbulb,
  Loader2,
  MessagesSquare,
  Mic,
  MicOff,
  Power,
  SendHorizontal,
  SkipForward,
  SquareTerminal,
  User,
  Video,
  Volume2,
} from "lucide-react";
import alexChen from "@/assets/stitch/alex-chen.jpg";
import { generateInterviewQuestions, retrieveInterviewContext, submitInterview } from "@/api/interviewService";
import type { InterviewSubmitResponse, RetrievedContextChunk } from "@/types/api";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult:
    | ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void)
    | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type QuestionRecording = { url: string; durationSec: number };

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

/*
 * Layout is the Stitch screen "Practice Studio & Live Simulation (Desktop Web)"
 * (project 16808869888425310618, screen 8e9e8516f9d546889352580ae87f7fc6),
 * restyled over the REAL interview (2026-09-23): questions, camera, speech,
 * transcript and submit are live. The code editor, test telemetry, topology map
 * and rubric are Stitch's static sample panels. Pre-Stitch version:
 * docs/backup/interview-now-before-stitch.tsx.txt.
 */
const RAISED = "border border-ph-line-strong";
const RECESSED = "border border-ph-line";
const CTA =
  "bg-ph-ink font-semibold text-black shadow-[0_0_0_1px_rgba(0,255,65,0.25)] hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] active:scale-[0.98] transition-all";
const LABEL_SM = "text-[11px] leading-[14px] tracking-[0.04em] font-semibold";
const LABEL_MD = "text-[13px] leading-4 tracking-[0.02em] font-medium";
const BODY_SM = "text-[12px] leading-[18px] tracking-[0.01em]";
const CODE_SM = "text-[12px] leading-4 font-medium";
const H_SM = "font-st-display text-[18px] leading-[26px] tracking-[-0.01em] font-medium";

const wordCount = (text?: string) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

const FALLBACK_TIPS = [
  "Open with the context, then walk through what you did and the result.",
  "Name one trade-off you made and why you accepted it.",
];

const QUESTION_TIME_SECONDS = 120;
const SILENCE_AUTO_ADVANCE_MS = 5000;

const normalizeSentence = (text: string): string => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.endsWith("?") ? cleaned : `${cleaned}?`;
};

const formatTimer = (seconds: number): string => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

const buildQuestionsFromContext = (
  contextPack: RetrievedContextChunk[],
  role: string | null,
  difficulty: string | null,
  skills: string[]
): string[] => {
  const questions: string[] = [];
  questions.push(
    normalizeSentence(`Introduce yourself and highlight your most relevant ${role ?? "developer"} project for a ${difficulty ?? "medium"} interview`)
  );
  const uniqueSections = new Set<string>();
  for (const chunk of contextPack) {
    if (questions.length >= 5) break;
    const section = chunk.section || "experience";
    if (uniqueSections.has(section)) continue;
    uniqueSections.add(section);
    const snippet = chunk.text.replace(/\s+/g, " ").slice(0, 130).trim();
    questions.push(normalizeSentence(`From your ${section}, explain this in detail: "${snippet}" and your exact contribution`));
  }
  for (const skill of skills.slice(0, 2)) {
    if (questions.length >= 6) break;
    questions.push(normalizeSentence(`Design a practical ${skill} solution and explain tradeoffs, edge cases, and performance considerations`));
  }
  return Array.from(new Set(questions)).slice(0, 6);
};

export default function InterviewNowPage() {
  const navigate = useNavigate();
  const { interviewId, interviewSetup, selectedRole, profileOption, experience, difficulty, skills } = useInterview();

  const [questions, setQuestions] = useState<string[]>([]);
  // Per-question expected signals (from LLM generation) — sent at submit for LLM judging.
  const [questionSignals, setQuestionSignals] = useState<string[][]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [isListening, setIsListening] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [editableTranscript, setEditableTranscript] = useState("");
  const [isTranscriptEdited, setIsTranscriptEdited] = useState(false);
  const [finalizedAnswers, setFinalizedAnswers] = useState<string[]>([]);
  const [questionRecordings, setQuestionRecordings] = useState<Array<QuestionRecording | undefined>>([]);
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef("");
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Ref so cleanup on unmount always has the latest recordings without re-triggering the effect
  const questionRecordingsRef = useRef<Array<QuestionRecording | undefined>>([]);
  const recordingStartAtRef = useRef<number | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const recognitionSupported = useMemo(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition), []);
  const currentQuestion = questions[currentQuestionIdx] || "";
  const isLastQuestion = currentQuestionIdx >= questions.length - 1;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  const ensureMediaReady = useCallback(async (): Promise<MediaStream | null> => {
    if (mediaStreamRef.current) {
      // If the stream exists but tracks died (e.g. device disconnected), re-acquire
      const alive = mediaStreamRef.current.getTracks().some((t) => t.readyState === "live");
      if (alive) return mediaStreamRef.current;
      mediaStreamRef.current = null;
      setCameraReady(false);
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Media devices API is not supported in this browser.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      setCameraReady(true);
      setMediaError(null);
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Unable to access camera/microphone.");
      return null;
    }
  }, []);

  const stopQuestionRecording = useCallback((questionIdx: number) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.onstop = () => {
      const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
      const durationSec = recordingStartAtRef.current ? Math.max(1, Math.round((Date.now() - recordingStartAtRef.current) / 1000)) : 0;
      if (blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setQuestionRecordings((prev) => {
          const copy = [...prev];
          if (copy[questionIdx]?.url) URL.revokeObjectURL(copy[questionIdx]!.url);
          copy[questionIdx] = { url, durationSec };
          return copy;
        });
      }
      recordingChunksRef.current = [];
      recordingStartAtRef.current = null;
      mediaRecorderRef.current = null;
    };
    recorder.stop();
  }, []);

  const startQuestionRecording = useCallback(async () => {
    const stream = await ensureMediaReady();
    if (!stream || !window.MediaRecorder) return;
    if (mediaRecorderRef.current?.state === "recording") return;
    recordingChunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) recordingChunksRef.current.push(event.data);
    };
    recorder.start();
    recordingStartAtRef.current = Date.now();
    mediaRecorderRef.current = recorder;
  }, [ensureMediaReady]);

  const finalizeCurrentAnswer = useCallback(() => {
    const finalText = editableTranscript.trim() || `${finalTranscriptRef.current} ${interimTranscript}`.trim() || "No answer captured.";
    setFinalizedAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestionIdx] = finalText;
      return copy;
    });
    setAnswerDraft(finalText);
    setEditableTranscript(finalText);
  }, [currentQuestionIdx, editableTranscript, interimTranscript]);

  const clearListeningBuffer = useCallback(() => {
    finalTranscriptRef.current = "";
    setAnswerDraft("");
    setInterimTranscript("");
    setEditableTranscript("");
    setIsTranscriptEdited(false);
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    stopQuestionRecording(currentQuestionIdx);
  }, [clearSilenceTimer, currentQuestionIdx, stopQuestionRecording]);

  const handleAdvanceQuestion = useCallback((autoReason?: "silence" | "timeout") => {
    finalizeCurrentAnswer();
    stopListening();
    clearListeningBuffer();
    if (!isLastQuestion) setCurrentQuestionIdx((idx) => idx + 1);
    else if (autoReason) setSubmitMessage("Last question captured automatically. Review and submit.");
  }, [clearListeningBuffer, finalizeCurrentAnswer, isLastQuestion, stopListening]);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      if (isListening) handleAdvanceQuestion("silence");
    }, SILENCE_AUTO_ADVANCE_MS);
  }, [clearSilenceTimer, handleAdvanceQuestion, isListening]);

  const startListening = useCallback(async () => {
    if (!recognitionSupported) {
      setQuestionError("Speech recognition is not supported in this browser.");
      return;
    }
    await startQuestionRecording();
    if (!recognitionRef.current) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) return;
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsListening(true);
        resetSilenceTimer();
      };
      recognition.onend = () => {
        setIsListening(false);
        clearSilenceTimer();
      };
      recognition.onerror = (event) => setQuestionError(event.error ? `Speech error: ${event.error}` : "Speech recognition failed.");
      recognition.onresult = (event) => {
        let finalPart = "";
        let interimPart = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i]?.[0]?.transcript ?? "";
          if ((event.results[i] as { isFinal?: boolean }).isFinal) finalPart += `${transcript} `;
          else interimPart += transcript;
        }
        if (finalPart) finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalPart}`.trim();
        const merged = `${finalTranscriptRef.current} ${interimPart}`.trim();
        setAnswerDraft(finalTranscriptRef.current);
        setInterimTranscript(interimPart.trim());
        if (!isTranscriptEdited) setEditableTranscript(merged);
        resetSilenceTimer();
      };
      recognitionRef.current = recognition;
    }
    setQuestionError(null);
    recognitionRef.current.start();
  }, [clearSilenceTimer, isTranscriptEdited, recognitionSupported, resetSilenceTimer, startQuestionRecording]);

  const handleSubmitInterview = useCallback(async () => {
    if (!interviewId) {
      setSubmitMessage("Session expired. Please start a new interview.");
      return;
    }
    // Synchronously capture the current answer (setState is async, so finalizedAnswers
    // may not yet include the last question if the user didn't press Next Question)
    const currentText =
      editableTranscript.trim() ||
      `${finalTranscriptRef.current} ${interimTranscript}`.trim() ||
      "No answer captured.";
    const allAnswers = [...finalizedAnswers];
    if (!allAnswers[currentQuestionIdx]) {
      allAnswers[currentQuestionIdx] = currentText;
    }
    const answers = allAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
      if (ans) acc[`q_${idx + 1}`] = ans;
      return acc;
    }, {});
    if (Object.keys(answers).length === 0) {
      setSubmitMessage("Please record at least one answer before submitting.");
      return;
    }
    // Send the asked questions + expected signals so the backend can LLM-judge each answer.
    const questionsPayload = questions.map((q, idx) => ({
      question_id: `q_${idx + 1}`,
      question: q,
      expected_signals: questionSignals[idx] ?? [],
    }));
    try {
      setIsSubmittingInterview(true);
      setSubmitMessage(null);
      const response: InterviewSubmitResponse = await submitInterview(interviewId, {
        answers,
        completed_at: new Date().toISOString(),
        questions: questionsPayload,
      });
      setInterviewSubmitted(true);
      setSubmitMessage("Interview submitted successfully. Redirecting to your report...");
      const resultState = {
        result: response,
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(answers).length,
      };
      // Persist so result page survives a refresh
      try {
        sessionStorage.setItem("talentpulse_last_result", JSON.stringify(resultState));
      } catch { /* ignore quota errors */ }
      navigate("/interview/result", { state: resultState });
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Failed to submit interview.");
    } finally {
      setIsSubmittingInterview(false);
    }
  }, [currentQuestionIdx, editableTranscript, finalizedAnswers, interimTranscript, interviewId, navigate, questions, questionSignals]);

  // Keep the recordings ref in sync so the unmount cleanup always revokes the latest URLs
  useEffect(() => {
    questionRecordingsRef.current = questionRecordings;
  }, [questionRecordings]);

  // Mount-only: acquire media once; clean up fully on unmount.
  // Deps are intentionally empty — all values accessed in cleanup use refs so they
  // don't need to be listed here. Adding currentQuestionIdx or questionRecordings
  // would stop all tracks on every question advance (the camera-freeze bug).
  useEffect(() => {
    void ensureMediaReady();
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      questionRecordingsRef.current.forEach((r) => r?.url && URL.revokeObjectURL(r.url));
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) videoRef.current.srcObject = mediaStreamRef.current;
  }, [cameraReady]);

  useEffect(() => {
    if (!interviewSubmitted && questions.length > 0) {
      setQuestionTimeLeft(QUESTION_TIME_SECONDS);
      clearListeningBuffer();
      clearSilenceTimer();
    }
  }, [interviewSubmitted, questions.length, currentQuestionIdx, clearListeningBuffer, clearSilenceTimer]);

  useEffect(() => {
    if (interviewSubmitted || questions.length === 0) return;
    if (questionTimeLeft <= 0) {
      handleAdvanceQuestion("timeout");
      return;
    }
    const timer = window.setInterval(() => setQuestionTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [interviewSubmitted, questions.length, questionTimeLeft, handleAdvanceQuestion]);

  useEffect(() => {
    if (!interviewId || !selectedRole || !experience || !difficulty || !profileOption) return;
    if (questions.length > 0) return;
    const load = async () => {
      setIsGeneratingQuestions(true);
      setQuestionError(null);
      try {
        // Primary path: server-side LLM question generation (Gemini free tier).
        const generated = await generateInterviewQuestions({
          interview_id: interviewId,
          setup_id: 0,
          role: selectedRole,
          experience,
          difficulty,
          skills,
          profile_option: profileOption,
          top_k: 6,
        });
        const usable = (generated.questions || []).filter((q) => q.question);
        if (usable.length > 0) {
          setQuestions(usable.map((q) => q.question));
          setQuestionSignals(usable.map((q) => q.expected_signals || []));
          return;
        }
        throw new Error("empty question set");
      } catch {
        // Fallback path: retrieve context and build questions client-side.
        try {
          const response = await retrieveInterviewContext({
            interview_id: interviewId,
            setup_id: 0,
            role: selectedRole,
            experience,
            difficulty,
            skills,
            profile_option: profileOption,
            query: "Generate practical interview prompts from resume context covering projects, skills, architecture, debugging, and communication.",
            top_k: 6,
          });
          setQuestions(buildQuestionsFromContext(response.context_pack || [], selectedRole, difficulty, skills));
        } catch {
          setQuestions(buildQuestionsFromContext([], selectedRole, difficulty, skills));
          setQuestionError("Resume context is unavailable right now. Using a fallback question set.");
        }
      } finally {
        setIsGeneratingQuestions(false);
      }
    };
    void load();
  }, [interviewId, selectedRole, experience, difficulty, profileOption, skills, questions.length]);

  // Transcript feed follows the conversation.
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [currentQuestionIdx, answerDraft, interimTranscript, finalizedAnswers, isGeneratingQuestions]);

  // Guard: no active session (direct navigation or refresh before interviewId was persisted)
  if (!interviewId && !isGeneratingQuestions) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem-1px)] items-center justify-center bg-ph-bg px-6 font-st-body text-ph-ink">
        <div className={`w-full max-w-md rounded-[2rem] bg-ph-surface p-8 text-center ${RAISED}`}>
          <h2 className="font-st-display text-[24px] font-semibold leading-8 text-ph-ink">No active interview session</h2>
          <p className="mt-2 text-[14px] leading-5 text-ph-ink-muted">
            Your session was not found. Go through the setup steps to start a new interview.
          </p>
          <button type="button" onClick={() => navigate("/interview/select-role")} className={`${LABEL_MD} ${CTA} mt-6 rounded-full px-6 py-2`}>
            Start a new interview
          </button>
        </div>
      </div>
    );
  }

  const total = Math.max(questions.length, 1);
  const liveAnswer = [answerDraft, interimTranscript].filter(Boolean).join(" ").trim();
  const signals = questionSignals[currentQuestionIdx] ?? [];
  const timeLow = questionTimeLeft <= 20;
  const statusMessage = questionError || submitMessage || (!recognitionSupported ? "Speech recognition is not supported in this browser." : null);

  return (
    <div className="min-h-[calc(100vh-3.5rem-1px)] bg-ph-bg font-st-body text-[14px] leading-5 text-ph-ink antialiased">
      {/* Session utility bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4 bg-black px-4 py-2 shadow-md sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/interview/quick-setup")}
            className={`${LABEL_MD} flex items-center gap-1 rounded-full px-2 py-1 text-ph-ink-muted transition-colors hover:bg-ph-surface-2 hover:text-ph-ink`}
          >
            <ArrowLeft size={16} /> Setup
          </button>
          <div
            className={`flex items-center gap-1 rounded-full bg-ph-surface px-4 py-1 ${RECESSED}`}
            title={`Status: ${interviewSetup?.status || "initialized"}`}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-ph-green shadow-[0_0_8px_#00ff41]" />
            <span className={`${LABEL_SM} max-w-[14rem] truncate uppercase tracking-wider text-ph-green`}>
              Interview Session #{interviewId ?? "—"}
            </span>
          </div>
          <div className={`${CODE_SM} hidden items-center gap-1 text-ph-ink-muted sm:flex`}>
            <SquareTerminal size={16} className="text-ph-green" />
            <span>
              {selectedRole ?? "Interview"} · {experience ?? "—"} · {difficulty ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`hidden items-center gap-1 rounded-full bg-ph-surface px-4 py-1 md:flex ${RECESSED}`}>
            <Mic size={16} className={isListening ? "text-ph-green" : "text-ph-ink-soft"} />
            <div className="flex h-3 items-center gap-1 px-1" aria-hidden>
              {["h-2", "h-3", "h-1.5", "h-3", "h-2", "h-3", "h-1"].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full ${isListening ? `${h} bg-ph-green ${i % 2 ? "animate-pulse" : "animate-bounce"}` : "h-1 bg-ph-line-bright"}`}
                />
              ))}
            </div>
            <span className={`${CODE_SM} text-ph-ink-muted`}>{isListening ? "Listening" : "Mic idle"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-ph-surface-2 px-2 py-1" title="Time left on this question">
              <CircleDot size={16} className={timeLow ? "animate-pulse text-ph-green" : "text-ph-ink-soft"} />
              <span className={`${CODE_SM} font-semibold tabular-nums ${timeLow ? "ph-glow text-ph-green" : "text-ph-ink"}`}>
                {formatTimer(questionTimeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-ph-green/10 px-2 py-1">
              <span className={`${LABEL_SM} font-bold uppercase tracking-wider text-ph-green`}>
                Question {Math.min(currentQuestionIdx + 1, total)} / {total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Three-pane grid */}
      <div className="grid w-full grid-cols-1 items-start gap-6 px-4 py-4 sm:px-8 xl:grid-cols-12">
        {/* LEFT: interviewer, camera, question roadmap */}
        <aside className="flex flex-col gap-4 xl:col-span-4">
          <div className={`relative flex flex-col gap-2 overflow-hidden rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-ph-green/10 blur-xl" />
            <div className="flex items-center justify-between">
              <span className={`${LABEL_SM} uppercase tracking-wider text-ph-ink-soft`}>AI Lead Evaluator</span>
              <span className={`${CODE_SM} flex items-center gap-1 rounded-full bg-ph-surface-2 px-1 py-0.5 text-ph-green`}>
                <span className="h-1.5 w-1.5 rounded-full bg-ph-green" /> {isGeneratingQuestions ? "Preparing" : "Active"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative shrink-0">
                <img src={alexChen} alt="Alex Chen" className="ph-tint h-12 w-12 rounded-full border border-ph-green/30 object-cover" />
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ph-green-container shadow-md">
                  <Bot size={10} className="text-ph-green-soft" />
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className={`${H_SM} truncate font-semibold text-ph-ink`}>Alex Chen</span>
                <span className={`${BODY_SM} truncate text-ph-ink-muted`}>{selectedRole ?? "Technical"} Interviewer AI</span>
              </div>
            </div>
            <div className={`mt-1 rounded-2xl bg-black p-2 ${RECESSED}`}>
              {isGeneratingQuestions ? (
                <p className={`${LABEL_MD} flex items-center gap-2 leading-relaxed text-ph-ink-muted`}>
                  <Loader2 size={14} className="animate-spin" /> Generating questions from your resume…
                </p>
              ) : (
                <p className={`${LABEL_MD} italic leading-relaxed text-ph-ink/90`}>“{currentQuestion || "No question available yet."}”</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => speakText(currentQuestion)}
              disabled={!currentQuestion}
              className={`${LABEL_MD} flex items-center justify-center gap-1 rounded-full bg-ph-surface-2 py-1.5 text-ph-ink transition-colors hover:text-ph-green disabled:opacity-50`}
            >
              <Volume2 size={16} /> Read question aloud
            </button>
          </div>

          <div className={`flex flex-col gap-2 rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <div className="flex items-center justify-between">
              <span className={`${LABEL_SM} uppercase tracking-wider text-ph-ink-soft`}>Your Camera</span>
              <span className={`${CODE_SM} flex items-center gap-1 ${cameraReady ? "text-ph-green" : "text-ph-ink-soft"}`}>
                <Video size={14} /> {cameraReady ? "Live" : "Initialising"}
              </span>
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`aspect-video w-full rounded-2xl bg-black object-cover ${RECESSED}`}
            />
            {mediaError ? <p className={`${BODY_SM} text-ph-ink`}>{mediaError}</p> : null}
          </div>

          <div className={`flex flex-col gap-2 rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <div className="flex items-center justify-between">
              <span className={`${H_SM} font-semibold text-ph-ink`}>Evaluation Stages</span>
              <span className={`${CODE_SM} text-ph-green`}>
                {Math.min(currentQuestionIdx + 1, total)} / {total}
              </span>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {questions.length === 0 && <p className={`${BODY_SM} p-1 text-ph-ink-soft`}>Questions appear here once generated.</p>}
              {questions.map((q, idx) => {
                const answer = finalizedAnswers[idx];
                if (idx === currentQuestionIdx) {
                  return (
                    <div key={idx} className="flex items-center gap-2 rounded-[2rem] bg-ph-surface-2 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ph-green/15">
                        <span className={`${CODE_SM} font-bold text-ph-green`}>{idx + 1}</span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className={`${LABEL_MD} truncate font-bold text-ph-green`}>{q}</span>
                        <span className={`${CODE_SM} flex items-center gap-1 text-ph-green`}>
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ph-green" /> {isListening ? "Recording answer" : "In Evaluation"}
                        </span>
                      </div>
                    </div>
                  );
                }
                if (idx < currentQuestionIdx || answer) {
                  return (
                    <div key={idx} className="flex items-center gap-2 rounded-2xl bg-ph-surface-2/40 p-1 text-ph-ink-muted">
                      <CircleCheck size={18} className="shrink-0 text-ph-green" />
                      <div className="flex min-w-0 flex-col">
                        <span className={`${LABEL_MD} truncate text-ph-ink-soft line-through`}>
                          Question {idx + 1}: {q}
                        </span>
                        <span className={`${CODE_SM} text-ph-ink-soft`}>Answered · {wordCount(answer)} words</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className={`flex items-center gap-2 rounded-2xl p-1 text-ph-ink-muted ${idx === currentQuestionIdx + 1 ? "opacity-50" : "opacity-40"}`}>
                    <Circle size={18} className="shrink-0 text-ph-ink-soft" />
                    <div className="flex min-w-0 flex-col">
                      <span className={`${LABEL_MD} truncate`}>
                        Question {idx + 1}: {q}
                      </span>
                      <span className={`${CODE_SM} text-ph-ink-soft`}>Queued</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </aside>


        {/* RIGHT: live transcript, answer input, hints, decisions */}
        <aside className="flex flex-col gap-4 xl:col-span-8">
          <div className={`flex h-[480px] flex-col gap-2 rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1">
                <MessagesSquare size={18} className="text-ph-green" />
                <span className={`${H_SM} font-semibold text-ph-ink`}>Live Transcription</span>
              </div>
              <span className={`h-2 w-2 rounded-full ${isListening ? "animate-ping bg-ph-green" : "bg-ph-line-bright"}`} />
            </div>
            <div ref={feedRef} className={`${BODY_SM} flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black p-1 pr-1 ${RECESSED}`}>
              {isGeneratingQuestions && (
                <p className="flex items-center gap-2 p-2 text-ph-ink-muted">
                  <Loader2 size={14} className="animate-spin" /> Generating questions from your resume…
                </p>
              )}
              {questions.slice(0, currentQuestionIdx + 1).map((q, idx) => {
                const answer = idx === currentQuestionIdx ? finalizedAnswers[idx] || liveAnswer : finalizedAnswers[idx];
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex flex-col items-start gap-1">
                      <div className={`${LABEL_SM} flex items-center gap-1 text-ph-green`}>
                        <Bot size={12} /> Alex Chen (AI)
                        <span className="ml-1 text-[10px] text-ph-ink-soft">Q{idx + 1}</span>
                      </div>
                      <div className="rounded-[2rem] bg-ph-surface-2 p-2 text-ph-ink shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
                        “{q}”
                      </div>
                    </div>
                    {answer ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className={`${LABEL_SM} flex items-center gap-1 text-ph-green`}>
                          Candidate (You) <User size={12} />
                          <span className="ml-1 text-[10px] text-ph-ink-soft">
                            {idx === currentQuestionIdx && !finalizedAnswers[idx] ? (isListening ? "Live" : "Draft") : `A${idx + 1}`}
                          </span>
                        </div>
                        <div className="rounded-[2rem] border border-ph-green/40 bg-ph-green/10 p-2 text-ph-green shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
                          “{answer}”
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="pt-1">
              <div className={`flex items-end gap-1 rounded-[1.5rem] bg-black px-2 py-1.5 text-ph-ink-muted ${RECESSED}`}>
                <button
                  type="button"
                  onClick={isListening ? stopListening : () => void startListening()}
                  disabled={interviewSubmitted}
                  aria-label={isListening ? "Stop recording" : "Start recording"}
                  title={isListening ? "Stop recording" : "Start recording"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
 isListening ? "bg-ph-green/15 text-ph-green shadow-[0_0_12px_rgba(0,255,65,0.35)]" : "bg-ph-surface-2 text-ph-ink-soft"
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <AudioLines size={16} />}
                </button>
                <textarea
                  value={editableTranscript}
                  onChange={(e) => {
                    setEditableTranscript(e.target.value);
                    setIsTranscriptEdited(true);
                  }}
                  rows={3}
                  aria-label="Your answer"
                  placeholder={isListening ? "Listening… speak your answer" : "Speak or type your answer..."}
                  className={`${BODY_SM} max-h-40 min-h-[1.75rem] w-full resize-none border-0 bg-transparent py-1 text-ph-ink outline-none placeholder:text-ph-ink-soft`}
                />
                <button
                  type="button"
                  onClick={() => handleAdvanceQuestion()}
                  disabled={isGeneratingQuestions || interviewSubmitted || questions.length === 0}
                  aria-label={isLastQuestion ? "Save answer" : "Save answer and go to next question"}
                  title={isLastQuestion ? "Save answer" : "Next question"}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ph-green/15 text-ph-green transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <SendHorizontal size={14} />
                </button>
              </div>
              <p className={`${BODY_SM} mt-1 px-2 text-ph-ink-soft`}>Auto-advances after {SILENCE_AUTO_ADVANCE_MS / 1000}s of silence.</p>
            </div>
          </div>

          <div className={`flex flex-col gap-2 rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <span className={`${LABEL_SM} uppercase tracking-wider text-ph-ink-soft`}>Tactical Prompt Suggestions</span>
            <div className="mt-1 flex flex-col gap-1">
              {(signals.length > 0 ? signals.slice(0, 3).map((s) => `Cover: ${s}`) : FALLBACK_TIPS).map((tip, i) => (
                <div
                  key={tip}
                  className={`${BODY_SM} flex items-start gap-2 rounded-[2rem] bg-ph-surface-2 p-1 text-ph-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}
                >
                  <Lightbulb size={16} className={`mt-0.5 shrink-0 ${i % 2 ? "text-ph-green" : "text-ph-green"}`} />
                  <span>“{tip}”</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex flex-col gap-2 rounded-[2rem] bg-ph-surface p-4 ${RAISED}`}>
            <span className={`${LABEL_SM} uppercase tracking-wider text-ph-ink-soft`}>Calibration Decisions</span>
            <button
              type="button"
              onClick={() => void handleSubmitInterview()}
              disabled={isSubmittingInterview || interviewSubmitted}
              className={`${LABEL_MD} ${CTA} flex w-full items-center justify-center gap-1 rounded-full py-2 font-semibold disabled:opacity-60`}
            >
              {isSubmittingInterview ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
              {interviewSubmitted ? "Submitted" : "Submit Interview for Grading"}
            </button>
            <button
              type="button"
              onClick={() => handleAdvanceQuestion()}
              disabled={isGeneratingQuestions || interviewSubmitted || questions.length === 0 || isLastQuestion}
              className={`${LABEL_MD} flex w-full items-center justify-center gap-1 rounded-full bg-ph-surface-2 py-2 font-semibold text-ph-ink transition-all hover:bg-ph-surface-2 hover:text-ph-green disabled:opacity-50`}
            >
              <SkipForward size={16} className="text-ph-green" /> Next Question
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`${LABEL_MD} flex w-full items-center justify-center gap-1 rounded-full py-1 text-ph-ink transition-colors hover:bg-ph-ink/10`}
            >
              <Power size={16} /> End Interview Session
            </button>
            {statusMessage ? <p className={`${BODY_SM} px-1 text-center text-ph-ink`}>{statusMessage}</p> : null}
          </div>
        </aside>
      </div>

    </div>
  );
}
