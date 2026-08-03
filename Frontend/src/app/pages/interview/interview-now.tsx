import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInterview } from "@/contexts/use-interview";
import { ArrowLeft, Loader2, Mic, MicOff, Timer, Video, Volume2 } from "lucide-react";
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

  // Guard: no active session (direct navigation or refresh before interviewId was persisted)
  if (!interviewId && !isGeneratingQuestions) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-surface px-6">
        <Panel tone="raised" padding="lg" className="w-full max-w-md text-center">
          <h2 className="text-h3 font-semibold text-ink">No active interview session</h2>
          <p className="mt-2 text-body text-ink-muted">
            Your session was not found. Go through the setup steps to start a new interview.
          </p>
          <Button className="mt-6" onClick={() => navigate("/interview/select-role")}>
            Start a new interview
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-surface">
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-4 py-3 lg:px-8">
        <div className="mb-2 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="-ml-3" onClick={() => navigate("/interview/quick-setup")}>
            <ArrowLeft /> Back to setup
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-small text-ink-subtle">
              Question {Math.min(currentQuestionIdx + 1, Math.max(questions.length, 1))} of {Math.max(questions.length, 1)}
            </span>
            <Badge tone={questionTimeLeft <= 20 ? "danger" : "neutral"} size="md">
              <Timer size={12} />
              {formatTimer(questionTimeLeft)}
            </Badge>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <Panel padding="sm" className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h4 font-semibold text-ink">Camera</h2>
              <span className="inline-flex items-center gap-1.5 text-small text-ink-subtle">
                <Video size={14} />
                {cameraReady ? "Ready" : "Initialising"}
              </span>
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="min-h-[260px] w-full flex-1 rounded-md bg-surface-strong object-cover"
            />
            {mediaError ? <p className="mt-2 text-small text-warning">{mediaError}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={isListening ? stopListening : () => void startListening()}
                disabled={interviewSubmitted}
                variant={isListening ? "danger" : "primary"}
              >
                {isListening ? <MicOff /> : <Mic />}
                {isListening ? "Stop recording" : "Start recording"}
              </Button>
              <Button variant="secondary" onClick={() => speakText(currentQuestion)} disabled={!currentQuestion}>
                <Volume2 /> Read question
              </Button>
            </div>
            <p className="mt-3 text-small text-ink-subtle">
              Interview {interviewId || "not available"} · {interviewSetup?.status || "initialized"}
            </p>
          </Panel>

          <Panel padding="sm" className="flex h-full min-h-0 flex-col">
            {isGeneratingQuestions ? (
              <div className="flex items-center gap-2 rounded-md bg-surface p-4 text-body text-ink-muted">
                <Loader2 size={16} className="animate-spin" />
                Generating questions from your resume…
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-4 rounded-md bg-surface p-4">
                  <p className="overline mb-2">Current question</p>
                  <p className="text-body text-ink">{currentQuestion || "No question available yet."}</p>
                </div>

                <div className="mb-3 flex min-h-0 flex-1 flex-col rounded-md bg-surface p-4">
                  <p className="overline mb-2">Your answer</p>
                  <p className="mb-2 min-h-10 whitespace-pre-wrap text-small text-ink-muted">
                    {[answerDraft, interimTranscript].filter(Boolean).join(" ").trim() ||
                      "Start recording to see the live transcript…"}
                  </p>
                  <textarea
                    value={editableTranscript}
                    onChange={(e) => {
                      setEditableTranscript(e.target.value);
                      setIsTranscriptEdited(true);
                    }}
                    rows={8}
                    aria-label="Your answer"
                    className="min-h-0 w-full flex-1 rounded-md border border-border-strong bg-canvas p-3 text-body text-ink outline-none focus:border-accent"
                    placeholder="Write or edit your answer here…"
                  />
                  <p className="mt-2 text-small text-ink-subtle">
                    Auto-advances after {SILENCE_AUTO_ADVANCE_MS / 1000}s of silence.
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                  >
                    Leave
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleAdvanceQuestion()}
                    disabled={isGeneratingQuestions || interviewSubmitted || questions.length === 0}
                  >
                    Next question
                  </Button>
                  <Button
                    onClick={() => void handleSubmitInterview()}
                    disabled={isSubmittingInterview || interviewSubmitted}
                  >
                    {isSubmittingInterview ? <Loader2 className="animate-spin" /> : null}
                    {interviewSubmitted ? "Submitted" : "Submit interview"}
                  </Button>
                </div>
              </div>
            )}

            {(questionError || submitMessage || !recognitionSupported) ? (
              <p className="mt-4 text-small text-warning">
                {questionError || submitMessage || "Speech recognition is not supported in this browser."}
              </p>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}
