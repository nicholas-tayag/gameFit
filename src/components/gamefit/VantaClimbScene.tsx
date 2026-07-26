import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type VantaEffect = {
  destroy: () => void
  setOptions?: (options: Record<string, unknown>) => void
}

type VantaFactory = (options: Record<string, unknown>) => VantaEffect

type VantaModule = {
  default?: VantaFactory | { default?: VantaFactory }
  CLOUDS?: VantaFactory
}

type VantaWindow = Window & {
  VANTA?: {
    CLOUDS?: VantaFactory
  }
}

type VantaClimbSceneProps = {
  progress: number
  stage: 'quiz' | 'results'
}

function VantaClimbScene({ progress, stage }: VantaClimbSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return

    let cancelled = false

    async function mountVanta() {
      const module = (await import('vanta/dist/vanta.clouds.min.js')) as VantaModule
      const createClouds =
        typeof module.default === 'function'
          ? module.default
          : typeof module.CLOUDS === 'function'
            ? module.CLOUDS
            : typeof module.default === 'object' && typeof module.default?.default === 'function'
              ? module.default.default
              : (window as VantaWindow).VANTA?.CLOUDS
      if (!createClouds) return
      if (cancelled || !rootRef.current) return

      effectRef.current = createClouds({
        THREE,
        el: rootRef.current,
        backgroundColor: stage === 'results' ? 0xa7d7f5 : 0xdcefff,
        cloudColor: stage === 'results' ? 0xf8fcff : 0xe9f6ff,
        cloudShadowColor: stage === 'results' ? 0x9ab8d6 : 0x6f86a7,
        gyroControls: false,
        maxDistance: stage === 'results' ? 34 : 26,
        minHeight: 200,
        minWidth: 200,
        mouseControls: true,
        skyColor: stage === 'results' ? 0x9fd5fb : 0xcce8fb,
        speed: stage === 'results' ? 0.68 : 0.42,
        sunColor: 0xffffff,
        sunGlareColor: stage === 'results' ? 0xf9f1d1 : 0xdff5ff,
        sunlightColor: stage === 'results' ? 0xffffff : 0xeaf7ff,
        texturePath: '',
        touchControls: true,
      })
    }

    void mountVanta()

    return () => {
      cancelled = true
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [reducedMotion, stage])

  useEffect(() => {
    effectRef.current?.setOptions?.({
      speed: stage === 'results' ? 0.68 : 0.3 + clampedProgress * 0.004,
      maxDistance: stage === 'results' ? 34 : 18 + clampedProgress * 0.12,
    })
  }, [clampedProgress, stage])

  return (
    <div
      className={`vanta-climb-scene ${stage}`}
      ref={rootRef}
      style={{ '--climb-progress': clampedProgress } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="climb-mountain-layer far" />
      <div className="climb-mountain-layer mid" />
      <div className="climb-route">
        {Array.from({ length: 8 }, (_, index) => (
          <span
            className={index <= Math.round((clampedProgress / 100) * 7) ? 'reached' : ''}
            key={index}
            style={{ '--checkpoint-index': index } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="climb-summit-glow" />
      {stage === 'results' ? <div className="summit-peak-reveal" /> : null}
      <div className="vanta-climb-scrim" />
    </div>
  )
}

export { VantaClimbScene }
