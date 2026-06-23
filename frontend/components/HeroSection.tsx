import { Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-4">
                AI-Powered Healthcare
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Meet <span className="text-blue-600">Nova</span>
              </h1>
              <p className="text-2xl text-slate-600 dark:text-slate-300 font-semibold mb-4">
                Your AI Healthcare Receptionist
              </p>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Nova is an intelligent voice agent designed to revolutionize healthcare appointment management. She seamlessly handles booking, cancellations, rescheduling, and patient inquiries—24/7, with natural conversation and zero wait times.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  &lt; 1s
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Uptime
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  99.9%
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Languages
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Multi
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  98%+
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  document.getElementById('call-interface')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Try Nova Now
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold rounded-lg transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column - Video */}
          <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Play className="w-10 h-10 text-blue-600 ml-1" />
                </div>
                <p className="text-white font-semibold">
                  2-Minute Walkthrough
                </p>
                <p className="text-sm text-slate-200">
                  Click to watch Maya in action
                </p>
              </div>
            </div>
            {/* Placeholder iframe - replace src with your video URL */}
            <iframe
              className="w-full h-full hidden"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
              title="Nova Healthcare AI Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
