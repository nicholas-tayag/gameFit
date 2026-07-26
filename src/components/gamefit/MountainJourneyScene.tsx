import { Canvas, useFrame } from '@react-three/fiber'
import { memo, useMemo, useRef } from 'react'
import type { Mesh, Points } from 'three'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'

type MountainJourneySceneProps = {
  progress: number
  stage: 'quiz' | 'results'
  totalCheckpoints: number
}

const cameraStops = [
  new Vector3(-9, 5.8, 15),
  new Vector3(-6.8, 6.6, 12),
  new Vector3(-4.4, 7.6, 9.4),
  new Vector3(-2.1, 8.6, 7.2),
  new Vector3(0.3, 9.9, 5.2),
  new Vector3(2.4, 11.4, 3.4),
  new Vector3(4.7, 13.2, 1.5),
  new Vector3(6.6, 15.2, -0.8),
  new Vector3(8.2, 17.8, -3.8),
]

const lookStops = [
  new Vector3(-3, 2.2, 0),
  new Vector3(-2.2, 3, -1.3),
  new Vector3(-1.2, 4.1, -2.6),
  new Vector3(0, 5.1, -3.7),
  new Vector3(1.2, 6.4, -4.7),
  new Vector3(2.2, 7.8, -5.8),
  new Vector3(3.4, 9.3, -7),
  new Vector3(4.6, 11, -8.4),
  new Vector3(5.8, 13, -10.2),
]

function interpolateStops(stops: Vector3[], progress: number) {
  const clamped = Math.min(1, Math.max(0, progress / 100))
  const scaled = clamped * (stops.length - 1)
  const index = Math.min(stops.length - 2, Math.floor(scaled))
  const local = scaled - index
  return stops[index].clone().lerp(stops[index + 1], local)
}

function CameraRig({ progress, stage }: { progress: number; stage: 'quiz' | 'results' }) {
  const targetPosition = useMemo(() => interpolateStops(cameraStops, stage === 'results' ? 100 : progress), [progress, stage])
  const targetLook = useMemo(() => interpolateStops(lookStops, stage === 'results' ? 100 : progress), [progress, stage])

  useFrame(({ camera }) => {
    camera.position.lerp(targetPosition, 0.045)
    camera.lookAt(targetLook)
  })

  return null
}

function SnowParticles() {
  const pointsRef = useRef<Points>(null)
  const geometry = useMemo(() => {
    const count = 1300
    const positions = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 34
      positions[index * 3 + 1] = Math.random() * 22
      positions[index * 3 + 2] = (Math.random() - 0.5) * 34
    }

    const snowGeometry = new BufferGeometry()
    snowGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    return snowGeometry
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = clock.elapsedTime * 0.018
    pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.25
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        attach="material"
        blending={AdditiveBlending}
        color="#f8fcff"
        depthWrite={false}
        opacity={0.72}
        size={0.04}
        transparent
      />
    </points>
  )
}

function MountainPeak({
  color,
  position,
  scale,
  snowcap = 0.62,
}: {
  color: string
  position: [number, number, number]
  scale: [number, number, number]
  snowcap?: number
}) {
  return (
    <group position={position}>
      <mesh scale={scale} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.6, 3.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh position={[0, scale[1] * 0.86, 0]} scale={[scale[0] * 0.48, scale[1] * snowcap, scale[2] * 0.48]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.18, 1.22, 4]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.74} metalness={0.02} />
      </mesh>
    </group>
  )
}

function CheckpointBeacons({ progress, total }: { progress: number; total: number }) {
  const groupRef = useRef<Mesh>(null)
  const checkpointCount = Math.max(2, total)
  const activeIndex = Math.round((Math.min(100, Math.max(0, progress)) / 100) * (checkpointCount - 1))

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.elapsedTime * 0.4
  })

  return (
    <>
      {Array.from({ length: checkpointCount }, (_, index) => {
        const t = index / (checkpointCount - 1)
        const x = -5.8 + t * 11.6
        const y = 1.1 + t * 8.4 + Math.sin(t * Math.PI * 2) * 0.4
        const z = 2.2 - t * 12
        const reached = index <= activeIndex

        return (
          <group key={index} position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.72, 12]} />
              <meshStandardMaterial color={reached ? '#dff4ff' : '#8ea8c8'} emissive={reached ? '#7dd3fc' : '#22324a'} emissiveIntensity={reached ? 0.52 : 0.06} />
            </mesh>
            <mesh ref={index === activeIndex ? groupRef : undefined} position={[0, 0.42, 0]}>
              <octahedronGeometry args={[reached ? 0.22 : 0.14, 0]} />
              <meshStandardMaterial color={reached ? '#ffffff' : '#b8c6d8'} emissive={reached ? '#8bdcff' : '#26364f'} emissiveIntensity={reached ? 1.2 : 0.18} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function SummitTrail() {
  const trailGeometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-5.8, 1.15, 2.2),
      new Vector3(-4.2, 2.1, 0.7),
      new Vector3(-2.6, 3.3, -1.4),
      new Vector3(-0.7, 4.9, -3.1),
      new Vector3(1.4, 6.5, -4.8),
      new Vector3(3.1, 8.4, -6.6),
      new Vector3(4.8, 10.3, -8.5),
      new Vector3(5.8, 11.9, -10.2),
    ])

    return new TubeGeometry(curve, 96, 0.035, 8, false)
  }, [])

  return (
    <mesh geometry={trailGeometry}>
      <meshStandardMaterial color="#e9fbff" emissive="#7dd3fc" emissiveIntensity={0.42} roughness={0.38} />
    </mesh>
  )
}

function CloudShelf({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.16 + position[2]) * 0.18
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={[-0.08, 0, 0]}>
      <sphereGeometry args={[1, 24, 12]} />
      <meshStandardMaterial color="#f8fcff" transparent opacity={0.28} roughness={0.98} />
    </mesh>
  )
}

function MountainWorld({ progress, stage, totalCheckpoints }: MountainJourneySceneProps) {
  const lightColor = stage === 'results' ? '#d9f1ff' : '#c5ddf5'

  return (
    <>
      <color attach="background" args={[stage === 'results' ? '#bfe4ff' : '#eaf5ff']} />
      <fog attach="fog" args={[stage === 'results' ? '#dff5ff' : '#eaf5ff', 12, 31]} />
      <ambientLight intensity={1.7} />
      <directionalLight color={lightColor} intensity={3.2} position={[-6, 12, 9]} />
      <pointLight color="#ffffff" intensity={stage === 'results' ? 18 : 8} position={[6, 16, -8]} distance={26} />
      <CameraRig progress={progress} stage={stage} />
      <SnowParticles />
      <CloudShelf position={[-7.5, 5.3, -4.5]} scale={[4.4, 0.36, 1.2]} />
      <CloudShelf position={[1.4, 8.1, -8.8]} scale={[5.2, 0.42, 1.5]} />
      <CloudShelf position={[7.4, 12.4, -12.2]} scale={[4.8, 0.36, 1.3]} />
      <group position={[0, -2.2, 0]}>
        <MountainPeak color="#6f86a7" position={[-8, 0, -8]} scale={[2.4, 3.6, 2.4]} />
        <MountainPeak color="#7f99ba" position={[-4.2, 0.2, -5.8]} scale={[2.8, 4.2, 2.8]} />
        <MountainPeak color="#8aa5c5" position={[0, 0.4, -4.7]} scale={[3.2, 5.4, 3.2]} snowcap={0.7} />
        <MountainPeak color="#6f87aa" position={[4, 0.8, -7.2]} scale={[2.6, 4.4, 2.6]} />
        <MountainPeak color="#536b8b" position={[7.2, 1.1, -10.5]} scale={[2.2, 4.1, 2.2]} />
        <mesh position={[0, -0.72, -6]} rotation={[-Math.PI / 2, 0, 0]} scale={[18, 22, 1]}>
          <planeGeometry args={[1, 1, 24, 24]} />
          <meshStandardMaterial color="#edf7ff" roughness={0.86} metalness={0.02} />
        </mesh>
        <SummitTrail />
        <CheckpointBeacons progress={stage === 'results' ? 100 : progress} total={totalCheckpoints} />
      </group>
    </>
  )
}

function MountainJourneyScene({ progress, stage, totalCheckpoints }: MountainJourneySceneProps) {
  return (
    <div className={`mountain-journey-scene ${stage}`} aria-hidden="true">
      <Canvas camera={{ fov: 45, near: 0.1, far: 100, position: [-9, 5.8, 15] }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
        <MountainWorld progress={progress} stage={stage} totalCheckpoints={totalCheckpoints} />
      </Canvas>
      <div className="mountain-scene-vignette" />
    </div>
  )
}

const MemoizedMountainJourneyScene = memo(MountainJourneyScene)

export { MemoizedMountainJourneyScene as MountainJourneyScene }
