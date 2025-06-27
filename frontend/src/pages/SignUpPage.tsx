import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ClauseGuard</span>
            </Link>
            <Link
              to="/sign-in"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Only Clerk's SignUp */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-sm normal-case',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
                card: 'bg-white rounded-2xl shadow-xl border border-gray-200',
                rootBox: 'w-full',
                headerTitle: 'text-3xl font-bold text-gray-900 mb-2',
                headerSubtitle: 'text-gray-600 mb-6'
              }
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
          
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage 