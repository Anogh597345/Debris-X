import { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const EARTH_R = 8.5; // bigger for hero

function RotatingEarth() {
    const tex = useLoader(TextureLoader, '/textures/earth.jpg');
    const ref = useRef();
    const atmRef = useRef();

    useFrame(() => {
        if (ref.current) ref.current.rotation.y += 0.001;
        if (atmRef.current) atmRef.current.rotation.y -= 0.0004;
    });

    return (
        <group position={[7, -1, -8]}>
            {/* Earth globe — real texture */}
            <Sphere ref={ref} args={[EARTH_R, 64, 64]}>
                <meshStandardMaterial map={tex} roughness={0.5} metalness={0.05} />
            </Sphere>
            {/* Atmosphere glow (bright blue ring) */}
            <Sphere args={[EARTH_R * 1.035, 32, 32]}>
                <meshBasicMaterial color="#4fc3f7" transparent opacity={0.12} side={THREE.BackSide} />
            </Sphere>
            <Sphere args={[EARTH_R * 1.07, 32, 32]}>
                <meshBasicMaterial color="#1a6fa8" transparent opacity={0.05} side={THREE.BackSide} />
            </Sphere>
        </group>
    );
}

export default function HeroEarth() {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            zIndex: 0, pointerEvents: 'none',
        }}>
            <Canvas camera={{ position: [0, 0, 18], fov: 50 }} gl={{ alpha: true }}>
                {/* Strong directional light from left = bright lit Earth half visible */}
                <ambientLight intensity={0.25} />
                <directionalLight position={[-12, 6, 8]} intensity={2.2} color="#fff8f0" />
                <directionalLight position={[10, -4, 4]} intensity={0.4} color="#1a3a6e" />
                <Suspense fallback={null}>
                    <RotatingEarth />
                </Suspense>
            </Canvas>
        </div>
    );
}
