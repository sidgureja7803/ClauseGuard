import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, FileText, Clock, Target, Users, CheckCircle, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import AnimatedCounter from './AnimatedCounter'

interface AnalyticsData {
  contractsAnalyzed: number
  risksFound: number
  timeSaved: number
  riskReduction: number
  teamMembers: number
  avgAnalysisTime: number
  monthlyTrend: number[]
  riskDistribution: { critical: number; high: number; medium: number; low: number }
  recentActivity: Array<{
    id: string
    type: 'analysis' | 'risk' | 'team'
    message: string
    timestamp: Date
  }>
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'team'>('overview')

  // Simulate data loading
  useEffect(() => {
    const mockData: AnalyticsData = {
      contractsAnalyzed: 247,
      risksFound: 589,
      timeSaved: 164,
      riskReduction: 73,
      teamMembers: 8,
      avgAnalysisTime: 3.2,
      monthlyTrend: [45, 52, 38, 61, 73, 89, 67, 82, 94, 78, 85, 92],
      riskDistribution: { critical: 23, high: 87, medium: 145, low: 334 },
      recentActivity: [
        {
          id: '1',
          type: 'analysis',
          message: 'Software License Agreement analyzed - 3 high risks found',
          timestamp: new Date(Date.now() - 1000 * 60 * 15)
        },
        {
          id: '2',
          type: 'risk',
          message: 'Critical liability clause flagged in Employment Contract',
          timestamp: new Date(Date.now() - 1000 * 60 * 45)
        },
        {
          id: '3',
          type: 'team',
          message: 'Sarah Chen completed review of Vendor Agreement',
          timestamp: new Date(Date.now() - 1000 * 60 * 90)
        }
      ]
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your contract analysis performance and impact</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live data</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
          { key: 'team', label: 'Team Performance', icon: Users }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="text-blue-600 text-sm font-medium">+12% this month</div>
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                <AnimatedCounter value={data.contractsAnalyzed.toString()} />
              </div>
              <div className="text-blue-700 font-medium">Contracts Analyzed</div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="text-orange-600 text-sm font-medium">-8% risk reduction</div>
              </div>
              <div className="text-3xl font-bold text-orange-900 mb-1">
                <AnimatedCounter value={data.risksFound.toString()} />
              </div>
              <div className="text-orange-700 font-medium">Risks Identified</div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="text-green-600 text-sm font-medium">2.3x faster</div>
              </div>
              <div className="text-3xl font-bold text-green-900 mb-1">
                <AnimatedCounter value={data.timeSaved.toString()} />h
              </div>
              <div className="text-green-700 font-medium">Time Saved</div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="text-purple-600 text-sm font-medium">Industry leading</div>
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                <AnimatedCounter value={data.riskReduction.toString()} />%
              </div>
              <div className="text-purple-700 font-medium">Risk Reduction</div>
            </div>
          </div>

          {/* Trend Chart Placeholder */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Analysis Trend</h3>
            <div className="flex items-end space-x-2 h-32">
              {data.monthlyTrend.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-1000 hover:bg-blue-600"
                    style={{ height: `${(value / Math.max(...data.monthlyTrend)) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-8">
          {/* Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-4">
                {Object.entries(data.riskDistribution).map(([level, count]) => {
                  const colors = {
                    critical: 'bg-red-500',
                    high: 'bg-orange-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-green-500'
                  }
                  const total = Object.values(data.riskDistribution).reduce((a, b) => a + b, 0)
                  const percentage = (count / total) * 100

                  return (
                    <div key={level} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium capitalize">{level}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={cn('h-3 rounded-full transition-all duration-1000', colors[level as keyof typeof colors])}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-sm font-bold text-right">{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Avg Analysis Time</span>
                  <span className="font-bold text-blue-600">{data.avgAnalysisTime}s</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-bold text-purple-600">{data.teamMembers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-green-600">97.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => {
                const icons = {
                  analysis: FileText,
                  risk: AlertTriangle,
                  team: Users
                }
                const colors = {
                  analysis: 'text-blue-600 bg-blue-50',
                  risk: 'text-orange-600 bg-orange-50',
                  team: 'text-green-600 bg-green-50'
                }
                const Icon = icons[activity.type]

                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                    <div className={cn('p-2 rounded-lg', colors[activity.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-gray-500 text-sm">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Impact Summary */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Impact This Month</h3>
            <p className="text-blue-100">
              You've saved <span className="font-bold">{data.timeSaved} hours</span> and identified{' '}
              <span className="font-bold">{data.risksFound} risks</span> across{' '}
              <span className="font-bold">{data.contractsAnalyzed} contracts</span>
            </p>
          </div>
          <CheckCircle className="h-12 w-12 text-green-300" />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard 