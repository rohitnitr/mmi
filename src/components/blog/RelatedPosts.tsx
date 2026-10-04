import type { BlogPost } from '@/lib/blog'
import './blog.css'
import { BlogCard } from './BlogCard'

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null
  return (
    <section className="bl-related">
      <h2>Keep reading</h2>
      <div className="g">{posts.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
    </section>
  )
}
