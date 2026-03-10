import * as React from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface IconProps {
  id: number
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  className: string
}

export interface FloatingIconsHeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  icons: IconProps[]
}

const Icon = ({
  mouseX,
  mouseY,
  iconData,
  index,
}: {
  mouseX: React.MutableRefObject<number>
  mouseY: React.MutableRefObject<number>
  iconData: IconProps
  index: number
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  React.useEffect(() => {
    const handleMouseMove = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const distance = Math.sqrt(
          Math.pow(mouseX.current - (rect.left + rect.width / 2), 2) +
            Math.pow(mouseY.current - (rect.top + rect.height / 2), 2),
        )

        if (distance < 150) {
          const angle = Math.atan2(
            mouseY.current - (rect.top + rect.height / 2),
            mouseX.current - (rect.left + rect.width / 2),
          )
          const force = (1 - distance / 150) * 50
          x.set(-Math.cos(angle) * force)
          y.set(-Math.sin(angle) * force)
        } else {
          x.set(0)
          y.set(0)
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [x, y, mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("absolute", iconData.className)}
    >
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(108,99,255,0.2)] bg-white/80 p-2.5 shadow-[0_10px_24px_rgba(8,14,31,0.12)] backdrop-blur-md md:h-16 md:w-16"
        animate={{
          y: [0, -5, 0, 5, 0],
          x: [0, 3, 0, -3, 0],
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <iconData.icon className="h-7 w-7 md:h-8 md:w-8" />
      </motion.div>
    </motion.div>
  )
}

const FloatingIconsHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps
>(({ className, title, subtitle, ctaText, ctaHref, icons, children, ...props }, ref) => {
  const mouseX = React.useRef(0)
  const mouseY = React.useRef(0)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.current = event.clientX
    mouseY.current = event.clientY
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden bg-white",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,99,255,0.16),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,212,255,0.12),transparent_42%)]" />

      <div className="absolute inset-0 h-full w-full">
        {icons.map((iconData, index) => (
          <Icon
            key={iconData.id}
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-4 text-center">
        {children ? (
          children
        ) : (
          <>
            <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
              {title}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">{subtitle}</p>
            <div className="mt-10">
              <Button asChild size="lg" className="px-8 py-6 text-base font-semibold">
                <a href={ctaHref}>{ctaText}</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
})

FloatingIconsHero.displayName = "FloatingIconsHero"

export { FloatingIconsHero }
