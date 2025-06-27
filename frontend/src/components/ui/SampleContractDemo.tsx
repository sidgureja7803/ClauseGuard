import React, { useState } from 'react'
import { Play, FileText, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import IBMBadge from './IBMBadge'

interface SampleContractDemoProps {
  className?: string
}

const SampleContractDemo: React.FC<SampleContractDemoProps> = ({ className }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const sampleContract = `
SOFTWARE LICENSE AGREEMENT

1. GRANT OF LICENSE
Licensor hereby grants to Licensee a non-exclusive, non-transferable license to use the Software.

2. LIABILITY
IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, 
INCLUDING WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, BUSINESS INTERRUPTION, LOSS OF DATA, 
OR ANY OTHER COMMERCIAL DAMAGES OR LOSSES, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY.

3. TERMINATION
This Agreement may be terminated by either party with 30 days written notice. Upon termination, 
Licensee must destroy all copies of the Software.

4. PAYMENT TERMS
Licensee agrees to pay all fees within 90 days of invoice date. Late payments will incur a 2% 
monthly penalty fee.

5. INDEMNIFICATION
Licensee agrees to indemnify and hold harmless Licensor from any claims arising from Licensee's 
use of the Software, including unlimited liability for damages.
  `.trim()

  const analysisResults = {
    summary: "This software license agreement contains several high-risk clauses that heavily favor the licensor, including broad liability limitations and unlimited indemnification requirements.",
    risks: [
      {
        clause: "Liability Limitation",
        severity: "high",
        description: "Broad exclusion of all indirect damages may be unenforceable in some jurisdictions",
        recommendation: "Consider limiting exclusions to specific types of damages"
      },
      {
        clause: "Unlimited Indemnification",
        severity: "critical",
        description: "Unlimited liability exposure for the licensee with no reciprocal protection",
        recommendation: "Add mutual indemnification and liability caps"
      },
      {
        clause: "Payment Terms",
        severity: "medium",
        description: "90-day payment terms with penalty fees may be disadvantageous",
        recommendation: "Negotiate standard 30-day terms and reasonable penalty rates"
      }
    ],
    overallRisk: "high"
  }

  const handleAnalyzeDemo = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
    setShowResults(true)
  }

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={cn("bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Try AI Analysis Now</h3>
          <IBMBadge variant="default" className="bg-white/20 text-white border-white/30" />
        </div>
        <p className="text-blue-100">
          See ClauseGuard in action with this sample software license agreement
        </p>
      </div>

      <div className="p-6">
        {/* Sample Contract */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <FileText className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">Sample Contract</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {sampleContract}
            </pre>
          </div>
        </div>

        {/* Action Button */}
        {!showResults && (
          <div className="text-center mb-6">
            <button
              onClick={handleAnalyzeDemo}
              disabled={isAnalyzing}
              className={cn(
                "group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl",
                isAnalyzing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Analyzing with IBM Granite AI...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Play className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span>Analyze Contract</span>
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {showResults && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                AI Analysis Complete
              </h4>
              <p className="text-gray-700 bg-blue-50 rounded-xl p-4">
                {analysisResults.summary}
              </p>
            </div>

            {/* Risk Analysis */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Risk Assessment
              </h4>
              <div className="space-y-3">
                {analysisResults.risks.map((risk, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-xl p-4 border-2",
                      getRiskColor(risk.severity)
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{risk.clause}</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium uppercase",
                        getRiskColor(risk.severity)
                      )}>
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{risk.description}</p>
                    <p className="text-sm font-medium">
                      💡 Recommendation: {risk.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900">Overall Risk Level:</span>
                  <span className={cn(
                    "ml-2 px-3 py-1 rounded-full text-sm font-bold uppercase",
                    getRiskColor(analysisResults.overallRisk)
                  )}>
                    {analysisResults.overallRisk}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  ⏱️ Analysis completed in 3.2 seconds
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                Ready to analyze your own contracts?
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300">
                Upload Your Contract
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleContractDemo 