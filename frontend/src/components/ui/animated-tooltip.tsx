import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

type TooltipItem = {
  id: number
  name: string
  designation: string
  image: string
}

export const AnimatedTooltip = ({
  items,
  className,
  autoPlay = true,
  intervalMs = 2300,
}: {
  items: TooltipItem[]
  className?: string
  autoPlay?: boolean
  intervalMs?: number
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [autoIndex, setAutoIndex] = useState<number>(items[0]?.id ?? 0)

  const springConfig = { stiffness: 110, damping: 8 }
  const x = useMotionValue(0)
  const rotate = useSpring(useTransform(x, [-100, 100], [-35, 35]), springConfig)
  const translateX = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig)

  const activeId = hoveredIndex ?? autoIndex

  useEffect(() => {
    if (!autoPlay || hoveredIndex !== null || items.length <= 1) return

    const ids = items.map((item) => item.id)
    const timer = window.setInterval(() => {
      setAutoIndex((prev) => {
        const currentIndex = ids.indexOf(prev)
        if (currentIndex === -1) return ids[0]
        return ids[(currentIndex + 1) % ids.length]
      })
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [autoPlay, hoveredIndex, items, intervalMs])

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {items.map((item) => (
        <div
          className="-mr-4 relative group"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {activeId === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 260, damping: 14 },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.7 }}
                style={{
                  translateX,
                  rotate,
                  whiteSpace: 'nowrap',
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-slate-900 z-50 shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-base">{itemsById.get(item.id)?.name}</div>
                <div className="text-slate-300 text-xs">{itemsById.get(item.id)?.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <img
            onMouseMove={(event) => {
              const halfWidth = event.currentTarget.offsetWidth / 2
              x.set(event.nativeEvent.offsetX - halfWidth)
            }}
            src={item.image}
            alt={item.name}
            className="object-cover object-top rounded-full h-14 w-14 border-2 border-white relative transition duration-500 group-hover:scale-105 group-hover:z-30"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
