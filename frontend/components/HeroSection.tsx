import { useState } from 'react'
import { Play } from 'lucide-react'

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  // Replace this with your actual YouTube Embed ID (the characters after v=)
  // Your exact YouTube video configuration string
   const videoId = "UnPZedLGgy4";
   const embedUrl = `https://youtube.com/embed/${videoId}?autoplay=1&rel=0`;


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
                  English
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  90%+
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
              <button 
                onClick={() => setIsPlaying(true)}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold rounded-lg transition-colors"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column - Video Player & Image Overlay */}
          <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700">
            {!isPlaying ? (
              <div 
                className="absolute inset-0 cursor-pointer group"
                onClick={() => setIsPlaying(true)}
              >
                {/* Background Image Placeholder */}
                <img
                  src="/nova.jpg" 
                  alt="Nova Healthcare AI Demo Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Styled Information & Action Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors p-4 text-center">
                  <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                    <Play className="w-10 h-10 text-blue-600 ml-1 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-white font-semibold mt-4 text-lg drop-shadow-md">
                    2-Minute Walkthrough
                  </p>
                  <p className="text-sm text-slate-200 drop-shadow-md">
                    Click to watch Nova in action
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title="Nova Healthcare AI Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
