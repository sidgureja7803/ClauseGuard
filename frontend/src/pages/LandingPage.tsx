import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, AlertTriangle, Edit3, Upload, ArrowRight, Shield, Zap, Users, 
  CheckCircle, Star, Play, Download, FileText, Clock, TrendingUp,
  Award, Sparkles, MousePointer, Eye, BarChart3, Layers
} from 'lucide-react'
import { FeatureCard } from '@/types'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import GradientText from '@/components/ui/GradientText'
import FloatingCTA from '@/components/ui/FloatingCTA'

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

const pricingFeatures = [
  'Unlimited contract uploads',
  'Advanced AI risk analysis',
  'Smart rewrite suggestions',
  'Real-time collaboration',
  'Enterprise security',
  'API access',
  'Priority support',
  '99.9% uptime SLA'
]

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
      }
    })
  }

  useEffect(() => {
    // Immediately show key sections
    const keyElements = document.querySelectorAll('#features-header, #testimonials-header, #pricing-header')
    keyElements.forEach(el => el.classList.add('revealed'))

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach(el => observer.observe(el))

    // Fallback: reveal all elements after 2 seconds if intersection observer fails
    const fallbackTimer = setTimeout(() => {
      const hiddenElements = document.querySelectorAll('.scroll-reveal:not(.revealed)')
      hiddenElements.forEach(el => el.classList.add('revealed'))
    }, 2000)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Add smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary-600 group-hover:animate-pulse-glow transition-all duration-300" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                ClauseGuard
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="btn-ghost"
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                onClick={(e) => handleSmoothScroll(e, 'testimonials')}
                className="btn-ghost"
              >
                Testimonials
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="btn-ghost"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/sign-in" className="btn-ghost">
                Sign In
              </Link>
              <Link to="/sign-up" className="btn-primary group">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
          </div>
          <div className="absolute top-40 right-10 animate-float animate-delay-300">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float animate-delay-500">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl" />
          </div>

          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Powered by IBM Granite AI • Trusted by 2,500+ Legal Teams
              </span>
            </div>

                         <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight animate-fade-in animate-delay-100">
               Scan Your Contracts for
               <br />
               <GradientText gradient="primary" animated className="text-6xl md:text-8xl font-black">
                 Risk in Seconds
               </GradientText>
             </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in animate-delay-200">
              AI-powered clause auditing for legal, procurement & founders. 
              <br className="hidden md:block" />
              Identify risks, get summaries, and receive safe rewrite suggestions instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in animate-delay-300">
              <Link to="/sign-up" className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <Upload className="h-6 w-6 mr-3 group-hover:animate-bounce-in" />
                  <span>Upload Contract Free</span>
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>

              <button className="group flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary-300 text-gray-700 font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Play className="h-6 w-6 mr-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="flex items-center justify-center mt-12 space-x-6 text-sm text-gray-500 animate-fade-in animate-delay-400">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Interactive Demo Preview */}
          <div className="relative max-w-6xl mx-auto animate-fade-in animate-delay-500">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-blue-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 transform group-hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse animate-delay-100" />
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse animate-delay-200" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Contract Analysis Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>Live Preview</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded-full animate-shimmer" />
                    <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-shimmer animate-delay-100" />
                    
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-red-700">High Risk Clause Detected</span>
                        <div className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">95% Confidence</div>
                      </div>
                      <p className="text-xs text-red-600 mt-2">Unlimited liability clause may expose company to significant financial risk</p>
                    </div>

                    <div className="h-4 bg-gray-200 rounded-full w-2/3 animate-shimmer animate-delay-200" />
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm font-semibold text-green-700">Safe Alternative Suggested</span>
                        <Sparkles className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">AI-generated clause with liability cap protection</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
                      Risk Analysis Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Overall Risk Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full animate-pulse" />
                          </div>
                          <span className="text-xs font-semibold text-red-600">High</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Clauses Reviewed</span>
                        <span className="text-xs font-semibold">24/24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Suggestions</span>
                        <span className="text-xs font-semibold text-green-600">8 Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-reveal" id="features-header">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6">
              <Layers className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">Powerful Features</span>
            </div>
                         <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
               Why Legal Teams
               <GradientText gradient="primary" animated> Love ClauseGuard</GradientText>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade AI analysis powered by IBM Granite models, designed for legal professionals who demand accuracy and speed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-hover premium-card bg-white rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-2xl scroll-reveal"
                id={`feature-${index}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className={`feature-icon inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 glow-effect transition-all duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center scroll-reveal"
                id={`stat-${index}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 group hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-white group-hover:animate-bounce-in" />
                </div>
                                 <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                   <AnimatedCounter value={stat.value} className="animate-shimmer" />
                 </div>
                <div className="text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-reveal" id="testimonials-header">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6">
              <Users className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">Customer Stories</span>
            </div>
                         <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
               Trusted by Legal
               <GradientText gradient="ocean" animated> Professionals</GradientText>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading companies are transforming their contract review process with ClauseGuard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 scroll-reveal premium-card"
                id={`testimonial-${index}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-primary-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-reveal" id="pricing-header">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6">
              <Award className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">Simple Pricing</span>
            </div>
                         <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
               Start Free,
               <GradientText gradient="sunset" animated> Scale Smart</GradientText>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with our free tier or upgrade to unlock enterprise features for your growing team
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 scroll-reveal premium-card" id="pricing-card">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-xl text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600">Perfect for legal teams and growing companies</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/sign-up"
                  className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Start Free Trial
                </Link>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900 via-primary-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="scroll-reveal" id="cta-section">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Ready to Transform Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Contract Reviews?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust ClauseGuard to identify risks, 
              save time, and protect their organizations every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/sign-up"
                className="group bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <button className="group flex items-center text-white hover:text-blue-400 font-semibold text-lg transition-colors duration-300">
                <Download className="h-6 w-6 mr-3 group-hover:animate-bounce-in" />
                <span>Download Whitepaper</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-bold">ClauseGuard</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                AI-powered contract analysis that helps legal teams identify risks, 
                save time, and make better decisions.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300 cursor-pointer">
                  <span className="text-sm font-semibold">Li</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300 cursor-pointer">
                  <span className="text-sm font-semibold">Tw</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClauseGuard. All rights reserved. Made with ❤️ for legal professionals.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  )
}

export default LandingPage 