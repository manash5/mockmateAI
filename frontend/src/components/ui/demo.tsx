import { LiquidButton } from "@/components/ui/liquid-glass-button"

export default function DemoOne() {
  return (
    <div
      className="relative h-[200px] w-full max-w-[800px] overflow-hidden rounded-xl"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <LiquidButton className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        Liquid Glass
      </LiquidButton>
    </div>
  )
}
