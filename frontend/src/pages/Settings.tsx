import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Save
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [analysisAlerts, setAnalysisAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)

  const handleSavePreferences = async () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Preferences saved successfully!')
      setLoading(false)
    }, 1000)
  }

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion feature coming soon.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <img
              src={user?.imageUrl}
              alt={user?.firstName || 'User Avatar'}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-sm text-gray-400 mt-1">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Profile information is managed through your Clerk account. 
              <a href="#" className="text-primary-600 hover:text-primary-700 ml-1">
                Update profile →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Analysis Completion Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when contract analysis is complete</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analysisAlerts}
                onChange={(e) => setAnalysisAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
              <p className="text-sm text-gray-500">Receive weekly summary of your contract analyses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyReports}
                onChange={(e) => setWeeklyReports(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleSavePreferences}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Usage & Billing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Usage & Billing</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">2,450</div>
              <div className="text-sm text-gray-500">Tokens Used</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">7,550</div>
              <div className="text-sm text-gray-500">Tokens Remaining</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">Free</div>
              <div className="text-sm text-gray-500">Current Plan</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h3 className="font-medium text-blue-900">Upgrade to Pro</h3>
              <p className="text-sm text-blue-700">Get unlimited analyses and priority support</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Data & Privacy</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Export Your Data</h3>
              <p className="text-sm text-gray-500">Download all your contract analyses and data</p>
            </div>
            <button
              onClick={handleExportData}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 