'use client'

import './marketing.css'
import './marketing-v2.css'
import MarketingNav from './MarketingNav'
import HeroSection from './HeroSection'
import ResumeVsEvidenceSection from './ResumeVsEvidenceSection'
import ProductLoopSection from './ProductLoopSection'
import TwoSidedValueSection from './TwoSidedValueSection'
import SkillValidationSection from './SkillValidationSection'
import PortfolioPreviewSection from './PortfolioPreviewSection'
import SocialProofSection from './SocialProofSection'
import TalentPreviewSection from './TalentPreviewSection'
import FinalCTASection from './FinalCTASection'
import MarketingFooter from './MarketingFooter'
import type { CtaProps } from './shared'

// users, onlineCount and coffeesShared are accepted for compatibility with page.tsx
// but intentionally unused: the homepage no longer shows unverified stats.
type Props = CtaProps & {
  users?: unknown
  onlineCount?: number
  coffeesShared?: number
}

export default function GuestHomepage({ onAuth }: Props) {
  return (
    <div className="mh">
      <MarketingNav onAuth={onAuth} />
      <main>
        <HeroSection onAuth={onAuth} />
        <ResumeVsEvidenceSection />
        <ProductLoopSection />
        <TwoSidedValueSection />
        <SkillValidationSection />
        <PortfolioPreviewSection />
        <SocialProofSection />
        <TalentPreviewSection />
        <FinalCTASection onAuth={onAuth} />
      </main>
      <MarketingFooter />
    </div>
  )
}
