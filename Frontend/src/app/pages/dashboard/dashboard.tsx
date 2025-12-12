import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Menu, X, Users, Calendar, BarChart2, Bell } from "lucide-react";

// NOTE: This file is a single-file dashboard page meant to be placed at:
// src/app/user/dashboard/page.tsx
// It uses Tailwind CSS, framer-motion and recharts. shadcn components may be used
// in your project — adjust imports as needed. This file uses mock data and local state.

// ---------- Mock Data ----------
const stats = [
  { id: "total", title: "Total Interviews", value: 24 },
  { id: "passed", title: "Passed", value: 15 },
  { id: "failed", title: "Failed", value: 9 },
  { id: "avg", title: "Average Score", value: "78%" },
];

const scoreHistory = [
  { name: "1", score: 60 },
  { name: "2", score: 70 },
  { name: "3", score: 65 },
  { name: "4", score: 72 },
  { name: "5", score: 80 },
  { name: "6", score: 82 },
  { name: "7", score: 90 },
];

const skillRadar = [
  { skill: "Problem Solving", A: 85 },
  { skill: "Communication", A: 70 },
  { skill: "Coding", A: 78 },
  { skill: "System Design", A: 60 },
  { skill: "Domain Knowledge", A: 74 },
];

const upcoming = [
  { id: 1, role: "Frontend Developer", date: "2025-12-15 10:00 AM", type: "Live" },
  { id: 2, role: "ML Intern", date: "2025-12-20 02:30 PM", type: "Recorded" },
  { id: 3, role: "Product Eng.", date: "2026-01-05 11:00 AM", type: "Live" },
];

const recent = [
  { id: 1, role: "Frontend Developer", score: 72, result: "Pass", date: "2025-11-30" },
  { id: 2, role: "Data Engineer", score: 64, result: "Fail", date: "2025-11-18" },
  { id: 3, role: "Intern: ML", score: 90, result: "Pass", date: "2025-11-05" },
  { id: 4, role: "SWE", score: 78, result: "Pass", date: "2025-10-20" },
  { id: 5, role: "Frontend", score: 58, result: "Fail", date: "2025-10-01" },
];

// ---------- Small UI Components ----------
function IconButton({ children, onClick, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-white/5 transition ${className}`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-sm border border-white/6 rounded-2xl p-4 shadow-md flex flex-col">
      <div className="text-sm text-white/80">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function GlassCard({ children, className = "" }: any) {
  return (
    <div className={`bg-gradient-to-br from-white/3 to-white/6 backdrop-blur-md border border-white/6 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

// ---------- Main Page ----------
export default function UserDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // for tablet collapse

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] to-[#08080d] text-white">
      {/* Top-level container */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop & Tablet */}
          <aside
            className={`hidden md:flex flex-col w-64 shrink-0 transition-all duration-300 ${
              sidebarCollapsed ? "w-20" : "w-64"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] shadow-lg flex items-center justify-center">
                <div className="text-black font-bold">TP</div>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-bold text-lg">TalentPalseAI</div>
                  <div className="text-xs text-white/60">AI Interview Coach</div>
                </div>
              )}
            </div>

            <nav className="flex-1">
              <ul className="flex flex-col gap-2">
                <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
                  <BarChart2 size={18} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </li>
                <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
                  <Users size={18} />
                  {!sidebarCollapsed && <span>My Interviews</span>}
                </li>
                <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
                  <Calendar size={18} />
                  {!sidebarCollapsed && <span>Schedule</span>}
                </li>
                <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
                  <Bell size={18} />
                  {!sidebarCollapsed && <span>Notifications</span>}
                </li>
              </ul>
            </nav>

            <div className="mt-auto mb-4">
              <button
                onClick={() => setSidebarCollapsed((s) => !s)}
                className="w-full py-2 rounded-lg bg-white/3 hover:bg-white/4 transition"
              >
                {sidebarCollapsed ? "Expand" : "Collapse"}
              </button>
            </div>
          </aside>

          {/* Mobile Topbar & Hamburger */}
          <div className="flex-1">
            <header className="flex items-center justify-between md:hidden mb-4">
              <div className="flex items-center gap-3">
                <IconButton onClick={() => setMobileMenuOpen(true)}>
                  <Menu size={18} />
                </IconButton>
                <div className="font-bold">TalentPalseAI</div>
              </div>

              <div className="flex items-center gap-2">
                <IconButton>
                  <Bell size={18} />
                </IconButton>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] flex items-center justify-center text-black font-bold">U</div>
              </div>
            </header>

            {/* Mobile Menu Drawer (Slide Down) */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="md:hidden mb-4"
                >
                  <div className="bg-white/4 border border-white/6 rounded-lg p-3">
                    <div className="flex flex-col gap-2">
                      <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </button>
                      <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                        My Interviews
                      </button>
                      <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                        Schedule
                      </button>
                      <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                        Notifications
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <main>
              {/* Header Row */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, User 👋</h1>
                  <p className="text-sm text-white/60">Here's a summary of your interview activity and progress.</p>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <div className="text-sm text-white/70">Today</div>
                  <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center">Dec 11</div>
                  <IconButton>
                    <Bell size={18} />
                  </IconButton>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] flex items-center justify-center text-black font-bold">U</div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s) => (
                  <motion.div key={s.id} whileHover={{ y: -4 }}>
                    <StatCard title={s.title} value={s.value} />
                  </motion.div>
                ))}
              </div>

              {/* Main Grid: Charts + Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Performance Chart (col-span 2 on large) */}
                <div className="lg:col-span-2">
                  <GlassCard>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">Performance Over Time</h3>
                        <p className="text-sm text-white/60">Your score trend based on submitted interviews</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="py-1 px-3 bg-white/6 rounded">Last 6 months</button>
                      </div>
                    </div>

                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer>
                        <LineChart data={scoreHistory}>
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#22D3EE" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-br from-white/3 to-white/6 rounded-lg">
                        <div className="text-xs text-white/60">Best Score</div>
                        <div className="text-xl font-bold">90</div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-white/3 to-white/6 rounded-lg">
                        <div className="text-xs text-white/60">Improvement</div>
                        <div className="text-xl font-bold">+18%</div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Radar Skills */}
                  <div className="mt-4">
                    <GlassCard>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">Skill Radar</h3>
                          <p className="text-sm text-white/60">Highlights of core interview skills</p>
                        </div>
                      </div>

                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                          <RadarChart outerRadius={100} data={skillRadar}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="You" dataKey="A" stroke="#6D28D9" fill="#6D28D9" fillOpacity={0.6} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* Right column: Schedule + Recent Interviews */}
                <div>
                  <GlassCard>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
                        <p className="text-sm text-white/60">Join links and details</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {upcoming.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                          <div>
                            <div className="font-semibold">{u.role}</div>
                            <div className="text-xs text-white/60">{u.date}</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm text-white/80">{u.type}</div>
                            <button className="mt-2 px-3 py-1 rounded bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] text-black text-sm">Join</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-right">
                      <button className="text-sm underline text-white/80">View all</button>
                    </div>
                  </GlassCard>

                  <div className="mt-4">
                    <GlassCard>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">Recent Attempts</h3>
                          <p className="text-sm text-white/60">Last 5 interviews</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {recent.slice(0, 5).map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-white/3">
                            <div>
                              <div className="font-medium">{r.role}</div>
                              <div className="text-xs text-white/60">{r.date}</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${r.result === "Pass" ? "text-green-400" : "text-rose-400"}`}>{r.result}</div>
                              <div className="text-sm text-white/70">Score: {r.score}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 text-right">
                        <button className="text-sm underline text-white/80">See full history</button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>

              {/* Suggestions / AI Tips */}
              <div className="mt-6">
                <GlassCard>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">AI Suggestions</h3>
                      <p className="text-sm text-white/60">Personalized tips based on your answers</p>
                    </div>
                    <div className="text-sm text-white/60">Last updated: Dec 11, 2025</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white/3">
                      <div className="text-sm font-semibold">Practice: Algo Problems</div>
                      <div className="text-xs text-white/60 mt-2">Focus on arrays & graphs. Try timed mocks.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/3">
                      <div className="text-sm font-semibold">Improve Communication</div>
                      <div className="text-xs text-white/60 mt-2">Record your explanation and compare to sample answers.</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/3">
                      <div className="text-sm font-semibold">Domain Knowledge</div>
                      <div className="text-xs text-white/60 mt-2">Read system design primer for system design rounds.</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
