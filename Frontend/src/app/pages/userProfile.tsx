import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  Menu,
  X,
  Users,
  Calendar,
  BarChart2,
  Bell,
  Trophy,
  TrendingUp,
  Zap,
  Star,
  Activity,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Upload,
  Edit3,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Briefcase,
  GraduationCap,
  Code,
  ArrowLeft,
  Camera,
  ExternalLink,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompletionItem {
  label: string;
  done: boolean;
}

interface EducationEntry {
  id: number;
  degree: string;
  university: string;
  field: string;
  start: string;
  end: string;
  grade: string;
  description: string;
}

interface Skill {
  name: string;
  level: number;
  years: number;
  category: "primary" | "secondary";
}

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  isDark: boolean;
}

interface StarRatingProps {
  level: number;
  isDark: boolean;
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface TabProps {
  isDark: boolean;
}

interface ActivityCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const user = {
  name: "Alex Johnson",
  headline: "Frontend Developer & AI Enthusiast",
  email: "alex.johnson@gmail.com",
  phone: "+44 7700 900123",
  location: "London, UK",
  dob: "12 May 1998",
  nationality: "British",
  experience: "3 Years",
  bio: "Passionate frontend developer with a love for building clean, performant UIs. Currently focused on React, TypeScript, and system design for scalable products.",
  linkedin: "linkedin.com/in/alexjohnson",
  github: "github.com/alexjohnson",
  portfolio: "alexjohnson.dev",
  profileCompletion: 78,
  completionItems: [
    { label: "Profile Photo", done: true },
    { label: "Resume Uploaded", done: true },
    { label: "Skills Added", done: true },
    { label: "Portfolio URL", done: false },
    { label: "Certifications", done: false },
    { label: "Career Preferences", done: true },
  ] as CompletionItem[],
};

const education: EducationEntry[] = [
  {
    id: 1,
    degree: "B.Tech Computer Science",
    university: "IIT Delhi",
    field: "Computer Science",
    start: "2019",
    end: "2023",
    grade: "8.2 CGPA",
    description: "Focused on algorithms, distributed systems, and web technologies.",
  },
  {
    id: 2,
    degree: "Higher Secondary (12th)",
    university: "Delhi Public School",
    field: "Science (PCM)",
    start: "2017",
    end: "2019",
    grade: "94.6%",
    description: "",
  },
];

const skills: Skill[] = [
  { name: "React", level: 4, years: 3, category: "primary" },
  { name: "JavaScript", level: 4, years: 4, category: "primary" },
  { name: "TypeScript", level: 3, years: 2, category: "primary" },
  { name: "System Design", level: 3, years: 2, category: "primary" },
  { name: "Python", level: 3, years: 2, category: "secondary" },
  { name: "SQL", level: 3, years: 2, category: "secondary" },
  { name: "Node.js", level: 2, years: 1, category: "secondary" },
  { name: "Machine Learning", level: 2, years: 1, category: "secondary" },
];

const documents: Document[] = [
  { id: 1, name: "Resume_Alex_Johnson.pdf", type: "Resume", date: "2025-11-01", size: "284 KB" },
  { id: 2, name: "AWS_Cloud_Practitioner.pdf", type: "Certificate", date: "2025-09-14", size: "156 KB" },
  { id: 3, name: "React_Advanced_Cert.pdf", type: "Certificate", date: "2025-07-22", size: "198 KB" },
];

const preferences = {
  role: "Frontend Developer",
  location: "Remote / Europe",
  jobType: "Full Time",
  noticePeriod: "30 days",
  salary: "$80,000",
  workMode: "Remote",
};

const skillRadar = [
  { skill: "Problem Solving", score: 90 },
  { skill: "Communication", score: 70 },
  { skill: "Coding", score: 78 },
  { skill: "System Design", score: 60 },
  { skill: "Domain Knowledge", score: 74 },
];

const activityData = {
  total: 24,
  best: 90,
  passRate: "62%",
  topSkill: "Problem Solving",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className = "", isDark }: GlassCardProps) {
  return (
    <div
      className={`${
        isDark
          ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10"
          : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
      } rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function StarRating({ level, isDark }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= level
              ? "text-yellow-400 fill-yellow-400"
              : isDark
              ? "text-slate-600"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function TabButton({ label, active, onClick, isDark }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg"
          : isDark
          ? "text-slate-400 hover:text-white hover:bg-white/5"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ isDark, toggleTheme, collapsed, setCollapsed }: SidebarProps) {
  const navItems: { icon: LucideIcon; label: string }[] = [
    { icon: BarChart2, label: "Dashboard" },
    { icon: Users, label: "My Interviews" },
    { icon: Calendar, label: "Schedule" },
    { icon: Trophy, label: "Achievements" },
    { icon: Bell, label: "Notifications" },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`${
          isDark
            ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10"
            : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
        } rounded-2xl p-4 mb-4`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          {!collapsed && (
            <div>
              <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                TalentPulse
              </div>
              <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                AI Interview Coach
              </div>
            </div>
          )}
        </div>

        <nav>
          <ul className="flex flex-col gap-2">
            {navItems.map((item, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 4 }}
                className={`py-3 px-3 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                  isDark
                    ? "hover:bg-white/5 text-slate-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </motion.li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-auto space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className={`w-full py-3 rounded-xl transition font-semibold shadow-lg ${
            isDark
              ? "bg-slate-800/50 hover:bg-slate-700/50 text-white border border-white/10"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
          }`}
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed((s) => !s)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition text-white font-semibold shadow-lg"
        >
          {collapsed ? "→" : "Collapse"}
        </motion.button>
      </div>
    </motion.aside>
  );
}

// ─── Tab Content Components ───────────────────────────────────────────────────

function OverviewTab({ isDark }: TabProps) {
  return (
    <div className="space-y-6">
      <GlassCard isDark={isDark}>
        <h3
          className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Users size={18} className="text-cyan-400" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Phone", value: user.phone },
            { label: "Location", value: user.location },
            { label: "Date of Birth", value: user.dob },
            { label: "Nationality", value: user.nationality },
            { label: "Experience", value: user.experience },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl ${
                isDark
                  ? "bg-slate-800/50 border border-white/5"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {item.label}
              </div>
              <div
                className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard isDark={isDark}>
        <h3
          className={`text-lg font-bold mb-3 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Edit3 size={18} className="text-violet-400" /> Bio
        </h3>
        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-gray-700"}`}>
          {user.bio}
        </p>
      </GlassCard>

      <GlassCard isDark={isDark}>
        <h3
          className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Globe size={18} className="text-emerald-400" /> Links & Profiles
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { icon: Linkedin, label: "LinkedIn", value: user.linkedin, color: "text-blue-400" },
            {
              icon: Github,
              label: "GitHub",
              value: user.github,
              color: isDark ? "text-white" : "text-gray-900",
            },
            {
              icon: Globe,
              label: "Portfolio",
              value: user.portfolio,
              color: "text-emerald-400",
            },
          ].map((link, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl ${
                isDark
                  ? "bg-slate-800/50 border border-white/5"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={16} className={link.color} />
                <div>
                  <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {link.label}
                  </div>
                  <div
                    className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {link.value}
                  </div>
                </div>
              </div>
              <ExternalLink size={14} className={isDark ? "text-slate-500" : "text-gray-400"} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function EducationTab({ isDark }: TabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Education History
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg"
        >
          <Plus size={16} /> Add
        </motion.button>
      </div>

      {education.map((edu, i) => (
        <motion.div
          key={edu.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <GlassCard isDark={isDark}>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <GraduationCap size={22} className="text-violet-400" />
                </div>
                <div>
                  <div
                    className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {edu.degree}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    {edu.university}
                  </div>
                  <div
                    className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    {edu.field} • {edu.start} – {edu.end}
                  </div>
                  {edu.description && (
                    <p
                      className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}
                    >
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-full shrink-0 ${
                  isDark
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {edu.grade}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

function SkillsTab({ isDark }: TabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Skills
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg"
        >
          <Plus size={16} /> Add Skill
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard isDark={isDark}>
          <h4
            className={`text-sm font-bold mb-4 uppercase tracking-wider ${
              isDark ? "text-cyan-400" : "text-cyan-600"
            }`}
          >
            Primary Skills
          </h4>
          <div className="flex flex-col gap-3">
            {skills
              .filter((s) => s.category === "primary")
              .map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    isDark
                      ? "bg-slate-800/50 border border-white/5"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Code size={14} className="text-violet-400" />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {skill.name}
                      </div>
                      <div
                        className={`text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}
                      >
                        {skill.years}y exp
                      </div>
                    </div>
                  </div>
                  <StarRating level={skill.level} isDark={isDark} />
                </motion.div>
              ))}
          </div>
        </GlassCard>

        <GlassCard isDark={isDark}>
          <h4
            className={`text-sm font-bold mb-4 uppercase tracking-wider ${
              isDark ? "text-violet-400" : "text-violet-600"
            }`}
          >
            Secondary Skills
          </h4>
          <div className="flex flex-col gap-3">
            {skills
              .filter((s) => s.category === "secondary")
              .map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    isDark
                      ? "bg-slate-800/50 border border-white/5"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <Code size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {skill.name}
                      </div>
                      <div
                        className={`text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}
                      >
                        {skill.years}y exp
                      </div>
                    </div>
                  </div>
                  <StarRating level={skill.level} isDark={isDark} />
                </motion.div>
              ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard isDark={isDark}>
        <h4
          className={`text-sm font-bold mb-4 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Star size={16} className="text-yellow-400" /> Interview Readiness Radar
        </h4>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <RadarChart outerRadius={90} data={skillRadar}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function DocumentsTab({ isDark }: TabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Documents
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg"
        >
          <Upload size={16} /> Upload
        </motion.button>
      </div>

      <GlassCard isDark={isDark} className="border-dashed border-2 border-violet-500/30 text-center py-10">
        <Upload size={32} className="mx-auto mb-3 text-violet-400" />
        <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Drop files here or click to upload
        </div>
        <div className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          PDF, DOC up to 10MB
        </div>
      </GlassCard>

      {documents.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.08 }}
        >
          <GlassCard isDark={isDark} className="!py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    doc.type === "Resume"
                      ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                      : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                  }`}
                >
                  <FileText
                    size={20}
                    className={doc.type === "Resume" ? "text-cyan-400" : "text-yellow-400"}
                  />
                </div>
                <div>
                  <div
                    className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {doc.name}
                  </div>
                  <div
                    className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    {doc.type} • {doc.date} • {doc.size}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
              >
                <Download
                  size={16}
                  className={isDark ? "text-slate-400" : "text-gray-500"}
                />
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

function PreferencesTab({ isDark }: TabProps) {
  const prefCards = [
    {
      label: "Preferred Role",
      value: preferences.role,
      color: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
      accent: "text-violet-400",
    },
    {
      label: "Work Mode",
      value: preferences.workMode,
      color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
      accent: "text-cyan-400",
    },
    {
      label: "Location",
      value: preferences.location,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
      accent: "text-emerald-400",
    },
    {
      label: "Job Type",
      value: preferences.jobType,
      color: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
      accent: "text-yellow-400",
    },
    {
      label: "Expected Salary",
      value: preferences.salary,
      color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
      accent: "text-rose-400",
    },
    {
      label: "Notice Period",
      value: preferences.noticePeriod,
      color: "from-slate-500/10 to-slate-500/10 border-slate-500/20",
      accent: isDark ? "text-slate-300" : "text-slate-600",
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard isDark={isDark}>
        <h3
          className={`text-lg font-bold mb-5 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Briefcase size={18} className="text-cyan-400" /> Career Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prefCards.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl bg-gradient-to-br border ${
                isDark ? item.color : "from-gray-50 to-gray-100 border-gray-200"
              }`}
            >
              <div
                className={`text-xs mb-1 ${isDark ? item.accent : "text-gray-500"}`}
              >
                {item.label}
              </div>
              <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const tabs = ["overview", "education", "skills", "documents", "preferences"];

  const activityCards: ActivityCard[] = [
    { label: "Total Interviews", value: activityData.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Best Score", value: activityData.best, icon: Trophy, color: "from-yellow-500 to-orange-500" },
    { label: "Pass Rate", value: activityData.passRate, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
    { label: "Top Skill", value: activityData.topSkill, icon: Zap, color: "from-violet-500 to-purple-500" },
  ];

  const readinessItems = [
    { label: "Skills", score: 80, color: "from-violet-500 to-purple-500" },
    { label: "Communication", score: 70, color: "from-blue-500 to-cyan-500" },
    { label: "Problem Solving", score: 90, color: "from-emerald-500 to-teal-500" },
    { label: "System Design", score: 60, color: "from-rose-500 to-pink-500" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-violet-500/10" : "bg-violet-500/5"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-500/5"
          }`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <Sidebar
            isDark={isDark}
            toggleTheme={toggleTheme}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />

          <div className="flex-1 min-w-0">
            {/* Mobile header */}
            <header
              className={`flex items-center justify-between md:hidden mb-4 ${
                isDark
                  ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10"
                  : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
              } rounded-2xl p-4`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  {mobileMenuOpen ? (
                    <X size={20} className={isDark ? "text-white" : "text-gray-900"} />
                  ) : (
                    <Menu size={20} className={isDark ? "text-white" : "text-gray-900"} />
                  )}
                </button>
                <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  TalentPulse
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10">
                  {isDark ? "☀️" : "🌙"}
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </header>

            {/* Mobile menu drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mb-4 overflow-hidden"
                >
                  <div
                    className={`${
                      isDark
                        ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10"
                        : "bg-white/80 border border-gray-200 shadow-lg"
                    } rounded-2xl p-4`}
                  >
                    {["Dashboard", "My Interviews", "Schedule", "Achievements", "Notifications"].map(
                      (item, i) => (
                        <button
                          key={i}
                          className={`w-full text-left py-3 px-4 rounded-xl transition ${
                            isDark
                              ? "hover:bg-white/5 text-white"
                              : "hover:bg-gray-100 text-gray-900"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Breadcrumb */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard")}
                className={`flex items-center gap-2 text-sm transition ${
                  isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowLeft size={16} /> Dashboard
              </motion.button>
              <span className={isDark ? "text-slate-600" : "text-gray-300"}>/</span>
              <span
                className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Profile
              </span>
            </motion.div>

            {/* ── Profile Header Card ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div
                className={`relative overflow-hidden rounded-3xl ${
                  isDark
                    ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10"
                    : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
                }`}
              >
                {/* Banner */}
                <div className="relative h-40 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-8 right-12 w-56 h-32 rounded-full bg-cyan-300/20 blur-2xl" />
                  <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm font-semibold transition shadow-lg">
                      <Upload size={14} /> Upload Resume
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-violet-700 hover:bg-white/90 text-sm font-bold transition shadow-lg">
                      <Edit3 size={14} /> Edit Profile
                    </motion.button>
                  </div>
                </div>

                <div className="px-8 pt-0 pb-8">

                  {/* ── Avatar + identity row — avatar overlaps banner ── */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-42 mb-6">

                    {/* Left: avatar + name */}
                    <div className="flex items-end gap-5">
                      <motion.div whileHover={{ scale: 1.04 }} className="relative shrink-0">
                        <div
                          className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ${
                            isDark ? "border-4 border-slate-900" : "border-4 border-white"
                          }`}
                        >
                          A
                        </div>
                        {/* Online indicator */}
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow" />
                        {/* Camera button */}
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-xl border-2 border-slate-900 hover:scale-110 transition">
                          <Camera size={13} className="text-white" />
                        </button>
                      </motion.div>

                      <div className="pb-1 space-y-1.5">
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                          {user.name}
                        </h1>
                        <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {user.headline}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? "bg-slate-700/70 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                            <MapPin size={11} className="text-cyan-400" />
                            {user.location}
                          </span>
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? "bg-slate-700/70 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                            <Briefcase size={11} className="text-violet-400" />
                            {user.experience}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Available
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: action buttons visible on mobile only (banner has them on desktop) */}
                    <div className="flex sm:hidden items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                          isDark
                            ? "bg-slate-800 border-white/10 text-white hover:bg-slate-700"
                            : "bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        <Upload size={14} /> Resume
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg transition"
                      >
                        <Edit3 size={14} /> Edit
                      </motion.button>
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className={`w-full h-px mb-6 ${isDark ? "bg-white/[0.08]" : "bg-gray-200"}`} />

                  {/* ── Profile Completion ── */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
                        <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Profile Strength
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                          {user.completionItems.filter((i) => i.done).length} / {user.completionItems.length} complete
                        </span>
                        <span className="text-sm font-extrabold text-violet-400">
                          {user.profileCompletion}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-700/80" : "bg-gray-200"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${user.profileCompletion}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500"
                      />
                    </div>

                    {/* Completion chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {user.completionItems.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.06 }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                            item.done
                              ? isDark
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isDark
                              ? "bg-slate-800/60 border-white/5 text-slate-500"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          {item.done ? (
                            <CheckCircle size={13} className="shrink-0 text-emerald-400" />
                          ) : (
                            <AlertCircle size={13} className={`shrink-0 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
                          )}
                          <span className="truncate">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Activity Mini Cards ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
            >
              {activityCards.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`relative overflow-hidden p-4 rounded-2xl ${
                    isDark
                      ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10"
                      : "bg-white/80 border border-gray-200 shadow-md"
                  } group`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    <item.icon size={16} className="text-white" />
                  </div>
                  <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {item.label}
                  </div>
                  <div
                    className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Interview Readiness ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <GlassCard isDark={isDark}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`font-bold flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Activity size={18} className="text-cyan-400" /> Interview Readiness Score
                  </h3>
                  <span className="text-2xl font-bold text-cyan-400">82%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {readinessItems.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl ${
                        isDark
                          ? "bg-slate-800/50 border border-white/5"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.score}%
                      </div>
                      <div
                        className={`w-full h-1.5 rounded-full mt-2 ${
                          isDark ? "bg-slate-700" : "bg-gray-200"
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* ── Tabs ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className={`flex items-center gap-2 p-2 rounded-2xl mb-6 flex-wrap ${
                  isDark
                    ? "bg-slate-900/50 border border-white/10"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                {tabs.map((tab) => (
                  <TabButton
                    key={tab}
                    label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                    active={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    isDark={isDark}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "overview" && <OverviewTab isDark={isDark} />}
                  {activeTab === "education" && <EducationTab isDark={isDark} />}
                  {activeTab === "skills" && <SkillsTab isDark={isDark} />}
                  {activeTab === "documents" && <DocumentsTab isDark={isDark} />}
                  {activeTab === "preferences" && <PreferencesTab isDark={isDark} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}