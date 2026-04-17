import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/use-theme";
import { useInterview } from "@/contexts/use-interview";
import { ArrowLeft, CheckCircle2, Loader2, Mic, MicOff, Timer, Video, Volume2 } from "lucide-react";
import { retrieveInterviewContext, submitInterview } from "@/api/interviewService";
import type { RetrievedContextChunk } from "@/types/api";

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
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { interviewId, interviewSetup, selectedRole, profileOption, experience, difficulty, skills } = useInterview();

  const [questions, setQuestions] = useState<string[]>([]);
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
  const recordingStartAtRef = useRef<number | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const recognitionSupported = useMemo(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition), []);
  const currentQuestion = questions[currentQuestionIdx] || "";
  const isLastQuestion = currentQuestionIdx >= questions.length - 1;

  const payloadPreview = useMemo(
    () => ({ setup_id: 0, role: selectedRole, profile_option: profileOption, experience, difficulty, skills }),
    [selectedRole, profileOption, experience, difficulty, skills]
  );

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
    if (mediaStreamRef.current) return mediaStreamRef.current;
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
    if (!interviewId) return;
    const answers = finalizedAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
      acc[`q_${idx + 1}`] = ans;
      return acc;
    }, {});
    if (Object.keys(answers).length === 0) {
      setSubmitMessage("Please record at least one answer before submitting.");
      return;
    }
    try {
      setIsSubmittingInterview(true);
      setSubmitMessage(null);
      await submitInterview(interviewId, { answers, completed_at: new Date().toISOString() });
      setInterviewSubmitted(true);
      setSubmitMessage("Interview submitted successfully.");
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Failed to submit interview.");
    } finally {
      setIsSubmittingInterview(false);
    }
  }, [finalizedAnswers, interviewId]);

  useEffect(() => {
    void ensureMediaReady();
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
      stopQuestionRecording(currentQuestionIdx);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      questionRecordings.forEach((r) => r?.url && URL.revokeObjectURL(r.url));
      window.speechSynthesis?.cancel();
    };
  }, [clearSilenceTimer, currentQuestionIdx, ensureMediaReady, questionRecordings, stopQuestionRecording]);

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
      } catch (err) {
        setQuestions(buildQuestionsFromContext([], selectedRole, difficulty, skills));
        setQuestionError(`${err instanceof Error ? err.message : "Failed to load context questions"} Using fallback question set.`);
      } finally {
        setIsGeneratingQuestions(false);
      }
    };
    void load();
  }, [interviewId, selectedRole, experience, difficulty, profileOption, skills, questions.length]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"}`}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: -3 }} onClick={() => navigate("/interview/quick-setup")} className={`flex items-center gap-2 text-sm mb-8 transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
          <ArrowLeft size={16} />Back to Quick Search
        </motion.button>

        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Interview Now</h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>One-by-one questions with timer, live transcript, editable verification, and per-question recordings.</p>
        </motion.div>

        <div className={`rounded-2xl p-6 border mb-5 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className={isDark ? "text-emerald-400" : "text-emerald-600"} /><h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Setup Saved</h2></div>
          <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Interview ID: <span className={`font-semibold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>{interviewId || "Not available"}</span></p>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status: {interviewSetup?.status || "initialized"}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className={`rounded-2xl p-6 border ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
            <h3 className={`text-base font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Saved Payload JSON</h3>
            <pre className={`text-xs p-4 rounded-xl overflow-x-auto ${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-700"}`}>{JSON.stringify(payloadPreview, null, 2)}</pre>
          </div>
          <div className={`rounded-2xl p-6 border ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="flex items-center justify-between mb-2"><h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Camera + Audio</h3><span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}><Video size={14} className="inline mr-1" />{cameraReady ? "Ready" : "Initializing"}</span></div>
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-44 object-cover rounded-xl ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
            {mediaError ? <p className={`text-xs mt-2 ${isDark ? "text-amber-300" : "text-amber-700"}`}>{mediaError}</p> : null}
          </div>
        </div>

        <div className={`rounded-2xl p-6 border mt-5 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Live Interview</h3>
            <div className="flex items-center gap-4">
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Question {Math.min(currentQuestionIdx + 1, Math.max(questions.length, 1))} / {Math.max(questions.length, 1)}</p>
              <p className={`text-sm font-semibold ${questionTimeLeft <= 20 ? "text-rose-500" : isDark ? "text-cyan-300" : "text-cyan-700"}`}><Timer size={14} className="inline mr-1" />{formatTimer(questionTimeLeft)}</p>
            </div>
          </div>

          {isGeneratingQuestions ? (
            <div className={`rounded-xl p-4 flex items-center gap-2 ${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-700"}`}><Loader2 size={16} className="animate-spin" />Generating interview questions from context...</div>
          ) : (
            <>
              <div className={`rounded-xl p-4 mb-4 ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-800"}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Current Question</p>
                <p className="text-sm leading-relaxed">{currentQuestion || "No question available yet."}</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <button onClick={() => speakText(currentQuestion)} disabled={!currentQuestion} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"><Volume2 size={16} />Speak Question</button>
                <button onClick={isListening ? stopListening : () => void startListening()} disabled={interviewSubmitted} className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2 ${isListening ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>{isListening ? <MicOff size={16} /> : <Mic size={16} />}{isListening ? "Stop Listening" : "Start Listening"}</button>
                <button onClick={() => handleAdvanceQuestion()} disabled={isGeneratingQuestions || interviewSubmitted || questions.length === 0} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">Next Question</button>
              </div>

              <div className={`rounded-xl p-4 mb-4 ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-800"}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Live Transcript</p>
                <p className="text-sm min-h-10 whitespace-pre-wrap mb-2">{[answerDraft, interimTranscript].filter(Boolean).join(" ").trim() || "Start listening to see realtime transcript..."}</p>
                <textarea
                  value={editableTranscript}
                  onChange={(e) => {
                    setEditableTranscript(e.target.value);
                    setIsTranscriptEdited(true);
                  }}
                  rows={4}
                  className={`w-full rounded-lg p-3 text-sm outline-none ${isDark ? "bg-slate-900 text-slate-200 border border-slate-700" : "bg-white text-slate-800 border border-slate-200"}`}
                  placeholder="Edit transcript for verification before save..."
                />
                <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Auto-advance on silence after {SILENCE_AUTO_ADVANCE_MS / 1000}s.</p>
              </div>

              <div className={`rounded-xl p-4 ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-800"}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Captured Answers + Recordings</p>
                {finalizedAnswers.length === 0 ? <p className="text-sm opacity-80">No finalized answer yet.</p> : (
                  <div className="space-y-3">
                    {finalizedAnswers.map((answer, idx) => (
                      <div key={`ans-${idx}`} className={`text-sm p-3 rounded-lg ${isDark ? "bg-slate-900" : "bg-white border border-slate-200"}`}>
                        <p className="font-semibold mb-1">Q{idx + 1}</p>
                        <p className="opacity-90 whitespace-pre-wrap mb-2">{answer}</p>
                        {questionRecordings[idx]?.url ? (
                          <div>
                            <audio controls src={questionRecordings[idx]?.url} />
                            <p className="text-xs opacity-70">Recording length: {questionRecordings[idx]?.durationSec}s</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 mt-5">
                <button onClick={() => void handleSubmitInterview()} disabled={isSubmittingInterview || interviewSubmitted} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">{isSubmittingInterview ? <Loader2 size={16} className="animate-spin" /> : null}{interviewSubmitted ? "Interview Submitted" : "Submit Interview"}</button>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800">Go to Dashboard</button>
              </div>
            </>
          )}

          {(questionError || submitMessage || !recognitionSupported) ? (
            <div className={`mt-4 text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>
              {questionError || submitMessage || "Speech recognition is not supported in this browser."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
