import { useEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'motion/react'

type RevealProps = ComponentProps<typeof motion.div> & {
  children: ReactNode
  delay?: number
}

function Reveal({ children, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type LiftCardProps = ComponentProps<typeof motion.div> & {
  children: ReactNode
}

function LiftCard({ children, ...props }: LiftCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.992 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type AnimatedNumberProps = {
  className?: string
  suffix?: string
  value: number
}

function AnimatedNumber({ className, suffix = '', value }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 120, damping: 22 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: 'easeOut' })
    return controls.stop
  }, [motionValue, value])

  useEffect(() => rounded.on('change', setDisplay), [rounded])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}

type MagneticButtonProps = ComponentProps<typeof motion.div> & {
  children: ReactNode
}

function MagneticButton({ children, ...props }: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - bounds.left - bounds.width / 2) * 0.08)
        y.set((event.clientY - bounds.top - bounds.height / 2) * 0.08)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { AnimatedNumber, LiftCard, MagneticButton, Reveal }
