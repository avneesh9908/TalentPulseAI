import { useState } from "react";
import { useTheme } from "@/App";
import { motion } from "framer-motion";
import { 
  Menu, X, ArrowRight, CheckCircle2, Sparkles, Mic, BarChart3, 
  Code, Brain, Target, Play, ChevronRight, Github, Twitter, Linkedin, Sun, Moon
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const interviewTracks = [
    { name: "Python Interview", icon: "🐍", color: "from-blue-500 to-cyan-500", topics: "Core Python, DSA, OOP" },
    { name: "JavaScript Interview", icon: "⚡", color: "from-yellow-500 to-orange-500", topics: "ES6+, Async, DOM" },
    { name: "React Interview", icon: "⚛️", color: "from-cyan-500 to-blue-500", topics: "Hooks, State, Components" },
    { name: "C++ DSA", icon: "💻", color: "from-violet-500 to-purple-500", topics: "STL, Algorithms, Pointers" },
    { name: "Node.js Backend", icon: "🟢", color: "from-emerald-500 to-teal-500", topics: "Express, APIs, MongoDB" },
    { name: "Data Science", icon: "📊", color: "from-pink-500 to-rose-500", topics: "Pandas, ML, Statistics" },
  ];

  const features = [
    { icon: Sparkles, title: "AI-Generated Questions", desc: "Dynamic, role-specific questions powered by AI" },
    { icon: Mic, title: "Video & Voice Analysis", desc: "Advanced cheating detection & behavior analysis" },
    { icon: BarChart3, title: "Performance Analytics", desc: "Detailed reports with skill-wise breakdown" },
    { icon: Target, title: "Resume-Based", desc: "Questions personalized to your experience" },
    { icon: Code, title: "Real Simulations", desc: "Practice like it's a real interview" },
    { icon: Brain, title: "AI Feedback", desc: "Instant improvement tips from AI mentor" },
  ];

  const steps = [
    {
      icon: Target,
      title: "Choose Interview",
      desc: "Select role, technology & difficulty level",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Mic,
      title: "AI Interview",
      desc: "Answer AI-generated questions via video/audio",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: BarChart3,
      title: "Instant Report",
      desc: "Get score, strengths & improvement tips",
      color: "from-emerald-500 to-teal-500"
    },
  ];

  const stats = [
    { value: "50K+", label: "Interviews Conducted" },
    { value: "85%", label: "Success Rate" },
    { value: "24/7", label: "AI Availability" },
    { value: "4.9★", label: "User Rating" },
  ];

  // Reusable card class
  const cardClass = isDark
    ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  const subTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const sectionBgClass = isDark ? "bg-slate-900/50" : "bg-slate-50";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" 
        : "bg-gradient-to-b from-white via-slate-50 to-white text-slate-900"
    }`}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-violet-500/10" : "bg-violet-200/40"
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-200/40"
        }`} style={{ animationDelay: "1s" }}></div>
      </div>

      {/* ── Header ── */}
      <header className={`relative z-50 sticky top-0 backdrop-blur-xl border-b ${
        isDark
          ? "bg-slate-900/80 border-white/10 text-white"
          : "bg-white/80 border-slate-200 text-slate-900"
      }`}>
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">
                TalentPulse<span className="text-cyan-500">AI</span>
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {["#features", "#how-it-works", "#tracks", "/explore", "/demo"].map((href, i) => (
                <a
                  key={i}
                  href={href}
                  className={`transition text-sm font-medium ${
                    isDark
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-600 hover:text-violet-600"
                  }`}
                >
                  {["Features", "How It Works", "Tracks", "Explore", "Demo"][i]}
                </a>
              ))}
            </div>

            {/* Desktop CTA + Theme toggle */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "bg-slate-800 text-yellow-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <a href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  Login
                </motion.button>
              </a>
              <a href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition shadow-lg"
                >
                  Get Started Free
                </motion.button>
              </a>
            </div>

            {/* Mobile right controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "bg-slate-800 text-yellow-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden mt-4 py-4 border-t ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-4">
                {["#features", "#how-it-works", "#tracks", "/explore", "/demo"].map((href, i) => (
                  <a
                    key={i}
                    href={href}
                    className={`transition text-sm font-medium ${
                      isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-violet-600"
                    }`}
                  >
                    {["Features", "How It Works", "Tracks", "Explore", "Demo"][i]}
                  </a>
                ))}
                <div className={`flex flex-col gap-2 pt-4 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}>
                  <a
                    href="/auth/login"
                    className={`px-4 py-2 rounded-lg text-center text-sm font-medium ${
                      isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Login
                  </a>
                  <a
                    href="/auth/register"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-center text-sm font-medium"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-block px-4 py-2 rounded-full text-sm mb-6 border ${
                isDark
                  ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                  : "bg-violet-50 border-violet-200 text-violet-600"
              }`}>
                🚀 AI-Powered Interview Platform
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Practice Real AI Interviews.{" "}
                <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                  Get Instant Feedback.
                </span>
              </h1>

              <p className={`text-xl mb-8 leading-relaxed ${subTextClass}`}>
                TalentPulseAI simulates real interviews using advanced AI. Answer via video/audio, get scored in seconds, and improve with personalized smart feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/demo">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition shadow-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Play size={20} />
                    Try Free Demo
                  </motion.button>
                </a>
                <a href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition border ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-white/10"
                        : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm"
                    }`}
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </motion.button>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mt-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-2xl font-bold ${isDark ? "text-cyan-400" : "text-violet-600"}`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs mt-1 ${subTextClass}`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right – hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className={`relative rounded-2xl overflow-hidden shadow-2xl border ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}>
                <img
                  src="https://huru.ai/wp-content/uploads/2025/08/Huru-on-Desktop-web.png"
                  alt="AI Interview Platform"
                  className="w-full h-auto"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isDark ? "from-slate-900/80" : "from-white/40"
                } to-transparent`}></div>
              </div>

              {/* Floating success card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`absolute -bottom-6 -left-6 backdrop-blur-xl border rounded-xl p-4 shadow-2xl ${
                  isDark
                    ? "bg-slate-900/90 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="text-white" size={24} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                      Interview Completed!
                    </div>
                    <div className={`text-xs ${subTextClass}`}>Score: 89/100</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className={`py-24 px-6 ${sectionBgClass}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className={`text-xl ${subTextClass}`}>Get started in 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8 }}
                className={`relative backdrop-blur-xl border rounded-2xl p-8 transition ${cardClass}`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center mb-6`}>
                  <step.icon className="text-white" size={32} />
                </div>
                <div className={`absolute top-4 right-4 text-6xl font-bold ${
                  isDark ? "text-white/5" : "text-slate-100"
                }`}>{i + 1}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className={subTextClass}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why TalentPulseAI?</h2>
            <p className={`text-xl ${subTextClass}`}>Powerful features to ace your interviews</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className={`backdrop-blur-xl border rounded-2xl p-6 transition hover:border-violet-500/40 ${cardClass}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isDark ? "bg-violet-500/20" : "bg-violet-50"
                }`}>
                  <feature.icon className={isDark ? "text-violet-400" : "text-violet-600"} size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={`text-sm ${subTextClass}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interview Tracks ── */}
      <section id="tracks" className={`py-24 px-6 ${sectionBgClass}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Interview Tracks</h2>
            <p className={`text-xl ${subTextClass}`}>Choose your domain and start practicing</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewTracks.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 group cursor-pointer transition ${cardClass}`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{track.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{track.name}</h3>
                  <p className={`text-sm mb-4 ${subTextClass}`}>{track.topics}</p>
                  <div className={`flex items-center font-semibold group-hover:gap-2 transition-all ${
                    isDark ? "text-violet-400" : "text-violet-600"
                  }`}>
                    Start Practice
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-600 rounded-3xl p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to Crack Your Next Interview?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start your AI-powered mock interview today and land your dream tech job.
              </p>
              <a href="/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl bg-white text-violet-600 hover:bg-gray-100 transition shadow-2xl font-bold text-lg flex items-center gap-2 mx-auto"
                >
                  Start Free Interview Now
                  <ArrowRight size={24} />
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`relative border-t py-12 px-6 ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">
                  TalentPulse<span className="text-cyan-500">AI</span>
                </span>
              </div>
              <p className={`text-sm ${subTextClass}`}>
                AI-powered interview platform to help you ace your tech interviews.
              </p>
              <div className="flex gap-4 mt-4">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="/explore" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Explore</a></li>
                <li><a href="/demo" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Demo</a></li>
                <li><a href="#features" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Features</a></li>
                <li><a href="#tracks" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Tracks</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="#" className="hover:text-violet-600 transition">About Us</a></li>
                <li><a href="#" className="hover:text-violet-600 transition">Blog</a></li>
                <li><a href="#" className="hover:text-violet-600 transition">Careers</a></li>
                <li><a href="#" className="hover:text-violet-600 transition">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="#" className="hover:text-violet-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-violet-600 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-violet-600 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm ${subTextClass} ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}>
            <p>© {new Date().getFullYear()} TalentPulseAI. All rights reserved.</p>
            <p>Made with ❤️ for aspiring developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}