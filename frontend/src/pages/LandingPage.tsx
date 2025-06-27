import { Link } from 'react-router-dom'
import { Search, AlertTriangle, Edit3, Upload, ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { FeatureCard } from '@/types'

const features: FeatureCard[] = [
  {
    icon: Search,
    title: 'Clause Summarization',
    description: 'AI-powered breakdown of complex contract clauses into digestible summaries',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: AlertTriangle,
    title: 'Risk Detection',
    description: 'Identify potentially risky clauses with confidence scores and detailed explanations',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Edit3,
    title: 'Safe Rewrite Suggestions',
    description: 'Get AI-generated alternatives for risky clauses that protect your interests',
    color: 'from-green-500 to-emerald-500'
  }
]

const stats = [
  { label: 'Contracts Analyzed', value: '10,000+' },
  { label: 'Risk Issues Found', value: '25,000+' },
  { label: 'Legal Teams', value: '500+' },
  { label: 'Time Saved', value: '1000+ hrs' }
]

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ClauseGuard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/sign-in"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Scan Your Contracts for
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                {' '}Risk in Seconds
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              AI-powered clause auditing for legal, procurement & founders. 
              Identify risks, get summaries, and receive safe rewrite suggestions instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                to="/sign-up"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Upload className="h-5 w-5" />
                <span>Upload Contract</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/sign-up"
                className="btn-secondary font-semibold py-4 px-8 rounded-xl"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-gray-500">Contract Analysis</div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-subtle"></div>
                  <div className="text-sm text-red-700">High Risk Clause Detected</div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm text-green-700">Safe Alternative Suggested</div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-primary-100 rounded-full p-4 animate-pulse-subtle">
              <Zap className="h-8 w-8 text-primary-600" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-green-100 rounded-full p-4 animate-pulse-subtle">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Analysis Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our IBM Granite-powered AI engine analyzes contracts with enterprise-grade accuracy and speed
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Protect Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of legal professionals who trust ClauseGuard for contract analysis
          </p>
          <Link
            to="/sign-up"
            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>Start Free Analysis</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-semibold">ClauseGuard</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 ClauseGuard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 