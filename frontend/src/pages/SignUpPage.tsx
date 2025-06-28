import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle, Zap, Users } from 'lucide-react'

// Import images
import logoImage from '/logo.png'
import backgroundImage from '/background.png'

const SignUpPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          to="/" 
          className="flex items-center text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to home</span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <img 
                src={logoImage} 
                alt="ClauseGuard" 
                className="h-12 w-auto mx-auto"
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Join ClauseGuard
          </h1>
          <p className="text-white/80 mb-8">
            Start analyzing contracts with AI in minutes
          </p>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          {/* Benefits Preview */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200">
                <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-emerald-700">2,500+</div>
                <div className="text-xs text-emerald-600">Users</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                <Zap className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-blue-700">Fast</div>
                <div className="text-xs text-blue-600">Analysis</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200">
                <CheckCircle className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-purple-700">Free</div>
                <div className="text-xs text-purple-600">Trial</div>
              </div>
            </div>
          </div>

          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 w-full shadow-lg',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 w-full',
                card: 'bg-transparent shadow-none border-0 p-0',
                rootBox: 'w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButtonText: 'font-medium text-sm',
                formFieldInput: 'block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white',
                formFieldLabel: 'block text-sm font-semibold text-gray-700 mb-2',
                footerActionLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
                identityPreviewEditButton: 'text-emerald-600 hover:text-emerald-700',
                formResendCodeLink: 'text-emerald-600 hover:text-emerald-700',
                otpCodeFieldInput: 'block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center bg-white',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500 text-sm font-medium',
                formFieldAction: 'text-emerald-600 hover:text-emerald-700 text-sm font-semibold'
              },
              layout: {
                socialButtonsPlacement: 'top'
              }
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>
        
        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-white/80">
            Already have an account?{' '}
            <Link 
              to="/sign-in" 
              className="text-white font-semibold hover:text-white/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        {/* Free Trial Info */}
        <div className="text-center mt-6">
          <div className="p-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-white font-semibold">
              🎉 Start with a free trial - 10 contract analyses included
            </p>
          </div>
        </div>
        
        {/* Terms */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/70">
            By signing up, you agree to our{' '}
            <a href="#" className="text-white hover:text-white/80 font-medium underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-white hover:text-white/80 font-medium underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage 