import { motion } from 'framer-motion'

type BrandLogoProps = {
  className?: string
  animated?: boolean
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-5 w-5 ', animated = true }) => {
  const rectTransition = animated ? { duration: 1.1, ease: 'easeInOut' } : { duration: 0 }
  const pathTransition = animated ? { delay: 0.12, duration: 0.9, ease: 'easeInOut' } : { duration: 0 }
  const dotTransition = animated ? { delay: 0.5, type: 'spring', stiffness: 300, damping: 20 } : { duration: 0 }

  return (
    <svg className={className} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <motion.rect
        x="4"
        y="4"
        width="64"
        height="64"
        rx="20"
        stroke="currentColor"
        strokeWidth="4"
        strokeOpacity="0.34"
        initial={animated ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={rectTransition}
      />
      <motion.path
        d="M22 44 L22 28 L30 36 L38 24 L46 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={pathTransition}
      />
      <motion.circle
        cx="46"
        cy="44"
        r="4"
        fill="currentColor"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={dotTransition}
      />
    </svg>
  )
}
