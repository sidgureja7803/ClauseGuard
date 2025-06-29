import { useState } from 'react'
import { useSignUp } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Shield, Chrome, Github, Loader2, CheckCircle2, User, Mail } from 'lucide-react'

// Import images
import logoImage from '/logo.png'
import backgroundImage from '/background.png'

const SignUpPage = () => {
  const { signUp, setActive } = useSignUp()
  const navigate = useNavigate()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!signUp) {
      setError('Authentication not available')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!signUp) {
      setError('Authentication not available')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signUp) {
      setError('Authentication not available')
      return
    }

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err) {
      setError('Failed to sign up with Google')
    }
  }

  const handleGithubSignUp = async () => {
    if (!signUp) {
      setError('Authentication not available')
      return
    }

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_github',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err) {
      setError('Failed to sign up with GitHub')
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Main container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6">
              <img src={logoImage} alt="ClauseGuard" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-white/70">We sent a verification code to {email}</p>
          </div>

          {/* Verification Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
            <form onSubmit={handleVerification} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-white font-semibold mb-3">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Email</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Back to home */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-white/80 hover:text-white transition-colors z-10 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to home</span>
      </Link>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6">
            <img src={logoImage} alt="ClauseGuard" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join ClauseGuard</h1>
          <p className="text-white/70">Start analyzing contracts with AI</p>
          
          {/* Stats */}
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-white">2,500+</div>
              <div className="text-xs text-white/60">Users</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">Fast</div>
              <div className="text-xs text-white/60">Analysis</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">Free</div>
              <div className="text-xs text-white/60">Trial</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
            <button
              onClick={handleGithubSignUp}
              className="w-full flex items-center justify-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/70 font-medium">or create account</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-3">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-4 pr-12 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500" required />
              <span className="text-white/70 text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 font-medium">Privacy Policy</Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">Free Trial</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">No Setup</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage 