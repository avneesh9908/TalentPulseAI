import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInterview } from "@/contexts/use-interview";
import {
  UserCircle2, Upload, FileText, ArrowLeft, ChevronRight,
  X, AlertCircle, Loader, Check, ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INTERVIEW_STEPS } from "./steps";

type ProfileOption = "existing" | "upload" | null;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      if (typeof value !== "string") {
        reject(new Error("Failed to read selected file"));
        return;
      }
      const commaIndex = value.indexOf(",");
      resolve(commaIndex >= 0 ? value.slice(commaIndex + 1) : value);
    };
    reader.onerror = () => reject(new Error("Failed to read selected file"));
    reader.readAsDataURL(file);
  });

function ProfileOptionCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeTone,
  disabled,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  badgeTone?: "neutral" | "success";
  disabled?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative h-full rounded-lg border p-6 text-left transition-[border-color,box-shadow,transform] duration-200 ${
        disabled
          ? "cursor-not-allowed border-border bg-surface opacity-60"
          : selected
            ? "border-accent bg-accent-soft/40 shadow-e2"
            : "border-border bg-canvas hover:-translate-y-0.5 hover:border-border-strong hover:shadow-e2"
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4">
          <Badge tone={badgeTone === "success" ? "success" : "neutral"} size="sm">
            {badge}
          </Badge>
        </span>
      )}

      <span
        className={`flex h-11 w-11 items-center justify-center rounded-md ${
          selected ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted"
        }`}
      >
        <Icon size={20} />
      </span>

      <h3 className="mt-4 flex items-center gap-2 text-h4 font-semibold text-ink">
        {title}
        {selected && <Check size={15} className="text-accent-text" strokeWidth={3} />}
      </h3>
      <p className="mt-1.5 text-small text-ink-muted">{description}</p>
    </button>
  );
}

function UploadZone({
  file,
  onFile,
  onClear,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") onFile(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
          <FileText size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-ink">{file.name}</p>
          <p className="text-small text-ink-muted">
            {(file.size / 1024).toFixed(1)} KB · ready to analyse
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Remove file">
          <X />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`w-full rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging
          ? "border-accent bg-accent-soft"
          : "border-border-strong bg-surface hover:border-accent/60"
      }`}
    >
      <input ref={ref} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-canvas text-ink-muted">
        <Upload size={20} />
      </span>
      <p className="text-body font-medium text-ink">Drop your resume here</p>
      <p className="mt-1 text-small text-ink-muted">
        or <span className="text-accent-text">click to browse</span>
      </p>
      <p className="mt-2 text-small text-ink-subtle">PDF only · max 5 MB</p>
    </button>
  );
}

export default function SelectProfilePage() {
  const navigate = useNavigate();
  const {
    selectedRole,
    saveProfile,
    saveResumeUpload,
    clearResumeUpload,
    isLoading,
    error,
    clearError,
  } = useInterview();

  // Hooks run before the step guard — an early return above them would change
  // hook order between renders.
  const [selected, setSelected] = useState<ProfileOption>(null);
  const [file, setFile] = useState<File | null>(null);

  // Guard: must have completed step 1 before arriving here
  if (!selectedRole) {
    navigate("/interview/select-role", { replace: true });
    return null;
  }

  const canContinue = selected === "existing" || (selected === "upload" && file !== null);

  const handleFileSelected = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      return;
    }
    const base64Pdf = await fileToBase64(selectedFile);
    setFile(selectedFile);
    saveResumeUpload({
      fileName: selectedFile.name,
      mimeType: selectedFile.type || "application/pdf",
      base64Pdf,
    });
  };

  const handleFileCleared = () => {
    setFile(null);
    clearResumeUpload();
  };

  // Handle continue - save to local state only
  const handleContinue = async () => {
    if (!selected) return;
    try {
      clearError();

      // 1. Save profile option to local state
      saveProfile(selected);

      // 2. Navigate to quick setup (final step)
      navigate("/interview/quick-setup");
    } catch (err) {
      console.error("Error saving profile:", err);
      // Error is already set in context
    }
  };

  const options = [
    {
      id: "existing" as ProfileOption,
      icon: UserCircle2,
      title: "Use existing profile",
      description: "Load the resume and skills already on your account.",
      badge: "Coming soon",
      badgeTone: "neutral" as const,
      disabled: true,
    },
    {
      id: "upload" as ProfileOption,
      icon: Upload,
      title: "Upload a new resume",
      description: "Upload a PDF; we extract your skills and experience and build the questions from them.",
      badge: "Available",
      badgeTone: "success" as const,
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 mb-6"
          onClick={() => navigate("/interview/select-role")}
        >
          <ArrowLeft /> Back to role selection
        </Button>

        <PageHeader
          eyebrow="Step 2 of 4"
          title="Add your resume"
          description="Questions are written from your own experience, so the interview needs a resume to read."
        />

        <div className="mt-6">
          <Stepper steps={INTERVIEW_STEPS} current={1} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {options.map((opt) => (
            <ProfileOptionCard
              key={opt.id}
              {...opt}
              selected={selected === opt.id}
              onClick={() => {
                setSelected(opt.id);
                if (opt.id !== "upload") handleFileCleared();
              }}
            />
          ))}
        </div>

        <AnimatePresence>
          {selected === "upload" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                <UploadZone file={file} onFile={handleFileSelected} onClear={handleFileCleared} />

                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-canvas p-4">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ink-subtle" />
                  <p className="text-small text-ink-muted">
                    Your name, contact details and location are stripped out before anything is
                    indexed. You can review and adjust the extracted skills on the next step.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          <Button size="lg" disabled={!canContinue || isLoading} onClick={handleContinue}>
            {isLoading ? (
              <>
                <Loader className="animate-spin" /> Loading…
              </>
            ) : (
              <>
                Continue to setup <ChevronRight />
              </>
            )}
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
            <div className="flex-1">
              <p className="text-small font-medium text-danger">Something went wrong</p>
              <p className="mt-0.5 text-small text-ink-muted">{error}</p>
            </div>
            <button
              onClick={clearError}
              aria-label="Dismiss"
              className="text-ink-subtle transition-colors hover:text-ink"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
