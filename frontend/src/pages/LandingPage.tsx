import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, AlertTriangle, Edit3, Shield, Zap, Users, 
  Star, Play, FileText, Clock, BarChart3
} from 'lucide-react'
import { FeatureCard } from '../types'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import GradientText from '../components/ui/GradientText'
import FloatingCTA from '../components/ui/FloatingCTA'
import IBMBadge from '../components/ui/IBMBadge'
import HowItWorksModal from '../components/ui/HowItWorksModal'
import SampleContractDemo from '../components/ui/SampleContractDemo'
import OnboardingTooltips from '../components/ui/OnboardingTooltips'

// Import your images - adjust paths as needed
import logoImage from '/logo.png'
import backgroundImage from '/background.png'

const features: FeatureCard[] = [
  {
    icon: Search,
    title: 'AI-Powered Analysis',
    description: 'Advanced IBM Granite models analyze every clause with enterprise-grade precision and lightning speed',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: AlertTriangle,
    title: 'Smart Risk Detection',
    description: 'Identify hidden risks and legal vulnerabilities with confidence scores and detailed explanations',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Edit3,
    title: 'Intelligent Rewrites',
    description: 'Get AI-generated safe alternatives that protect your interests while maintaining original intent',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and security protocols ensure your sensitive documents stay protected',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process complex contracts in seconds, not hours. Get instant results with real-time analysis',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Track contract patterns, risk trends, and team performance with comprehensive dashboards',
    color: 'from-indigo-500 to-blue-500'
  }
]

const stats = [
  { label: 'Contracts Analyzed', value: '50,000+', icon: FileText },
  { label: 'Risk Issues Found', value: '125,000+', icon: AlertTriangle },
  { label: 'Legal Teams', value: '2,500+', icon: Users },
  { label: 'Time Saved', value: '10,000+ hrs', icon: Clock }
]

const testimonials = [
  {
    quote: "ClauseGuard transformed our contract review process. We catch risks 3x faster and our legal team is more productive than ever.",
    author: "Sarah Chen",
    role: "General Counsel",
    company: "TechFlow Inc.",
    avatar: "SC"
  },
  {
    quote: "The AI suggestions are incredibly accurate. It's like having a senior lawyer review every contract alongside our team.",
    author: "Michael Rodriguez",
    role: "Legal Director",
    company: "Innovate Labs",
    avatar: "MR"
  },
  {
    quote: "Reduced our contract review time by 70% while improving accuracy. ClauseGuard is a game-changer for legal operations.",
    author: "Emily Thompson",
    role: "Chief Legal Officer",
    company: "Global Dynamics",
    avatar: "ET"
  }
]



export default function LandingPage() {
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [, setShowDemo] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/sign-in')
  }

  const handleSignUp = () => {
    navigate('/sign-up')
  }

  const handleStartTrial = () => {
    navigate('/sign-up')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingTooltips 
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
      
      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo Section */}
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="ClauseGuard Logo" 
                  className="h-16 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-105"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
                  ClauseGuard
                </span>
                <span className="text-sm text-blue-600 font-medium">
                  AI Risk Analyzer
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setShowHowItWorks(true)}
                className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
              >
                How it Works
              </button>
              <a 
                href="#features" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
              >
                Testimonials
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignIn}
                className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.85), rgba(29, 78, 216, 0.85)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Enhanced Overlay with Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center">
            {/* Enhanced Logo Section with Animation */}
            <div className="mb-16 flex flex-col items-center">
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
                  <img 
                    src={logoImage} 
                    alt="ClauseGuard" 
                    className="relative h-48 lg:h-56 w-auto opacity-95 drop-shadow-2xl transform group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                    <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      ClauseGuard
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-200 font-light leading-relaxed">
                    AI Risk Analyzer for Business Contracts
                  </p>
                  <div className="mt-4 flex items-center justify-center lg:justify-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm font-medium">Powered by IBM Granite AI</span>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <GradientText>AI-Powered Contract</GradientText>
              <br />
              Risk Analysis
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Powered by IBM Granite AI, ClauseGuard automatically identifies risks, 
              ensures compliance, and protects your business with intelligent contract analysis.
            </p>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <button
                onClick={handleStartTrial}
                className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl min-w-[200px]"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => setShowDemo(true)}
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 min-w-[200px] backdrop-blur-sm"
              >
                <Play className="inline-block w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
            
            <IBMBadge />
          </div>
        </div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-blue-400/30 rounded-full blur-xl animate-pulse">
          <div className="absolute inset-2 bg-white/10 rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-cyan-400/30 rounded-full blur-xl animate-pulse delay-1000">
          <div className="absolute inset-4 bg-white/5 rounded-full animate-ping delay-300"></div>
        </div>
        <div className="absolute top-1/2 left-8 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500">
          <div className="absolute inset-1 bg-blue-300/20 rounded-full animate-bounce"></div>
        </div>
        <div className="absolute top-1/4 right-8 w-20 h-20 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-700">
          <div className="absolute inset-2 bg-cyan-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 right-1/3 w-8 h-8 bg-green-400/40 rounded-full animate-bounce delay-200"></div>
        <div className="absolute bottom-20 left-1/3 w-6 h-6 bg-yellow-400/50 rounded-full animate-pulse delay-1500"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-6">
              <img 
                src={logoImage} 
                alt="ClauseGuard" 
                className="h-12 w-auto mr-4 opacity-80"
              />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Why Choose ClauseGuard?
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of contract analysis with our AI-powered platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.9)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6 backdrop-blur-sm">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-blue-100 font-medium text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Legal Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading companies are transforming their contract review process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.author}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-blue-600 font-semibold">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Demo Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See ClauseGuard in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Try our AI analysis with a sample contract right now. No signup required!
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <SampleContractDemo />
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section 
        className="relative py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Contract Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of businesses already using ClauseGuard to protect their interests
          </p>
          <button
            onClick={handleStartTrial}
            className="bg-white text-blue-600 px-12 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer 
        className="bg-gray-900 text-white py-16 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <img 
                    src={logoImage} 
                    alt="ClauseGuard" 
                    className="h-16 w-auto drop-shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    ClauseGuard
                  </span>
                  <div className="text-blue-400 text-sm font-medium">AI Risk Analyzer</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                AI-powered contract analysis that helps legal teams identify risks, 
                save time, and make better decisions with enterprise-grade security.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClauseGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
    </div>
  )
} 