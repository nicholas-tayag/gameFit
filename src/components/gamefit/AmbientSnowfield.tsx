import { useEffect, useRef } from 'react'

type AmbientSnowfieldProps = {
  variant?: 'landing' | 'quiz' | 'results'
}

function AmbientSnowfield({ variant = 'landing' }: AmbientSnowfieldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLSpanElement>(null)
  const ribbonOneRef = useRef<HTMLSpanElement>(null)
  const ribbonTwoRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const updatePointerGlow = (event: PointerEvent) => {
      root.style.setProperty('--cursor-x', `${event.clientX}px`)
      root.style.setProperty('--cursor-y', `${event.clientY}px`)
    }

    window.addEventListener('pointermove', updatePointerGlow, { passive: true })

    return () => window.removeEventListener('pointermove', updatePointerGlow)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!rootRef.current || !glintRef.current || !ribbonOneRef.current || !ribbonTwoRef.current) return

    let context: { revert: () => void } | undefined
    let cancelled = false

    void import('gsap').then(({ default: gsap }) => {
      if (cancelled || !rootRef.current || !glintRef.current || !ribbonOneRef.current || !ribbonTwoRef.current) {
        return
      }
      context = gsap.context(() => {
        gsap.to(rootRef.current, {
          '--aurora-shift': variant === 'quiz' ? '-24px' : '34px',
          '--snow-drift': variant === 'results' ? '34px' : '46px',
          duration: variant === 'quiz' ? 16 : 22,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

        gsap.fromTo(
          glintRef.current,
          { xPercent: -120, opacity: 0 },
          {
            xPercent: 160,
            opacity: 0.58,
            duration: 5.4,
            ease: 'power2.inOut',
            repeat: -1,
            repeatDelay: 4.8,
          },
        )

        gsap.to([ribbonOneRef.current, ribbonTwoRef.current], {
          y: (index) => (index === 0 ? -18 : 14),
          scaleX: (index) => (index === 0 ? 1.08 : 0.96),
          opacity: (index) => (index === 0 ? 0.48 : 0.32),
          duration: 7.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: 1.35,
        })
      }, rootRef)
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [variant])

  return (
    <div className={`ambient-snowfield ${variant}`} ref={rootRef} aria-hidden="true">
      <span className="snowfield-cursor-glow" />
      <span className="aurora-ribbon ribbon-one" ref={ribbonOneRef} />
      <span className="aurora-ribbon ribbon-two" ref={ribbonTwoRef} />
      <span className="ice-orbit orbit-one" />
      <span className="ice-orbit orbit-two" />
      <span className="snowfield-flurry flurry-one" />
      <span className="snowfield-flurry flurry-two" />
      <span className="snowfield-glint" ref={glintRef} />
    </div>
  )
}

export { AmbientSnowfield }
