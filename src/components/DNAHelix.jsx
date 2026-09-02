import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'

const PURPLE = '#a855f7'
const CYAN = '#22d3ee'
const COUNT = 64
const RADIUS = 2.4
const HEIGHT = 12
const TURNS = 4

function buildHelixPoints(phase) {
  const points = []
  const steps = 320
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const y = -HEIGHT / 2 + t * HEIGHT
    const angle = t * TURNS * Math.PI * 2 + phase
    points.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS))
  }
  return points
}

function Node({ position, color, pulse }) {
  const mat = useRef()
  const sRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const s = 1 + 0.35 * Math.sin(t * pulse + position[1] * 0.6)
    if (sRef.current) sRef.current.scale.setScalar(s)
    if (mat.current) mat.current.emissiveIntensity = 1.2 + 0.8 * Math.sin(t * pulse + position[1] * 0.6)
  })

  return (
    <group position={position}>
      <mesh ref={sRef}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}

function Helix() {
  const group = useRef()

  const nodes = useMemo(() => {
    const items = []
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT
      const y = -HEIGHT / 2 + t * HEIGHT
      const angle = t * TURNS * Math.PI * 2
      items.push({
        key: i,
        y,
        p1: new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS),
        p2: new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS),
      })
    }
    return items
  }, [])

  const strandA = useMemo(() => buildHelixPoints(0), [])
  const strandB = useMemo(() => buildHelixPoints(Math.PI), [])

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime
      group.current.rotation.y = t * 0.35
      group.current.rotation.x = Math.sin(t * 0.2) * 0.06
    }
  })

  return (
    <group ref={group}>
      {nodes.map((n) => (
        <group key={n.key}>
          <Node position={n.p1} color={PURPLE} pulse={3} />
          <Node position={n.p2} color={CYAN} pulse={3} />

          <mesh position={n.p1.clone().lerp(n.p2, 0.5)} quaternion={sphereLookAt(n.p1, n.p2)}>
            <cylinderGeometry args={[0.045, 0.045, n.p1.distanceTo(n.p2), 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.9}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}

      <Line
        points={strandA}
        color={PURPLE}
        lineWidth={2}
        transparent
        opacity={0.25}
      />
      <Line
        points={strandB}
        color={CYAN}
        lineWidth={2}
        transparent
        opacity={0.25}
      />

      <Sparkles count={140} scale={[16, 14, 16]} size={2} speed={0.4} opacity={0.6} color="#c4b5fd" />
    </group>
  )
}

function sphereLookAt(from, to) {
  const dir = new THREE.Vector3().subVectors(to, from)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  return quat
}

export default function DNAHelix() {
  return (
    <ErrorBoundary fallback={<div className="fixed inset-0 bg-black" />}>
      <Canvas
        className="fixed inset-0 z-0"
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        fallback={<div className="fixed inset-0 bg-black" />}
      >
        <fog attach="fog" args={['#000000', 10, 22]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[6, 4, 6]} color={PURPLE} intensity={90} distance={20} />
        <pointLight position={[-6, -4, -6]} color={CYAN} intensity={90} distance={20} />
        <directionalLight position={[0, 8, 4]} intensity={0.4} color="#ffffff" />
        <Helix />
        <OrbitControls makeDefault autoRotate enableZoom={false} enablePan={false} autoRotateSpeed={0.5} />
      </Canvas>
    </ErrorBoundary>
  )
}