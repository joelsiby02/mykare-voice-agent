import { Code2, Mail, Heart, Briefcase } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <h3 className="text-xl font-bold text-white">Nova</h3>
            </div>
            <p className="text-sm text-slate-400">
              AI-powered healthcare receptionist for modern clinics.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-blue-400 transition-colors">
                  Creator
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.livekit.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  LiveKit Docs
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/joelsiby"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="mailto:hello@joelsiby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/joelsiby"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Briefcase className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/joelsiby"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Code2 className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left - Copyright */}
            <p className="text-sm text-slate-400">
              &copy; {currentYear} Joel Siby. All rights reserved.
            </p>

            {/* Center - Built with */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>using Next.js, React & LiveKit</span>
            </div>

            {/* Right - Links */}
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#terms" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
