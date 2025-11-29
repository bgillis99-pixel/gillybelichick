import { useState } from 'react'

export default function MediaTools() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAnalyze = () => {
    if (!selectedFile) return

    setAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      alert('Document analyzed! This feature will be available in the next update.')
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-black mb-2">ANALYSIS TOOLS</h2>
        <p className="text-sm text-gray-200">
          Upload documents for AI-powered analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-[#003366] mb-4">
          Upload Document
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#00C853] transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer block"
          >
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-bold text-[#003366] mb-2">
              {selectedFile ? selectedFile.name : 'Click to Upload'}
            </p>
            <p className="text-sm text-gray-500">
              Supported: Images, PDF documents
            </p>
          </label>
        </div>

        {selectedFile && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full mt-4 bg-[#00C853] text-white font-bold py-4 rounded-xl hover:bg-green-600 disabled:bg-gray-300 transition-colors active:scale-95"
          >
            {analyzing ? '🔍 ANALYZING...' : '🤖 ANALYZE WITH AI'}
          </button>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
          <div className="text-3xl mb-2">📷</div>
          <h4 className="font-bold text-[#003366] mb-2">Photo Analysis</h4>
          <p className="text-sm text-gray-600">
            Analyze exhaust smoke, vehicle plates, or compliance labels
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
          <div className="text-3xl mb-2">📋</div>
          <h4 className="font-bold text-[#003366] mb-2">Document Scan</h4>
          <p className="text-sm text-gray-600">
            Extract VIN and compliance info from documents
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
          <div className="text-3xl mb-2">🔍</div>
          <h4 className="font-bold text-[#003366] mb-2">Text Recognition</h4>
          <p className="text-sm text-gray-600">
            OCR for VIN plates and certification stickers
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
          <div className="text-3xl mb-2">📊</div>
          <h4 className="font-bold text-[#003366] mb-2">Report Generator</h4>
          <p className="text-sm text-gray-600">
            AI-generated compliance reports
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
        <p className="text-sm font-bold text-yellow-800">
          🚧 COMING SOON
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Advanced media analysis features are currently in development.
        </p>
      </div>
    </div>
  )
}
