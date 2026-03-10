import * as React from 'react'
import { FloatingIconsHero, type FloatingIconsHeroProps } from '@/components/ui/floating-icons-hero-section'

const IconChip = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
)

const IconCode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M9 8L5 12l4 4M15 8l4 4-4 4M13 5l-2 14" />
  </svg>
)

const IconVoice = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="9" y="3" width="6" height="10" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
  </svg>
)

const demoIcons: FloatingIconsHeroProps['icons'] = [
  { id: 1, icon: IconChip, className: 'top-[10%] left-[10%]' },
  { id: 2, icon: IconVoice, className: 'top-[20%] right-[10%]' },
  { id: 3, icon: IconCode, className: 'bottom-[12%] left-[15%]' },
  { id: 4, icon: IconChip, className: 'top-[60%] right-[16%]' },
]

export default function FloatingIconsHeroDemo() {
  return (
    <FloatingIconsHero
      title="Master Every Interview"
      subtitle="Practice with AI-generated questions tailored to your role. Get real-time feedback on your code and verbal answers."
      ctaText="Start Practicing Free"
      ctaHref="/register"
      icons={demoIcons}
    />
  )
}
