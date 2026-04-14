import { motion } from "framer-motion";
import { useTheme } from "@/contexts/use-theme";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function Profile() {
  const { isDark } = useTheme();

  // Placeholder user data
  const userData = {
    name: "User Name",
    email: "user@example.com",
    phone: "+1 (555) 000-0000",
    title: "Software Engineer",
    bio: "Passionate about building great products",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
          <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Manage your account settings and personal information
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`rounded-xl border p-8 ${
            isDark
              ? "bg-slate-800/50 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          {/* Profile Picture & Basic Info */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              U
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {userData.title}
              </p>
              <p className="text-sm text-slate-500 mt-1">{userData.bio}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold">Personal Information</h3>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Mail size={20} className="text-violet-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Email Address
                </p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Phone size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Phone Number
                </p>
                <p className="font-medium">{userData.phone}</p>
              </div>
            </div>

            {/* Title/Role */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Briefcase size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Current Role
                </p>
                <p className="font-medium">{userData.title}</p>
              </div>
            </div>
          </div>

          {/* Resume & Documents */}
          <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
            <h3 className="text-xl font-bold">Resume & Documents</h3>
            <button
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                isDark
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Resume</p>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Upload or update your resume
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            <button
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                isDark
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Update your password
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-400" />
            </button>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-8 p-4 rounded-lg border ${
            isDark
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            💡 Full profile editing features coming soon!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
