import Image from 'next/image'
import Link from 'next/link'

function Callout({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    success: 'bg-green-50 border-green-200 text-green-900'
  }
  return (
    <div className={`p-4 my-6 border rounded-xl ${colors[type]}`}>
      {children}
    </div>
  )
}

function CustomLink(props: any) {
  const href = props.href
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return <a {...props} />
  }
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props: any) {
  return <Image alt={props.alt} className="rounded-xl border border-gray-200 shadow-sm my-8" {...props} />
}

export const MDXComponents = {
  a: CustomLink,
  img: RoundedImage,
  Callout,
}
