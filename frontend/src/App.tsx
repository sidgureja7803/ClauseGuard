import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import History from './pages/History'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={isSignedIn ? <Navigate to="/dashboard" /> : <LandingPage />} 
      />
      <Route 
        path="/sign-in" 
        element={isSignedIn ? <Navigate to="/dashboard" /> : <SignInPage />} 
      />
      <Route 
        path="/sign-up" 
        element={isSignedIn ? <Navigate to="/dashboard" /> : <SignUpPage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={isSignedIn ? <Layout><Dashboard /></Layout> : <Navigate to="/sign-in" />} 
      />
      <Route 
        path="/upload" 
        element={isSignedIn ? <Layout><Upload /></Layout> : <Navigate to="/sign-in" />} 
      />
      <Route 
        path="/history" 
        element={isSignedIn ? <Layout><History /></Layout> : <Navigate to="/sign-in" />} 
      />
      <Route 
        path="/settings" 
        element={isSignedIn ? <Layout><Settings /></Layout> : <Navigate to="/sign-in" />} 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App 