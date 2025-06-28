import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

// Import images
import logoImage from '/logo.png'
import backgroundImage from '/background.png'

const SignInPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
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
            Welcome back
          </h1>
          <p className="text-white/80 mb-8">
            Sign in to continue to ClauseGuard
          </p>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 w-full shadow-lg',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 w-full',
                card: 'bg-transparent shadow-none border-0 p-0',
                rootBox: 'w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButtonText: 'font-medium text-sm',
                formFieldInput: 'block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
                formFieldLabel: 'block text-sm font-semibold text-gray-700 mb-2',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
                identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
                formResendCodeLink: 'text-blue-600 hover:text-blue-700',
                otpCodeFieldInput: 'block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500 text-sm font-medium',
                formFieldAction: 'text-blue-600 hover:text-blue-700 text-sm font-semibold'
              },
              layout: {
                socialButtonsPlacement: 'top'
              }
            }}
            redirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
        
        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-white/80">
            Don't have an account?{' '}
            <Link 
              to="/sign-up" 
              className="text-white font-semibold hover:text-white/80 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
        
        {/* Security Note */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center text-white/70 text-sm bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <Shield className="h-4 w-4 mr-2" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage 