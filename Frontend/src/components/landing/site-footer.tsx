/**
 * Public site footer — shared by the parent landing page and both product
 * pages. Product column links to the two sides so either page can reach the
 * other.
 */
import { Github, Linkedin, Sparkles, Twitter } from "lucide-react";
import { SocialIcons } from "@/components/ui/social-icons";
import { useTheme } from "@/contexts/use-theme";

export default function SiteFooter() {
  const { isDark } = useTheme();
  const subTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const linkClass = `transition hover:${isDark ? "text-white" : "text-violet-600"}`;

  return (
    <footer className={`relative border-t px-6 py-12 ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <a href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="font-display text-xl font-bold">
                TalentPulse<span className="text-cyan-500">AI</span>
              </span>
            </a>
            <p className={`text-sm ${subTextClass}`}>
              Practice AI interviews and find matching jobs — one platform, two sides.
            </p>
            <SocialIcons
              className="mt-4"
              links={[
                { label: "Twitter", href: "#", icon: <Twitter size={16} /> },
                { label: "GitHub", href: "#", icon: <Github size={16} /> },
                { label: "LinkedIn", href: "#", icon: <Linkedin size={16} /> },
              ]}
            />
          </div>

          {/* Product — both sides reachable from either page */}
          <div>
            <h3 className="mb-4 font-bold">Product</h3>
            <ul className={`space-y-2 text-sm ${subTextClass}`}>
              <li><a href="/practice" className={linkClass}>Interview Practice</a></li>
              <li><a href="/find-jobs" className={linkClass}>Job Search</a></li>
              <li><a href="/demo" className={linkClass}>Try Demo</a></li>
              <li><a href="/auth/register" className={linkClass}>Get Started Free</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-bold">Company</h3>
            <ul className={`space-y-2 text-sm ${subTextClass}`}>
              <li><a href="#" className="transition hover:text-violet-600">About Us</a></li>
              <li><a href="#" className="transition hover:text-violet-600">Blog</a></li>
              <li><a href="#" className="transition hover:text-violet-600">Careers</a></li>
              <li><a href="#" className="transition hover:text-violet-600">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-bold">Legal</h3>
            <ul className={`space-y-2 text-sm ${subTextClass}`}>
              <li><a href="#" className="transition hover:text-violet-600">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-violet-600">Terms of Service</a></li>
              <li><a href="#" className="transition hover:text-violet-600">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div
          className={`flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm md:flex-row ${subTextClass} ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <p>© {new Date().getFullYear()} TalentPulseAI. All rights reserved.</p>
          <p>Made with ❤️ for aspiring developers</p>
        </div>
      </div>
    </footer>
  );
}
