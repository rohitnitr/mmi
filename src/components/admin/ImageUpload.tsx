'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP, GIF, or AVIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size is 5 MB.')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(30)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress(60)
      const res = await fetch('/api/blog/upload', { method: 'POST', body: formData })
      setProgress(90)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
      setProgress(100)
      setTimeout(() => setProgress(0), 800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }, [handleUpload])

  // Preview state
  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Cover preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 rounded-lg text-xs font-bold text-gray-800 hover:bg-white shadow-md transition-colors"
            >
              <Upload size={13} /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/95 rounded-lg text-xs font-bold text-white hover:bg-red-700 shadow-md transition-colors"
            >
              <X size={13} /> Remove
            </button>
          </div>
          <div className="absolute top-2 right-2">
            <CheckCircle2 size={18} className="text-green-500 bg-white rounded-full shadow" />
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        <p className="text-xs text-gray-400 truncate font-mono">{value.split('/').pop()}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
          dragging
            ? 'border-blue-400 bg-blue-50/50 scale-[1.01]'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
        } ${uploading ? 'cursor-wait' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-blue-500 animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Uploading...</p>
            <div className="w-full max-w-32 bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {dragging ? <Upload size={22} className="text-blue-500" /> : <ImageIcon size={22} className="text-gray-400" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP · Max 5 MB</p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  )
}
