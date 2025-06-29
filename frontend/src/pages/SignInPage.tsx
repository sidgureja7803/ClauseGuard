import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Shield, Chrome, Github, Loader2, CheckCircle2 } from 'lucide-react'

// Import images
import logoImage from '/logo.png'
import backgroundImage from '/background.png'

const SignInPage = () => {
  const { signIn, setActive } = useSignIn()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!signIn) {
      setError('Authentication not available')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      setError('Authentication not available')
      return
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err) {
      setError('Failed to sign in with Google')
    }
  }

  const handleGithubSignIn = async () => {
    if (!signIn) {
      setError('Authentication not available')
      return
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_github',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err) {
      setError('Failed to sign in with GitHub')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />
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
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6">
            <img src={logoImage} alt="ClauseGuard" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/70">Sign in to your ClauseGuard account</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
            <button
              onClick={handleGithubSignIn}
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
              <span className="px-4 bg-transparent text-white/70 font-medium">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-white font-semibold mb-3">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-4 pr-12 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
                <span className="text-white/70 text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <p className="text-white/70">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-white/60 text-sm">
          <Shield className="w-4 h-4" />
          <span>Protected by enterprise-grade security</span>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">Fast</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white/70 text-sm font-medium">Trusted</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage 