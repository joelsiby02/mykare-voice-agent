import { ExternalLink, Code2, Mail, Globe, Briefcase } from 'lucide-react'

export default function PortfolioSection() {
  const portfolioLinks = [
    {
      icon: Globe,
      label: 'Portfolio Website',
      url: 'https://joelsiby.com',
      description: 'My full portfolio and latest projects',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Briefcase,
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/joelsiby',
      description: 'Connect with me professionally',
      color: 'from-blue-700 to-blue-500',
    },
    {
      icon: Code2,
      label: 'GitHub',
      url: 'https://github.com/joelsiby',
      description: 'Check out my open source projects',
      color: 'from-gray-800 to-gray-600',
    },
    {
      icon: Mail,
      label: 'Email',
      url: 'mailto:hello@joelsiby.com',
      description: 'Get in touch directly',
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
            AI Engineer & Full-Stack Developer | Building innovative healthcare solutions with cutting-edge AI technology
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left - Bio */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-5xl text-white font-bold">JS</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Joel Siby
              </h3>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4 font-semibold">
                AI Engineer & Full-Stack Developer
              </p>
              <p className="text-center text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Specializing in voice AI, real-time communication systems, and healthcare technology. Passionate about building products that make a real impact.
              </p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>
                  <span className="font-semibold text-slate-900 dark:text-white">Location:</span> San Francisco, CA
                </p>
                <p>
                  <span className="font-semibold text-slate-900 dark:text-white">Expertise:</span> AI/ML, Voice Tech, Next.js
                </p>
                <p>
                  <span className="font-semibold text-slate-900 dark:text-white">Focus:</span> Healthcare & AI
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

        {/* Skills Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Technical Skills
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Next.js / React',
              'TypeScript',
              'Voice AI',
              'Real-time Systems',
              'Node.js',
              'PostgreSQL',
              'AWS / Cloud',
              'Python / ML',
            ].map((skill) => (
              <div
                key={skill}
                className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Interested in collaborating or have questions about this project?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@joelsiby.com"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Send Email
            </a>
            <a
              href="https://joelsiby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold rounded-lg transition-colors"
            >
              Visit Portfolio
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
