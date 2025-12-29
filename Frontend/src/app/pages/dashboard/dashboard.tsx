// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   BarChart,
//   Bar,
//   CartesianGrid,
// } from "recharts";
// import { Menu, X, Users, Calendar, BarChart2, Bell } from "lucide-react";

// // NOTE: This file is a single-file dashboard page meant to be placed at:
// // src/app/user/dashboard/page.tsx
// // It uses Tailwind CSS, framer-motion and recharts. shadcn components may be used
// // in your project — adjust imports as needed. This file uses mock data and local state.

// // ---------- Mock Data ----------
// const stats = [
//   { id: "total", title: "Total Interviews", value: 24 },
//   { id: "passed", title: "Passed", value: 15 },
//   { id: "failed", title: "Failed", value: 9 },
//   { id: "avg", title: "Average Score", value: "78%" },
// ];

// const scoreHistory = [
//   { name: "1", score: 60 },
//   { name: "2", score: 70 },
//   { name: "3", score: 65 },
//   { name: "4", score: 72 },
//   { name: "5", score: 80 },
//   { name: "6", score: 82 },
//   { name: "7", score: 90 },
// ];

// const skillRadar = [
//   { skill: "Problem Solving", A: 85 },
//   { skill: "Communication", A: 70 },
//   { skill: "Coding", A: 78 },
//   { skill: "System Design", A: 60 },
//   { skill: "Domain Knowledge", A: 74 },
// ];

// const upcoming = [
//   { id: 1, role: "Frontend Developer", date: "2025-12-15 10:00 AM", type: "Live" },
//   { id: 2, role: "ML Intern", date: "2025-12-20 02:30 PM", type: "Recorded" },
//   { id: 3, role: "Product Eng.", date: "2026-01-05 11:00 AM", type: "Live" },
// ];

// const recent = [
//   { id: 1, role: "Frontend Developer", score: 72, result: "Pass", date: "2025-11-30" },
//   { id: 2, role: "Data Engineer", score: 64, result: "Fail", date: "2025-11-18" },
//   { id: 3, role: "Intern: ML", score: 90, result: "Pass", date: "2025-11-05" },
//   { id: 4, role: "SWE", score: 78, result: "Pass", date: "2025-10-20" },
//   { id: 5, role: "Frontend", score: 58, result: "Fail", date: "2025-10-01" },
// ];

// // ---------- Small UI Components ----------
// function IconButton({ children, onClick, className = "" }: any) {
//   return (
//     <button
//       onClick={onClick}
//       className={`p-2 rounded-md hover:bg-white/5 transition ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// function StatCard({ title, value }: { title: string; value: any }) {
//   return (
//     <div className="bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-sm border border-white/6 rounded-2xl p-4 shadow-md flex flex-col">
//       <div className="text-sm text-white/80">{title}</div>
//       <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
//     </div>
//   );
// }

// function GlassCard({ children, className = "" }: any) {
//   return (
//     <div className={`bg-gradient-to-br from-white/3 to-white/6 backdrop-blur-md border border-white/6 rounded-2xl p-4 ${className}`}>
//       {children}
//     </div>
//   );
// }

// // ---------- Main Page ----------
// export default function UserDashboardPage() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // for tablet collapse

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] to-[#08080d] text-white">
//       {/* Top-level container */}
//       <div className="max-w-[1400px] mx-auto px-4 py-6">
//         <div className="flex gap-6">
//           {/* Sidebar - Desktop & Tablet */}
//           <aside
//             className={`hidden md:flex flex-col w-64 shrink-0 transition-all duration-300 ${
//               sidebarCollapsed ? "w-20" : "w-64"
//             }`}
//           >
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] shadow-lg flex items-center justify-center">
//                 <div className="text-black font-bold">TP</div>
//               </div>
//               {!sidebarCollapsed && (
//                 <div>
//                   <div className="font-bold text-lg">TalentPalseAI</div>
//                   <div className="text-xs text-white/60">AI Interview Coach</div>
//                 </div>
//               )}
//             </div>

//             <nav className="flex-1">
//               <ul className="flex flex-col gap-2">
//                 <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
//                   <BarChart2 size={18} />
//                   {!sidebarCollapsed && <span>Dashboard</span>}
//                 </li>
//                 <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
//                   <Users size={18} />
//                   {!sidebarCollapsed && <span>My Interviews</span>}
//                 </li>
//                 <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
//                   <Calendar size={18} />
//                   {!sidebarCollapsed && <span>Schedule</span>}
//                 </li>
//                 <li className="py-2 px-2 rounded-md hover:bg-white/5 transition flex items-center gap-3">
//                   <Bell size={18} />
//                   {!sidebarCollapsed && <span>Notifications</span>}
//                 </li>
//               </ul>
//             </nav>

//             <div className="mt-auto mb-4">
//               <button
//                 onClick={() => setSidebarCollapsed((s) => !s)}
//                 className="w-full py-2 rounded-lg bg-white/3 hover:bg-white/4 transition"
//               >
//                 {sidebarCollapsed ? "Expand" : "Collapse"}
//               </button>
//             </div>
//           </aside>

//           {/* Mobile Topbar & Hamburger */}
//           <div className="flex-1">
//             <header className="flex items-center justify-between md:hidden mb-4">
//               <div className="flex items-center gap-3">
//                 <IconButton onClick={() => setMobileMenuOpen(true)}>
//                   <Menu size={18} />
//                 </IconButton>
//                 <div className="font-bold">TalentPalseAI</div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <IconButton>
//                   <Bell size={18} />
//                 </IconButton>
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] flex items-center justify-center text-black font-bold">U</div>
//               </div>
//             </header>

//             {/* Mobile Menu Drawer (Slide Down) */}
//             <AnimatePresence>
//               {mobileMenuOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   className="md:hidden mb-4"
//                 >
//                   <div className="bg-white/4 border border-white/6 rounded-lg p-3">
//                     <div className="flex flex-col gap-2">
//                       <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
//                         Dashboard
//                       </button>
//                       <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
//                         My Interviews
//                       </button>
//                       <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
//                         Schedule
//                       </button>
//                       <button className="text-left py-2 px-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
//                         Notifications
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Main Content */}
//             <main>
//               {/* Header Row */}
//               <div className="flex items-center justify-between mb-6 gap-4">
//                 <div>
//                   <h1 className="text-2xl font-bold">Welcome back, User 👋</h1>
//                   <p className="text-sm text-white/60">Here's a summary of your interview activity and progress.</p>
//                 </div>

//                 <div className="hidden md:flex items-center gap-3">
//                   <div className="text-sm text-white/70">Today</div>
//                   <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center">Dec 11</div>
//                   <IconButton>
//                     <Bell size={18} />
//                   </IconButton>
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] flex items-center justify-center text-black font-bold">U</div>
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 {stats.map((s) => (
//                   <motion.div key={s.id} whileHover={{ y: -4 }}>
//                     <StatCard title={s.title} value={s.value} />
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Main Grid: Charts + Schedule */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                 {/* Left: Performance Chart (col-span 2 on large) */}
//                 <div className="lg:col-span-2">
//                   <GlassCard>
//                     <div className="flex items-center justify-between mb-3">
//                       <div>
//                         <h3 className="text-lg font-semibold">Performance Over Time</h3>
//                         <p className="text-sm text-white/60">Your score trend based on submitted interviews</p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button className="py-1 px-3 bg-white/6 rounded">Last 6 months</button>
//                       </div>
//                     </div>

//                     <div style={{ width: "100%", height: 240 }}>
//                       <ResponsiveContainer>
//                         <LineChart data={scoreHistory}>
//                           <XAxis dataKey="name" stroke="#9CA3AF" />
//                           <YAxis stroke="#9CA3AF" />
//                           <Tooltip />
//                           <Line type="monotone" dataKey="score" stroke="#22D3EE" strokeWidth={3} dot={{ r: 4 }} />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     </div>

//                     <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div className="p-3 bg-gradient-to-br from-white/3 to-white/6 rounded-lg">
//                         <div className="text-xs text-white/60">Best Score</div>
//                         <div className="text-xl font-bold">90</div>
//                       </div>
//                       <div className="p-3 bg-gradient-to-br from-white/3 to-white/6 rounded-lg">
//                         <div className="text-xs text-white/60">Improvement</div>
//                         <div className="text-xl font-bold">+18%</div>
//                       </div>
//                     </div>
//                   </GlassCard>

//                   {/* Radar Skills */}
//                   <div className="mt-4">
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-3">
//                         <div>
//                           <h3 className="text-lg font-semibold">Skill Radar</h3>
//                           <p className="text-sm text-white/60">Highlights of core interview skills</p>
//                         </div>
//                       </div>

//                       <div style={{ width: "100%", height: 300 }}>
//                         <ResponsiveContainer>
//                           <RadarChart outerRadius={100} data={skillRadar}>
//                             <PolarGrid />
//                             <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" />
//                             <PolarRadiusAxis angle={30} domain={[0, 100]} />
//                             <Radar name="You" dataKey="A" stroke="#6D28D9" fill="#6D28D9" fillOpacity={0.6} />
//                           </RadarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </GlassCard>
//                   </div>
//                 </div>

//                 {/* Right column: Schedule + Recent Interviews */}
//                 <div>
//                   <GlassCard>
//                     <div className="flex items-center justify-between mb-3">
//                       <div>
//                         <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
//                         <p className="text-sm text-white/60">Join links and details</p>
//                       </div>
//                     </div>

//                     <div className="flex flex-col gap-3">
//                       {upcoming.map((u) => (
//                         <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3">
//                           <div>
//                             <div className="font-semibold">{u.role}</div>
//                             <div className="text-xs text-white/60">{u.date}</div>
//                           </div>
//                           <div className="flex flex-col items-end">
//                             <div className="text-sm text-white/80">{u.type}</div>
//                             <button className="mt-2 px-3 py-1 rounded bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] text-black text-sm">Join</button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="mt-4 text-right">
//                       <button className="text-sm underline text-white/80">View all</button>
//                     </div>
//                   </GlassCard>

//                   <div className="mt-4">
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-3">
//                         <div>
//                           <h3 className="text-lg font-semibold">Recent Attempts</h3>
//                           <p className="text-sm text-white/60">Last 5 interviews</p>
//                         </div>
//                       </div>

//                       <div className="flex flex-col gap-2">
//                         {recent.slice(0, 5).map((r) => (
//                           <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-white/3">
//                             <div>
//                               <div className="font-medium">{r.role}</div>
//                               <div className="text-xs text-white/60">{r.date}</div>
//                             </div>
//                             <div className="text-right">
//                               <div className={`font-semibold ${r.result === "Pass" ? "text-green-400" : "text-rose-400"}`}>{r.result}</div>
//                               <div className="text-sm text-white/70">Score: {r.score}</div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>

//                       <div className="mt-3 text-right">
//                         <button className="text-sm underline text-white/80">See full history</button>
//                       </div>
//                     </GlassCard>
//                   </div>
//                 </div>
//               </div>

//               {/* Suggestions / AI Tips */}
//               <div className="mt-6">
//                 <GlassCard>
//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <h3 className="text-lg font-semibold">AI Suggestions</h3>
//                       <p className="text-sm text-white/60">Personalized tips based on your answers</p>
//                     </div>
//                     <div className="text-sm text-white/60">Last updated: Dec 11, 2025</div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                     <div className="p-3 rounded-lg bg-white/3">
//                       <div className="text-sm font-semibold">Practice: Algo Problems</div>
//                       <div className="text-xs text-white/60 mt-2">Focus on arrays & graphs. Try timed mocks.</div>
//                     </div>
//                     <div className="p-3 rounded-lg bg-white/3">
//                       <div className="text-sm font-semibold">Improve Communication</div>
//                       <div className="text-xs text-white/60 mt-2">Record your explanation and compare to sample answers.</div>
//                     </div>
//                     <div className="p-3 rounded-lg bg-white/3">
//                       <div className="text-sm font-semibold">Domain Knowledge</div>
//                       <div className="text-xs text-white/60 mt-2">Read system design primer for system design rounds.</div>
//                     </div>
//                   </div>
//                 </GlassCard>
//               </div>
//             </main>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   Area,
//   AreaChart,
// } from "recharts";
// import { Menu, X, Users, Calendar, BarChart2, Bell, Trophy, Target, TrendingUp, Zap, Award, Clock, Star, ChevronRight, Activity } from "lucide-react";

// // ---------- Mock Data ----------
// const stats = [
//   { id: "total", title: "Total Interviews", value: 24, change: "+12%", icon: Users, color: "from-blue-500 to-cyan-500" },
//   { id: "passed", title: "Passed", value: 15, change: "+8%", icon: Trophy, color: "from-emerald-500 to-teal-500" },
//   { id: "failed", title: "Failed", value: 9, change: "-5%", icon: Target, color: "from-rose-500 to-pink-500" },
//   { id: "avg", title: "Average Score", value: "78%", change: "+18%", icon: TrendingUp, color: "from-violet-500 to-purple-500" },
// ];

// const scoreHistory = [
//   { name: "Week 1", score: 60, target: 65 },
//   { name: "Week 2", score: 70, target: 70 },
//   { name: "Week 3", score: 65, target: 72 },
//   { name: "Week 4", score: 72, target: 75 },
//   { name: "Week 5", score: 80, target: 78 },
//   { name: "Week 6", score: 82, target: 80 },
//   { name: "Week 7", score: 90, target: 85 },
// ];

// const skillRadar = [
//   { skill: "Problem Solving", current: 85, previous: 75 },
//   { skill: "Communication", current: 70, previous: 65 },
//   { skill: "Coding", current: 78, previous: 70 },
//   { skill: "System Design", current: 60, previous: 55 },
//   { skill: "Domain Knowledge", current: 74, previous: 68 },
// ];

// const upcoming = [
//   { id: 1, role: "Frontend Developer", company: "TechCorp", date: "2025-12-15", time: "10:00 AM", type: "Live", difficulty: "Medium", color: "from-blue-500 to-cyan-500" },
//   { id: 2, role: "ML Intern", company: "AI Labs", date: "2025-12-20", time: "02:30 PM", type: "Recorded", difficulty: "Easy", color: "from-emerald-500 to-teal-500" },
//   { id: 3, role: "Product Eng.", company: "StartupX", date: "2026-01-05", time: "11:00 AM", type: "Live", difficulty: "Hard", color: "from-violet-500 to-purple-500" },
// ];

// const recent = [
//   { id: 1, role: "Frontend Developer", company: "TechCorp", score: 72, result: "Pass", date: "2025-11-30", feedback: "Strong coding, improve communication" },
//   { id: 2, role: "Data Engineer", company: "DataFlow", score: 64, result: "Fail", date: "2025-11-18", feedback: "Review SQL optimization" },
//   { id: 3, role: "Intern: ML", company: "AI Labs", score: 90, result: "Pass", date: "2025-11-05", feedback: "Excellent problem solving!" },
//   { id: 4, role: "SWE", company: "BigTech", score: 78, result: "Pass", date: "2025-10-20", feedback: "Good system design skills" },
//   { id: 5, role: "Frontend", company: "WebCo", score: 58, result: "Fail", date: "2025-10-01", feedback: "Practice React patterns" },
// ];

// const achievements = [
//   { id: 1, title: "First Win", description: "Passed your first interview", unlocked: true, icon: Trophy },
//   { id: 2, title: "Streak Master", description: "5 consecutive passes", unlocked: true, icon: Zap },
//   { id: 3, title: "Perfect Score", description: "Score 100 in any interview", unlocked: false, icon: Star },
//   { id: 4, title: "Dedicated", description: "Complete 50 interviews", unlocked: false, icon: Award },
// ];

// // ---------- Small UI Components ----------
// function IconButton({ children, onClick, className = "" }: any) {
//   return (
//     <motion.button
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={onClick}
//       className={`p-2 rounded-lg hover:bg-white/10 transition ${className}`}
//     >
//       {children}
//     </motion.button>
//   );
// }

// function StatCard({ title, value, change, icon: Icon, color }: any) {
//   const isPositive = change.startsWith("+");
//   return (
//     <motion.div
//       whileHover={{ y: -4, scale: 1.02 }}
//       className="relative overflow-hidden bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl group"
//     >
//       <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
//       <div className="relative z-10">
//         <div className="flex items-start justify-between mb-4">
//           <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
//             <Icon className="text-white" size={24} />
//           </div>
//           <div className={`text-sm font-semibold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
//             {change}
//           </div>
//         </div>
//         <div className="text-sm text-slate-400 mb-1">{title}</div>
//         <div className="text-3xl font-bold text-white">{value}</div>
//       </div>
//     </motion.div>
//   );
// }

// function GlassCard({ children, className = "" }: any) {
//   return (
//     <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}>
//       {children}
//     </div>
//   );
// }

// // ---------- Main Page ----------
// export default function UserDashboardPage() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//       {/* Animated background elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
//       </div>

//       {/* Top-level container */}
//       <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6">
//         <div className="flex gap-6">
//           {/* Sidebar - Desktop & Tablet */}
//           <motion.aside
//             initial={{ x: -20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
//               sidebarCollapsed ? "w-20" : "w-64"
//             }`}
//           >
//             <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl mb-4">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
//                   <Activity className="text-white" size={24} />
//                 </div>
//                 {!sidebarCollapsed && (
//                   <div>
//                     <div className="font-bold text-lg text-white">TalentPulse</div>
//                     <div className="text-xs text-slate-400">AI Interview Coach</div>
//                   </div>
//                 )}
//               </div>

//               <nav className="flex-1">
//                 <ul className="flex flex-col gap-2">
//                   {[
//                     { icon: BarChart2, label: "Dashboard", active: true },
//                     { icon: Users, label: "My Interviews" },
//                     { icon: Calendar, label: "Schedule" },
//                     { icon: Trophy, label: "Achievements" },
//                     { icon: Bell, label: "Notifications" },
//                   ].map((item, i) => (
//                     <motion.li
//                       key={i}
//                       whileHover={{ x: 4 }}
//                       className={`py-3 px-3 rounded-xl transition cursor-pointer flex items-center gap-3 ${
//                         item.active
//                           ? "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-white"
//                           : "hover:bg-white/5 text-slate-400"
//                       }`}
//                     >
//                       <item.icon size={18} />
//                       {!sidebarCollapsed && <span>{item.label}</span>}
//                     </motion.li>
//                   ))}
//                 </ul>
//               </nav>
//             </div>

//             <div className="mt-auto">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setSidebarCollapsed((s) => !s)}
//                 className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition text-white font-semibold shadow-lg"
//               >
//                 {sidebarCollapsed ? "→" : "Collapse"}
//               </motion.button>
//             </div>
//           </motion.aside>

//           {/* Mobile Topbar & Hamburger */}
//           <div className="flex-1">
//             <header className="flex items-center justify-between md:hidden mb-4 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
//               <div className="flex items-center gap-3">
//                 <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//                   {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
//                 </IconButton>
//                 <div className="font-bold text-white">TalentPulse</div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <IconButton>
//                   <Bell size={18} className="text-white" />
//                 </IconButton>
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">U</div>
//               </div>
//             </header>

//             {/* Mobile Menu Drawer */}
//             <AnimatePresence>
//               {mobileMenuOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="md:hidden mb-4 overflow-hidden"
//                 >
//                   <div className="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
//                     <div className="flex flex-col gap-2">
//                       {["Dashboard", "My Interviews", "Schedule", "Achievements", "Notifications"].map((item, i) => (
//                         <button
//                           key={i}
//                           className="text-left py-3 px-4 rounded-xl hover:bg-white/5 text-white transition"
//                           onClick={() => setMobileMenuOpen(false)}
//                         >
//                           {item}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Main Content */}
//             <main>
//               {/* Header Row */}
//               <motion.div
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
//               >
//                 <div>
//                   <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Alex 👋</h1>
//                   <p className="text-slate-400">Track your progress and prepare for upcoming interviews</p>
//                 </div>

//                 <div className="hidden md:flex items-center gap-3">
//                   <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
//                     <Clock size={16} className="text-cyan-400" />
//                     <div className="text-sm text-white">Dec 14, 2025</div>
//                   </div>
//                   <IconButton className="bg-slate-900/50 backdrop-blur-xl border border-white/10">
//                     <Bell size={18} className="text-white" />
//                   </IconButton>
//                   <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">A</div>
//                 </div>
//               </motion.div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 {stats.map((s, i) => (
//                   <motion.div
//                     key={s.id}
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: i * 0.1 }}
//                   >
//                     <StatCard title={s.title} value={s.value} change={s.change} icon={s.icon} color={s.color} />
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Main Grid: Charts + Schedule */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left: Performance Chart (col-span 2 on large) */}
//                 <div className="lg:col-span-2 space-y-6">
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.2 }}
//                   >
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-6">
//                         <div>
//                           <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                             <TrendingUp className="text-cyan-400" size={24} />
//                             Performance Over Time
//                           </h3>
//                           <p className="text-sm text-slate-400 mt-1">Your score trend vs target benchmarks</p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <button className="py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition border border-white/10">
//                             Last 7 weeks
//                           </button>
//                         </div>
//                       </div>

//                       <div style={{ width: "100%", height: 280 }}>
//                         <ResponsiveContainer>
//                           <AreaChart data={scoreHistory}>
//                             <defs>
//                               <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
//                                 <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
//                               </linearGradient>
//                             </defs>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
//                             <XAxis dataKey="name" stroke="#94a3b8" />
//                             <YAxis stroke="#94a3b8" />
//                             <Tooltip
//                               contentStyle={{
//                                 backgroundColor: "#1e293b",
//                                 border: "1px solid rgba(255,255,255,0.1)",
//                                 borderRadius: "12px",
//                                 color: "#fff"
//                               }}
//                             />
//                             <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#colorScore)" />
//                             <Line type="monotone" dataKey="target" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
//                           </AreaChart>
//                         </ResponsiveContainer>
//                       </div>

//                       <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
//                           <div className="text-xs text-emerald-400 mb-1">Best Score</div>
//                           <div className="text-2xl font-bold text-white">90</div>
//                         </div>
//                         <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl">
//                           <div className="text-xs text-violet-400 mb-1">Improvement</div>
//                           <div className="text-2xl font-bold text-white">+18%</div>
//                         </div>
//                         <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
//                           <div className="text-xs text-cyan-400 mb-1">Current Streak</div>
//                           <div className="text-2xl font-bold text-white">5 🔥</div>
//                         </div>
//                       </div>
//                     </GlassCard>
//                   </motion.div>

//                   {/* Radar Skills */}
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.3 }}
//                   >
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-6">
//                         <div>
//                           <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                             <Star className="text-violet-400" size={24} />
//                             Skill Analysis
//                           </h3>
//                           <p className="text-sm text-slate-400 mt-1">Current vs previous performance</p>
//                         </div>
//                       </div>

//                       <div style={{ width: "100%", height: 320 }}>
//                         <ResponsiveContainer>
//                           <RadarChart outerRadius={110} data={skillRadar}>
//                             <PolarGrid stroke="#334155" />
//                             <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
//                             <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
//                             <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
//                             <Radar name="Previous" dataKey="previous" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
//                           </RadarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </GlassCard>
//                   </motion.div>
//                 </div>

//                 {/* Right column: Schedule + Recent Interviews */}
//                 <div className="space-y-6">
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.4 }}
//                   >
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-6">
//                         <div>
//                           <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                             <Calendar className="text-cyan-400" size={24} />
//                             Upcoming
//                           </h3>
//                           <p className="text-sm text-slate-400 mt-1">{upcoming.length} scheduled</p>
//                         </div>
//                       </div>

//                       <div className="flex flex-col gap-3">
//                         {upcoming.map((u, i) => (
//                           <motion.div
//                             key={u.id}
//                             initial={{ x: 20, opacity: 0 }}
//                             animate={{ x: 0, opacity: 1 }}
//                             transition={{ delay: 0.5 + i * 0.1 }}
//                             whileHover={{ scale: 1.02 }}
//                             className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 cursor-pointer group"
//                           >
//                             <div className={`absolute inset-0 bg-gradient-to-br ${u.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
//                             <div className="relative z-10">
//                               <div className="flex items-start justify-between mb-2">
//                                 <div>
//                                   <div className="font-semibold text-white">{u.role}</div>
//                                   <div className="text-xs text-slate-400">{u.company}</div>
//                                 </div>
//                                 <div className={`text-xs px-2 py-1 rounded-full ${
//                                   u.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
//                                   u.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
//                                   "bg-rose-500/20 text-rose-400"
//                                 }`}>
//                                   {u.difficulty}
//                                 </div>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <div className="text-xs text-slate-400">
//                                   {u.date} • {u.time}
//                                 </div>
//                                 <button className={`px-3 py-1 rounded-lg bg-gradient-to-br ${u.color} text-white text-xs font-semibold shadow-lg hover:shadow-xl transition`}>
//                                   Join
//                                 </button>
//                               </div>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="mt-4 text-right">
//                         <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 ml-auto transition">
//                           View all <ChevronRight size={16} />
//                         </button>
//                       </div>
//                     </GlassCard>
//                   </motion.div>

//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.5 }}
//                   >
//                     <GlassCard>
//                       <div className="flex items-center justify-between mb-6">
//                         <div>
//                           <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                             <Activity className="text-violet-400" size={24} />
//                             Recent
//                           </h3>
//                           <p className="text-sm text-slate-400 mt-1">Last 5 attempts</p>
//                         </div>
//                       </div>

//                       <div className="flex flex-col gap-3">
//                         {recent.slice(0, 5).map((r, i) => (
//                           <motion.div
//                             key={r.id}
//                             initial={{ x: 20, opacity: 0 }}
//                             animate={{ x: 0, opacity: 1 }}
//                             transition={{ delay: 0.6 + i * 0.1 }}
//                             className="p-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 hover:border-white/20 transition cursor-pointer"
//                           >
//                             <div className="flex items-center justify-between mb-2">
//                               <div>
//                                 <div className="font-medium text-white text-sm">{r.role}</div>
//                                 <div className="text-xs text-slate-400">{r.company} • {r.date}</div>
//                               </div>
//                               <div className="text-right">
//                                 <div className={`font-semibold text-sm ${r.result === "Pass" ? "text-emerald-400" : "text-rose-400"}`}>
//                                   {r.result}
//                                 </div>
//                                 <div className="text-xs text-slate-400">Score: {r.score}</div>
//                               </div>
//                             </div>
//                             <div className="text-xs text-slate-500 italic">{r.feedback}</div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="mt-4 text-right">
//                         <button className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-auto transition">
//                           Full history <ChevronRight size={16} />
//                         </button>
//                       </div>
//                     </GlassCard>
//                   </motion.div>
//                 </div>
//               </div>

//               {/* Bottom Row: AI Suggestions + Achievements */}
//               <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <motion.div
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.6 }}
//                 >
//                   <GlassCard>
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                           <Zap className="text-yellow-400" size={24} />
//                           AI Suggestions
//                         </h3>
//                         <p className="text-sm text-slate-400 mt-1">Personalized tips</p>
//                       </div>
//                     </div>

//                     <div className="flex flex-col gap-3">
//                       {[
//                         { title: "Practice: Algo Problems", desc: "Focus on arrays & graphs. Try timed mocks.", color: "from-blue-500 to-cyan-500" },
//                         { title: "Improve Communication", desc: "Record explanations and compare with samples.", color: "from-violet-500 to-purple-500" },
//                         { title: "System Design Primer", desc: "Review scalability patterns for senior roles.", color: "from-emerald-500 to-teal-500" },
//                       ].map((tip, i) => (
//                         <motion.div
//                           key={i}
//                           whileHover={{ scale: 1.02 }}
//                           className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 cursor-pointer group"
//                         >
//                           <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
//                           <div className="relative z-10">
//                             <div className="text-sm font-semibold text-white mb-1">{tip.title}</div>
//                             <div className="text-xs text-slate-400">{tip.desc}</div>
//                           </div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </GlassCard>
//                 </motion.div>

//                 <motion.div
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.7 }}
//                 >
//                   <GlassCard>
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                           <Trophy className="text-yellow-400" size={24} />
//                           Achievements
//                         </h3>
//                         <p className="text-sm text-slate-400 mt-1">2 of 4 unlocked</p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       {achievements.map((ach, i) => (
//                         <motion.div
//                           key={ach.id}
//                           whileHover={{ scale: ach.unlocked ? 1.05 : 1 }}
//                           className={`p-4 rounded-xl border transition ${
//                             ach.unlocked
//                               ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
//                               : "bg-slate-800/30 border-slate-700/50 opacity-50"
//                           }`}
//                         >
//                           <ach.icon className={ach.unlocked ? "text-yellow-400" : "text-slate-600"} size={24} />
//                           <div className="mt-2 text-sm font-semibold text-white">{ach.title}</div>
//                           <div className="text-xs text-slate-400 mt-1">{ach.description}</div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </GlassCard>
//                 </motion.div>
//               </div>
//             </main>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useTheme } from "@/App"; 
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
  Area,
  AreaChart,
} from "recharts";
import { Menu, X, Users, Calendar, BarChart2, Bell, Trophy, Target, TrendingUp, Zap, Award, Clock, Star, ChevronRight, Activity } from "lucide-react";

// ---------- Mock Data ----------
const stats = [
  { id: "total", title: "Total Interviews", value: 24, change: "+12%", icon: Users, color: "from-blue-500 to-cyan-500" },
  { id: "passed", title: "Passed", value: 15, change: "+8%", icon: Trophy, color: "from-emerald-500 to-teal-500" },
  { id: "failed", title: "Failed", value: 9, change: "-5%", icon: Target, color: "from-rose-500 to-pink-500" },
  { id: "avg", title: "Average Score", value: "78%", change: "+18%", icon: TrendingUp, color: "from-violet-500 to-purple-500" },
];

const scoreHistory = [
  { name: "Week 1", score: 60, target: 65 },
  { name: "Week 2", score: 70, target: 70 },
  { name: "Week 3", score: 65, target: 72 },
  { name: "Week 4", score: 72, target: 75 },
  { name: "Week 5", score: 80, target: 78 },
  { name: "Week 6", score: 82, target: 80 },
  { name: "Week 7", score: 90, target: 85 },
];

const skillRadar = [
  { skill: "Problem Solving", current: 85, previous: 75 },
  { skill: "Communication", current: 70, previous: 65 },
  { skill: "Coding", current: 78, previous: 70 },
  { skill: "System Design", current: 60, previous: 55 },
  { skill: "Domain Knowledge", current: 74, previous: 68 },
];

const upcoming = [
  { id: 1, role: "Frontend Developer", company: "TechCorp", date: "2025-12-15", time: "10:00 AM", type: "Live", difficulty: "Medium", color: "from-blue-500 to-cyan-500" },
  { id: 2, role: "ML Intern", company: "AI Labs", date: "2025-12-20", time: "02:30 PM", type: "Recorded", difficulty: "Easy", color: "from-emerald-500 to-teal-500" },
  { id: 3, role: "Product Eng.", company: "StartupX", date: "2026-01-05", time: "11:00 AM", type: "Live", difficulty: "Hard", color: "from-violet-500 to-purple-500" },
];

const recent = [
  { id: 1, role: "Frontend Developer", company: "TechCorp", score: 72, result: "Pass", date: "2025-11-30", feedback: "Strong coding, improve communication" },
  { id: 2, role: "Data Engineer", company: "DataFlow", score: 64, result: "Fail", date: "2025-11-18", feedback: "Review SQL optimization" },
  { id: 3, role: "Intern: ML", company: "AI Labs", score: 90, result: "Pass", date: "2025-11-05", feedback: "Excellent problem solving!" },
  { id: 4, role: "SWE", company: "BigTech", score: 78, result: "Pass", date: "2025-10-20", feedback: "Good system design skills" },
  { id: 5, role: "Frontend", company: "WebCo", score: 58, result: "Fail", date: "2025-10-01", feedback: "Practice React patterns" },
];

const achievements = [
  { id: 1, title: "First Win", description: "Passed your first interview", unlocked: true, icon: Trophy },
  { id: 2, title: "Streak Master", description: "5 consecutive passes", unlocked: true, icon: Zap },
  { id: 3, title: "Perfect Score", description: "Score 100 in any interview", unlocked: false, icon: Star },
  { id: 4, title: "Dedicated", description: "Complete 50 interviews", unlocked: false, icon: Award },
];

// ---------- Small UI Components ----------
function IconButton({ children, onClick, className = "" }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-white/10 transition ${className}`}
    >
      {children}
    </motion.button>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const isPositive = change.startsWith("+");
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl group dark-mode"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
          <div className={`text-sm font-semibold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
            {change}
          </div>
        </div>
        <div className="text-sm text-slate-400 mb-1 card-subtitle">{title}</div>
        <div className="text-3xl font-bold text-white card-value">{value}</div>
      </div>
    </motion.div>
  );
}

function GlassCard({ children, className = "", isDark = true }: any) {
  return (
    <div className={`${
      isDark 
        ? "bg-gradient-card backdrop-blur-xl border border-white/10" 
        : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
    } rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

// ---------- Main Page ----------
export default function UserDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
   const { isDark, toggleTheme } = useTheme();
 

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? "bg-dashboard-bg to-slate-950" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-violet-500/10" : "bg-violet-500/5"
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-500/5"
        }`} style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Top-level container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop & Tablet */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
              sidebarCollapsed ? "w-20" : "w-64"
            }`}
          >
            <div className={`${
              isDark 
                ? "bg-gradient-card backdrop-blur-xl border border-white/10" 
                : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
            } rounded-2xl p-4 mb-4`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-lg flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>TalentPulse</div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>AI Interview Coach</div>
                  </div>
                )}
              </div>

              <nav className="flex-1">
                <ul className="flex flex-col gap-2">
                  {[
                    { icon: BarChart2, label: "Dashboard", active: true },
                    { icon: Users, label: "My Interviews" },
                    { icon: Calendar, label: "Schedule" },
                    { icon: Trophy, label: "Achievements" },
                    { icon: Bell, label: "Notifications" },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 4 }}
                      className={`py-3 px-3 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                        item.active
                          ? isDark 
                            ? "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-white"
                            : "bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-gray-900"
                          : isDark
                            ? "hover:bg-white/5 text-slate-400"
                            : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <item.icon size={18} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="mt-auto space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTheme()}
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
                onClick={() => setSidebarCollapsed((s) => !s)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition text-white font-semibold shadow-lg"
              >
                {sidebarCollapsed ? "→" : "Collapse"}
              </motion.button>
            </div>
          </motion.aside>

          {/* Mobile Topbar & Hamburger */}
          <div className="flex-1">
            <header className={`flex items-center justify-between md:hidden mb-4 ${
              isDark 
                ? "bg-gradient-card backdrop-blur-xl border border-white/10" 
                : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
            } rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X size={20} className={isDark ? "text-white" : "text-gray-900"} /> : <Menu size={20} className={isDark ? "text-white" : "text-gray-900"} />}
                </IconButton>
                <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>TalentPulse</div>
              </div>

              <div className="flex items-center gap-2">
                <IconButton onClick={() => toggleTheme()}>
                  {isDark ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
                </IconButton>
                <IconButton>
                  <Bell size={18} className={isDark ? "text-white" : "text-gray-900"} />
                </IconButton>
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">U</div>
              </div>
            </header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mb-4 overflow-hidden"
                >
                  <div className={`${
                    isDark 
                      ? "bg-gradient-card backdrop-blur-xl border border-white/10" 
                      : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
                  } rounded-2xl p-4`}>
                    <div className="flex flex-col gap-2">
                      {["Dashboard", "My Interviews", "Schedule", "Achievements", "Notifications"].map((item, i) => (
                        <button
                          key={i}
                          className={`text-left py-3 px-4 rounded-xl transition ${
                            isDark ? "hover:bg-white/5 text-white" : "hover:bg-gray-100 text-gray-900"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <main>
              {/* Header Row */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
              >
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Welcome back, Alex 👋</h1>
                  <p className={isDark ? "text-slate-400" : "text-gray-600"}>Track your progress and prepare for upcoming interviews</p>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTheme()}
                    className={`p-2 rounded-lg transition ${
                      isDark 
                        ? "bg-slate-900/50 backdrop-blur-xl border border-white/10 text-white" 
                        : "bg-white/80 backdrop-blur-xl border border-gray-300 text-gray-900 shadow-md"
                    }`}
                  >
                    {isDark ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
                  </motion.button>
                  <div className={`flex items-center gap-2 ${
                    isDark 
                      ? "bg-slate-900/50 backdrop-blur-xl border border-white/10" 
                      : "bg-white/80 backdrop-blur-xl border border-gray-300 shadow-md"
                  } rounded-xl px-4 py-2`}>
                    <Clock size={16} className="text-cyan-400" />
                    <div className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Dec 14, 2025</div>
                  </div>
                  <IconButton className={isDark ? "bg-slate-900/50 backdrop-blur-xl border border-white/10" : "bg-white/80 backdrop-blur-xl border border-gray-300 shadow-md"}>
                    <Bell size={18} className={isDark ? "text-white" : "text-gray-900"} />
                  </IconButton>
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">A</div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StatCard title={s.title} value={s.value} change={s.change} icon={s.icon} color={s.color} />
                  </motion.div>
                ))}
              </div>

              {/* Main Grid: Charts + Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Performance Chart (col-span 2 on large) */}
                <div className="lg:col-span-2 space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <TrendingUp className="text-cyan-400" size={24} />
                            Performance Over Time
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Your score trend vs target benchmarks</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className={`py-2 px-4 rounded-lg text-sm transition border ${
                            isDark 
                              ? "bg-white/5 hover:bg-white/10 text-white border-white/10" 
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
                          }`}>
                            Last 7 weeks
                          </button>
                        </div>
                      </div>

                      <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                          <AreaChart data={scoreHistory}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff"
                              }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#colorScore)" />
                            <Line type="monotone" dataKey="target" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-xl ${
                          isDark 
                            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20" 
                            : "bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Best Score</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>90</div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                          isDark 
                            ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20" 
                            : "bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-violet-400" : "text-violet-700"}`}>Improvement</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>+18%</div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                          isDark 
                            ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20" 
                            : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>Current Streak</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>5 🔥</div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Radar Skills */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Star className="text-violet-400" size={24} />
                            Skill Analysis
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Current vs previous performance</p>
                        </div>
                      </div>

                      <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                          <RadarChart outerRadius={110} data={skillRadar}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                            <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Radar name="Previous" dataKey="previous" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>

                {/* Right column: Schedule + Recent Interviews */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Calendar className="text-cyan-400" size={24} />
                            Upcoming
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>{upcoming.length} scheduled</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {upcoming.map((u, i) => (
                          <motion.div
                            key={u.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`relative overflow-hidden p-4 rounded-xl cursor-pointer group ${
                              isDark 
                                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10" 
                                : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300"
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${u.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{u.role}</div>
                                  <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>{u.company}</div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  u.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
                                  u.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-rose-500/20 text-rose-400"
                                }`}>
                                  {u.difficulty}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                  {u.date} • {u.time}
                                </div>
                                <button className={`px-3 py-1 rounded-lg bg-gradient-to-br ${u.color} text-white text-xs font-semibold shadow-lg hover:shadow-xl transition`}>
                                  Join
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 text-right">
                        <button className={`text-sm flex items-center gap-1 ml-auto transition ${
                          isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-500"
                        }`}>
                          View all <ChevronRight size={16} />
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Activity className="text-violet-400" size={24} />
                            Recent
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Last 5 attempts</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {recent.slice(0, 5).map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className={`p-3 rounded-xl transition cursor-pointer ${
                              isDark 
                                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 hover:border-white/20" 
                                : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{r.role}</div>
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>{r.company} • {r.date}</div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold text-sm ${r.result === "Pass" ? "text-emerald-400" : "text-rose-400"}`}>
                                  {r.result}
                                </div>
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>Score: {r.score}</div>
                              </div>
                            </div>
                            <div className={`text-xs italic ${isDark ? "text-slate-500" : "text-gray-500"}`}>{r.feedback}</div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 text-right">
                        <button className={`text-sm flex items-center gap-1 ml-auto transition ${
                          isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-500"
                        }`}>
                          Full history <ChevronRight size={16} />
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              </div>

              {/* Bottom Row: AI Suggestions + Achievements */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <GlassCard isDark={isDark}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <Zap className="text-yellow-400" size={24} />
                          AI Suggestions
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Personalized tips</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { title: "Practice: Algo Problems", desc: "Focus on arrays & graphs. Try timed mocks.", color: "from-blue-500 to-cyan-500" },
                        { title: "Improve Communication", desc: "Record explanations and compare with samples.", color: "from-violet-500 to-purple-500" },
                        { title: "System Design Primer", desc: "Review scalability patterns for senior roles.", color: "from-emerald-500 to-teal-500" },
                      ].map((tip, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className={`relative overflow-hidden p-4 rounded-xl cursor-pointer group ${
                            isDark 
                              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10" 
                              : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          <div className="relative z-10">
                            <div className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{tip.title}</div>
                            <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>{tip.desc}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <GlassCard isDark={isDark}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <Trophy className="text-yellow-400" size={24} />
                          Achievements
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>2 of 4 unlocked</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((ach, i) => (
                        <motion.div
                          key={ach.id}
                          whileHover={{ scale: ach.unlocked ? 1.05 : 1 }}
                          className={`p-4 rounded-xl border transition ${
                            ach.unlocked
                              ? isDark
                                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                                : "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400"
                              : isDark
                                ? "bg-slate-800/30 border-slate-700/50 opacity-50"
                                : "bg-gray-100/30 border-gray-300/50 opacity-50"
                          }`}
                        >
                          <ach.icon className={ach.unlocked ? "text-yellow-400" : isDark ? "text-slate-600" : "text-gray-400"} size={24} />
                          <div className={`mt-2 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{ach.title}</div>
                          <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>{ach.description}</div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}