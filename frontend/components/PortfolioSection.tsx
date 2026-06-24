import { ExternalLink, Code2, Mail, Globe, Briefcase, MapPin, GraduationCap, Award } from 'lucide-react'

export default function PortfolioSection() {
  const portfolioLinks = [
    {
      icon: Globe,
      label: 'Portfolio Website',
      url: 'https://joelsiby.vercel.app',
      description: 'View my projects and technical work',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Briefcase,
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/joelsiby/',
      description: 'Connect with me professionally',
      color: 'from-blue-700 to-blue-500',
    },
    {
      icon: Code2,
      label: 'GitHub',
      url: 'https://github.com/joolsiby02',
      description: 'Open source projects & contributions',
      color: 'from-gray-800 to-gray-600',
    },
    {
      icon: Mail,
      label: 'Email',
      url: 'mailto:joelag1235@gmail.com',
      description: 'Reach out directly for collaborations',
      color: 'from-red-500 to-pink-500',
    },
  ]

  return (
    <section
      id="portfolio"
      className="py-16 md:py-24 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Meet Joel Siby
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AI Engineer & Data Analytics Specialist | Building intelligent systems for healthcare and beyond
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left - Bio */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 h-full">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-5xl text-white font-bold">JS</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Joel Siby
              </h3>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4 font-semibold">
                AI & Machine Learning Engineer
              </p>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Bangalore, India</span>
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>B.Tech Computer Science (2025) · CGPA: 7.0</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>12+ months experience in AI/ML & Data Analytics</span>
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  I build AI systems that solve real problems – from neurostimulation prototypes to voice AI agents. Passionate about healthcare technology and scalable ML.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Links Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 active:scale-95"
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-lg`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {link.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {link.description}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Experience Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">🧠 Brainspired Labs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Data Analytics Intern · 12/2024 – 06/2025<br />
              Brain pattern classification for neurostimulation headset
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">🤖 Elcanos Pvt Ltd</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Machine Learning Intern · 06/2024 – 11/2024<br />
              NLP & LLM-based travel recommendation engine
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">📊 MarketBytes WebWorks</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Business Development & Analytics Intern · 09/2025 – 11/2025<br />
              Client engagement & data-driven solutions
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Technical Skills
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Python / Pandas / NumPy',
              'NLP / Transformers',
              'Machine Learning',
              'Data Analytics / EDA',
              'SQL / PostgreSQL',
              'Power BI / Excel',
              'Scikit-learn / TensorFlow',
              'LLMs / Prompt Engineering',
            ].map((skill) => (
              <div
                key={skill}
                className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Projects Highlight */}
        <div className="mt-8 bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Physician Notetaker
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Medical NLP pipeline · Transformers · spaCy · SOAP note generation
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Hotel Bar Inventory Forecast
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Time series forecasting · Inventory optimization · Pandas
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Open to collaborations and opportunities in AI, ML, and healthcare tech.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.linkedin.com/in/joelsiby/"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Get in Touch
            </a>
            <a
              href="https://joelsiby.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold rounded-lg transition-colors"
            >
              View Full Portfolio
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}