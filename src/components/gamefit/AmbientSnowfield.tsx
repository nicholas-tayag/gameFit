import { useEffect, useRef } from 'react'

type AmbientSnowfieldProps = {
  variant?: 'landing' | 'quiz' | 'results'
}

function AmbientSnowfield({ variant = 'landing' }: AmbientSnowfieldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!rootRef.current || !glintRef.current) return

    let context: { revert: () => void } | undefined
    let cancelled = false

    void import('gsap').then(({ default: gsap }) => {
      if (cancelled || !rootRef.current || !glintRef.current) return
      context = gsap.context(() => {
      gsap.to(rootRef.current, {
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
    }, rootRef)
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [variant])

  return (
    <div className={`ambient-snowfield ${variant}`} ref={rootRef} aria-hidden="true">
      <span className="snowfield-flurry flurry-one" />
      <span className="snowfield-flurry flurry-two" />
      <span className="snowfield-glint" ref={glintRef} />
    </div>
  )
}

export { AmbientSnowfield }
