import { CATEGORIES } from '@/lib/blog'
import { ImageUpload } from './ImageUpload'

interface SEOFieldsProps {
  form: {
    category: string
    tags: string
    author: string
    cover_image: string
    excerpt: string
    read_time: number
  }
  onChange: (field: string, value: string | number) => void
}

export function SEOFields({ form, onChange }: SEOFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Cover Image Upload */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
          Cover Image
        </label>
        <ImageUpload
          value={form.cover_image}
          onChange={url => onChange('cover_image', url)}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Excerpt <span className="text-gray-300 font-normal normal-case tracking-normal">(meta description)</span>
        </label>
        <textarea
          value={form.excerpt}
          onChange={e => onChange('excerpt', e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="A compelling 1-2 sentence summary..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-gray-300"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400">Used as Google meta description</p>
          <p className={`text-xs font-mono ${form.excerpt.length > 160 ? 'text-amber-500' : 'text-gray-400'}`}>
            {form.excerpt.length}/200
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
        <select
          value={form.category}
          onChange={e => onChange('category', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
        <input
          type="text"
          value={form.tags}
          onChange={e => onChange('tags', e.target.value)}
          placeholder="SQL, Interview, Data Analysis"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
      </div>

      {/* Author */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Author</label>
        <input
          type="text"
          value={form.author}
          onChange={e => onChange('author', e.target.value)}
          placeholder="MMI Team"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Read Time */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Read Time <span className="text-gray-300 font-normal normal-case tracking-normal">(auto-calculated)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" min={1} max={60} value={form.read_time}
            onChange={e => onChange('read_time', parseInt(e.target.value) || 5)}
            className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
          />
          <span className="text-sm text-gray-400">minutes</span>
        </div>
      </div>
    </div>
  )
}
