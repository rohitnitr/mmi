'use client'

import { useParams } from 'next/navigation'
import { ReportDetail } from '@/components/ReportViews'

export default function ReportPage() {
  const params = useParams<{ id: string }>()
  return <ReportDetail id={String(params.id)} />
}
