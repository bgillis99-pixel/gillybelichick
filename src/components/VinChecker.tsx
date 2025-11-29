import { useState } from 'react'
import { ComplianceResult } from '../types'

interface VinCheckerProps {
  onAddToHistory: (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => void
  onNavigateChat: () => void
  onInstallApp: () => void
}

export default function VinChecker({ onAddToHistory, onNavigateChat, onInstallApp }: VinCheckerProps) {
  const [vin, setVin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplianceResult | null>(null)

  const handleVinCheck = async () => {
    if (!vin || vin.length !== 17) {
      alert('Please enter a valid 17-character VIN')
      return
    }

    setLoading(true)
    onAddToHistory(vin, 'VIN')

    // Simulate API call - In production, this would call CARB API or TRUCRS
    setTimeout(() => {
      const mockResult: ComplianceResult = {
        vin: vin.toUpperCase(),
        status: Math.random() > 0.5 ? 'compliant' : 'non-compliant',
        message: Math.random() > 0.5
          ? 'Vehicle is CARB compliant'
          : 'Vehicle requires compliance action',
        details: [
          'Last smoke test: 01/15/2024',
          'Next test due: 01/15/2026',
          'TRUCRS Status: Active',
          'Vehicle Class: Heavy-Duty Diesel'
        ]
      }
      setResult(mockResult)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-black mb-2">INSTANT COMPLIANCE CHECK</h2>
        <p className="text-sm text-gray-200">
          Heavy-Duty Diesel • Motorhomes • Agricultural Equipment
        </p>
      </div>

      {/* VIN Input */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-[#003366] mb-4">
          Enter 17-Digit VIN
        </h3>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              id="vin"
              maxLength={17}
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="1HGBH41JXMN109186"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C853] focus:border-transparent uppercase font-mono text-lg font-bold tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-2 font-semibold">
              {vin.length}/17 characters
            </p>
          </div>

          <button
            onClick={handleVinCheck}
            disabled={loading || vin.length !== 17}
            className="w-full bg-[#00C853] hover:bg-green-600 text-white font-black py-4 px-6 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg text-lg active:scale-95"
          >
            {loading ? '🔍 CHECKING...' : '✓ CHECK COMPLIANCE'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-2xl p-6 shadow-lg ${
          result.status === 'compliant'
            ? 'bg-green-50 border-2 border-green-500'
            : 'bg-red-50 border-2 border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black">
              {result.status === 'compliant' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
            </h3>
            <span className="text-sm text-gray-600 font-mono bg-white px-3 py-1 rounded-lg">{result.vin}</span>
          </div>

          <p className="text-lg mb-4 font-semibold">{result.message}</p>

          {result.details && (
            <div className="bg-white p-4 rounded-xl space-y-2 mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-2">Details:</h4>
              {result.details.map((detail, index) => (
                <p key={index} className="text-sm text-gray-600">• {detail}</p>
              ))}
            </div>
          )}

          {result.status === 'non-compliant' && (
            <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-xl">
              <p className="text-sm font-bold">⚠️ ACTION REQUIRED</p>
              <p className="text-sm mt-1">
                Schedule a smoke test or OBD inspection with a certified technician.
              </p>
              <button
                className="mt-3 bg-[#003366] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-900 active:scale-95 transition-all"
              >
                📞 CALL 844-685-8922
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNavigateChat}
          className="bg-white border-2 border-[#003366] text-[#003366] font-bold py-4 rounded-xl hover:bg-[#003366] hover:text-white transition-colors active:scale-95"
        >
          💬 Ask AI
        </button>
        <a
          href="tel:8446858922"
          className="bg-[#003366] text-white font-bold py-4 rounded-xl hover:bg-[#002244] transition-colors active:scale-95 flex items-center justify-center no-underline"
        >
          📞 Call Now
        </a>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <h4 className="font-bold text-sm text-[#003366] mb-2 flex items-center gap-2">
          <span className="text-xl">ℹ️</span> What We Check
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• CARB compliance status</li>
          <li>• TRUCRS registration</li>
          <li>• Smoke test history</li>
          <li>• PSIP (Periodic Smoke Inspection Program)</li>
          <li>• OBD inspection records</li>
        </ul>
      </div>
    </div>
  )
}
