import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useScan from '../hooks/useScan'

export default function Upload() {
  const navigate = useNavigate()
  const { scanText, scanPDF, loading, error } = useScan()
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragging, setDragging] = useState(false)

  const { register, handleSubmit, control } = useForm({
    defaultValues: { contractText: '' }
  })
  const Motion = motion
  const contractText = useWatch({ control, name: 'contractText' })

  const isTextDisabled = loading || !contractText || !contractText.trim()
  const isPdfDisabled = loading || !selectedFile

  const onSubmitText = async (values) => {
    const data = await scanText(values.contractText)
    if (data) {
      navigate('/results', { state: { data } })
    }
  }

  const handleFilePick = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return
    setSelectedFile(file)
  }

  const handlePdfScan = async () => {
    if (!selectedFile) return
    const data = await scanPDF(selectedFile)
    if (data) {
      navigate('/results', { state: { data } })
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Know what you&apos;re signing.
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600">
            Paste or upload a legal document to automatically identify risky clauses.
          </p>
        </Motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <label htmlFor="contractText" className="mb-3 block text-sm font-medium text-gray-800">
              Paste your contract text
            </label>

            <form onSubmit={handleSubmit(onSubmitText)} className="space-y-4">
              <textarea
                id="contractText"
                {...register('contractText')}
                placeholder="Paste the full text of your rental agreement, employment contract, or NDA here..."
                className="min-h-[300px] w-full resize-y rounded-lg border-2 border-dashed border-gray-200 p-3 text-sm text-gray-800 outline-none transition focus:border-indigo-300"
              />

              <button
                type="submit"
                disabled={isTextDisabled}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Scanning...' : 'Scan Document'}
              </button>
            </form>
          </Motion.section>

          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <label htmlFor="pdfUpload" className="mb-3 block text-sm font-medium text-gray-800">
              Or upload a PDF
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                handleFilePick(e.dataTransfer.files?.[0])
              }}
              className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
                dragging ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <input
                id="pdfUpload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFilePick(e.target.files?.[0])}
              />

              <label
                htmlFor="pdfUpload"
                className="inline-flex cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Choose PDF
              </label>

              <p className="mt-3 text-sm text-gray-600">
                Drag and drop your contract PDF here, or click to select a file.
              </p>

              {selectedFile && (
                <p className="mt-2 break-all text-sm font-medium text-gray-800">{selectedFile.name}</p>
              )}
            </div>

            <button
              type="button"
              disabled={isPdfDisabled}
              onClick={handlePdfScan}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Scan PDF'}
            </button>
          </Motion.section>
        </div>

        {loading && (
          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 animate-pulse">
            Scanning your document. This usually takes a few seconds.
          </div>
        )}

        {error && (
          <Motion.div
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: [0, -6, 6, -4, 4, 0], opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </Motion.div>
        )}
      </div>
    </main>
  )
}
