/*
 * UI: Stitch design system (2026-09-24) — restyle only; copy, steps and logic are
 * unchanged from docs/backup/select-role-before-stitch.tsx.txt.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInterview } from "@/contexts/use-interview";
import {
  Code2, Server, Brain, Layers, Database, Smartphone, Shield, Cloud,
  ChevronRight, Search, ArrowLeft, Loader, Check,
} from "lucide-react";
import { Badge, Button, EmptyState, ErrorAlert, PageHeader, Panel, StPage, Stepper, TextInput } from "@/components/phos/controls";
import { INTERVIEW_STEPS } from "./steps";

const roles = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "React, Vue, TypeScript, CSS, performance and UI architecture",
    icon: Code2,
    tags: ["React", "TypeScript", "CSS", "Next.js"],
    level: "Beginner → Senior",
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Node.js, REST APIs, microservices, auth and scalability",
    icon: Server,
    tags: ["Node.js", "APIs", "SQL", "Redis"],
    level: "Beginner → Senior",
  },
  {
    id: "ml",
    title: "ML / AI Engineer",
    description: "Machine learning, deep learning, NLP, model deployment",
    icon: Brain,
    tags: ["Python", "PyTorch", "LLMs", "MLOps"],
    level: "Intermediate → Senior",
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description: "End-to-end development across frontend and backend",
    icon: Layers,
    tags: ["React", "Node.js", "PostgreSQL", "Docker"],
    level: "Beginner → Senior",
  },
  {
    id: "data",
    title: "Data Engineer",
    description: "Pipelines, warehouses, ETL, Spark, Kafka and analytics",
    icon: Database,
    tags: ["Python", "Spark", "Kafka", "Airflow"],
    level: "Intermediate → Senior",
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    description: "iOS and Android, React Native, Flutter, store deployment",
    icon: Smartphone,
    tags: ["React Native", "Flutter", "Swift", "Kotlin"],
    level: "Beginner → Senior",
  },
  {
    id: "devops",
    title: "DevOps / SRE",
    description: "CI/CD, Kubernetes, cloud infra, monitoring and reliability",
    icon: Cloud,
    tags: ["Docker", "K8s", "AWS", "Terraform"],
    level: "Intermediate → Senior",
  },
  {
    id: "security",
    title: "Security Engineer",
    description: "AppSec, pen testing, OWASP, threat modelling and compliance",
    icon: Shield,
    tags: ["OWASP", "PenTest", "Auth", "Compliance"],
    level: "Intermediate → Expert",
  },
];

function RoleCard({
  role,
  selected,
  onClick,
}: {
  role: (typeof roles)[0];
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-full rounded-[2rem] p-5 text-left transition-[box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 ${
 selected
          ? "bg-ph-surface-2 border border-ph-green/60 shadow-[0_0_24px_-6px_rgba(0,255,65,0.35)]"
          : "bg-ph-surface border border-ph-line-strong hover:bg-ph-surface-2"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-[2rem] ${
 selected
              ? "bg-ph-green/15 text-ph-green shadow-[0_0_12px_rgba(0,255,65,0.35)]"
              : "bg-black text-ph-green border border-ph-line"
          }`}
        >
          <Icon size={18} />
        </span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ph-green text-black">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>

      <h3 className="mt-4 font-st-display text-[18px] font-semibold leading-[26px] text-ph-ink">{role.title}</h3>
      <p className="mt-1 text-[12px] leading-[18px] text-ph-ink-muted">{role.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {role.tags.map((tag) => (
          <Badge key={tag} tone="neutral" size="sm">{tag}</Badge>
        ))}
      </div>

      <p className="mt-3 text-[12px] font-medium leading-4 text-ph-ink-soft">{role.level}</p>
    </button>
  );
}

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { saveRole, isLoading, error, clearError } = useInterview();

  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = roles.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedRole = roles.find((r) => r.id === selected);

  // Handle continue - save to local state only
  const handleContinue = async () => {
    if (!selected) return;
    try {
      clearError();
      // Save role to local state only
      saveRole(selected);
      // Navigate to next step: Select Profile
      navigate("/interview/select-profile");
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  return (
    <>
      <StPage>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 mb-4"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft /> Back to dashboard
        </Button>

        <PageHeader
          eyebrow="Step 1 of 4"
          title="Select your role"
          description="Choose the role you're interviewing for. Questions are tailored to it, your experience level and your resume."
        />

        <div className="mt-4">
          <Stepper steps={INTERVIEW_STEPS} current={0} />
        </div>

        <div className="relative mt-5 max-w-sm">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ph-ink-soft"
          />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or skills…"
            aria-label="Search roles or skills"
            className="pl-10"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selected === role.id}
              onClick={() => setSelected(selected === role.id ? null : role.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <EmptyState
            className="mt-5"
            icon={<Search size={17} />}
            title="No roles match that search"
            description={`Nothing found for "${search}". Try a skill like "React" or "Python".`}
          />
        )}

        {selected && <div className="h-24" />}
      </StPage>

      {/* Sticky confirm bar */}
      <AnimatePresence>
        {selected && selectedRole && (
          <motion.div
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-5 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <Panel tone="raised" padding="none" className="flex items-center justify-between gap-4 rounded-full border border-ph-green/35 bg-black/90 p-2 pl-3 backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ph-green/10 text-ph-green">
                  <selectedRole.icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-st-display text-[16px] font-semibold text-ph-ink">{selectedRole.title}</p>
                  <p className="truncate text-[12px] text-ph-ink-soft">{selectedRole.level}</p>
                </div>
              </div>
              <Button onClick={handleContinue} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Continue <ChevronRight />
                  </>
                )}
              </Button>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-5 left-5 z-50 max-w-sm font-st-body"
          >
            <ErrorAlert title="Something went wrong" message={error} onDismiss={clearError} className="backdrop-blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
