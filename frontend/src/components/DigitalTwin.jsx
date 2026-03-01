import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Sphere, Line, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const SCALE = 1 / 1000;
const EARTH_R = 6371 * SCALE;   // ≈ 6.37 units

/*  Planet definitions (procedural colors, no external URLs)  */
const PLANETS = [
    { name: 'Mercury', moons: 0, color: '#b5b5b5', emissive: '#1a1a1a', orbit: EARTH_R * 14, r: EARTH_R * 0.38, speed: 1.6 },
    { name: 'Venus', moons: 0, color: '#e8cda0', emissive: '#2a1800', orbit: EARTH_R * 22, r: EARTH_R * 0.95, speed: 1.17 },
    { name: 'Earth', moons: 1, color: null, emissive: '#000a14', orbit: EARTH_R * 30, r: EARTH_R, speed: 1.0 },
    { name: 'Mars', moons: 2, color: '#c1440e', emissive: '#1a0800', orbit: EARTH_R * 40, r: EARTH_R * 0.53, speed: 0.8 },
    { name: 'Jupiter', moons: 95, color: '#c88b3a', emissive: '#100800', orbit: EARTH_R * 60, r: EARTH_R * 2.8, speed: 0.43 },
    { name: 'Saturn', moons: 146, color: '#e4d191', emissive: '#181200', orbit: EARTH_R * 80, r: EARTH_R * 2.3, speed: 0.32 },
    { name: 'Uranus', moons: 27, color: '#7de8e8', emissive: '#001a1a', orbit: EARTH_R * 100, r: EARTH_R * 1.6, speed: 0.22 },
    { name: 'Neptune', moons: 14, color: '#2b57b8', emissive: '#000a20', orbit: EARTH_R * 120, r: EARTH_R * 1.5, speed: 0.18 },
];

/* Procedural Asteroid Belt (Main Belt: Mars - Jupiter) */
const ASTEROID_COUNT = 1500;
function AsteroidBelt({ timeMultiplier = 1 }) {
    const meshRef = useRef();

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const asteroids = useMemo(() => {
        return Array.from({ length: ASTEROID_COUNT }).map(() => {
            const orbitR = EARTH_R * 40 + Math.random() * (EARTH_R * 20) + (Math.random() - 0.5) * EARTH_R * 2; // Between Mars(40) and Jupiter(60)
            const angle = Math.random() * Math.PI * 2;
            const speed = (0.5 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1);
            const yOffset = (Math.random() - 0.5) * EARTH_R * 3;
            const scale = Math.random() * 0.15 + 0.05;

            const rotSpeed = {
                x: Math.random() * 0.02,
                y: Math.random() * 0.02,
                z: Math.random() * 0.02
            };

            return { orbitR, angle, speed, yOffset, scale, rotSpeed };
        });
    }, []);

    const simTime = useRef(0);

    useFrame((state, delta) => {
        simTime.current += delta * timeMultiplier;
        const t = simTime.current;
        if (meshRef.current) {
            asteroids.forEach((ast, i) => {
                const currentAngle = ast.angle + t * ast.speed * 0.05;
                dummy.position.set(
                    Math.cos(currentAngle) * ast.orbitR,
                    ast.yOffset,
                    Math.sin(currentAngle) * ast.orbitR
                );
                dummy.rotation.set(
                    t * ast.rotSpeed.x,
                    t * ast.rotSpeed.y,
                    t * ast.rotSpeed.z
                );
                dummy.scale.set(ast.scale, ast.scale, ast.scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, ASTEROID_COUNT]}>
            <dodecahedronGeometry args={[EARTH_R, 0]} />
            <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
        </instancedMesh>
    );
}

/*  SUN  */
function Sun() {
    const ref = useRef();
    useFrame(() => { if (ref.current) ref.current.rotation.y += 0.001; });
    return (
        <group>
            {/* Core */}
            <Sphere ref={ref} args={[EARTH_R * 5, 64, 64]}>
                <meshBasicMaterial color="#ffffee" />
            </Sphere>
            {/* Corona Rays / Bloom Base */}
            <Sphere args={[EARTH_R * 5.2, 32, 32]}>
                <meshBasicMaterial color="#ffbb00" transparent opacity={0.6} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </Sphere>
            <Sphere args={[EARTH_R * 6.5, 32, 32]}>
                <meshBasicMaterial color="#ff5500" transparent opacity={0.2} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </Sphere>
            {/* Massive Flare Ring */}
            <Sphere args={[EARTH_R * 9, 32, 32]}>
                <meshBasicMaterial color="#ff1100" transparent opacity={0.05} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </Sphere>

            {/* Stark cinematic lighting for harsh terminators */}
            <pointLight intensity={8} distance={1500} decay={1.5} color="#fffcf5" />
            <ambientLight intensity={0.02} />
        </group>
    );
}

/*  Generic Planet  */
function Planet({ name, color, emissive, r, orbit, speed, earthTex, timeMultiplier = 1, moons, isActive, isMuted, onSelect }) {
    const groupRef = useRef();
    const planetRef = useRef();
    const offset = useMemo(() => Math.random() * Math.PI * 2, []);
    const isEarth = name === 'Earth';

    const [hovered, setHovered] = React.useState(false);

    // Cinematic scaling and opacity for the active planet
    const targetScale = isActive ? 1.5 : 1.0;

    const orbitPts = useMemo(() => {
        return Array.from({ length: 129 }, (_, i) => {
            const a = (i / 128) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(a) * orbit, 0, Math.sin(a) * orbit);
        });
    }, [orbit]);

    const targetOpacity = isActive ? 1.0 : (isMuted ? 0.3 : 1.0);
    const simTime = useRef(0);

    useFrame((state, delta) => {
        simTime.current += delta * timeMultiplier;
        const t = simTime.current;
        if (groupRef.current) {
            const a = offset + t * speed * 0.08;
            groupRef.current.position.x = Math.cos(a) * orbit;
            groupRef.current.position.z = Math.sin(a) * orbit;
        }
        if (planetRef.current) {
            planetRef.current.rotation.y += 0.004;
            planetRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);

            // Lerp Opacity Material
            const mat = planetRef.current.material;
            if (mat && mat.opacity !== targetOpacity) {
                mat.opacity += (targetOpacity - mat.opacity) * 0.05;
                mat.transparent = true;
            }
        }
    });

    return (
        <group>
            <Line points={orbitPts}
                color={isEarth ? 'rgba(0,200,255,0.5)' : 'rgba(255,255,255,0.06)'}
                transparent opacity={0.4}
                lineWidth={isEarth ? 1.5 : 0.8} />

            <group ref={groupRef} name={name} userData={{ radius: r }}>
                <Sphere ref={planetRef} args={[r, 64, 64]}
                    onClick={(e) => { e.stopPropagation(); onSelect && onSelect(name.toLowerCase()); }}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    {isEarth && earthTex
                        ? <meshStandardMaterial map={earthTex} roughness={0.6} metalness={0.1} transparent={true} />
                        : <meshStandardMaterial color={color} emissive={emissive} roughness={0.8} metalness={0.1} transparent={true} />
                    }
                </Sphere>

                {/* Atmospheric Rim Scattering */}
                {['Earth', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name) && (
                    <Sphere args={[r * 1.05, 32, 32]}>
                        <meshBasicMaterial color={isEarth ? "#4fc3f7" : color} transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
                    </Sphere>
                )}

                {name === 'Saturn' && <SaturnRing r={r} />}

                {isActive && moons > 0 && <Moons count={moons} planetRadius={r} timeMultiplier={timeMultiplier} />}

                {/* 3D HUD Label */}
                <Html position={[r * 1.5, r * 1.5, 0]} center zIndexRange={[100, 0]}>
                    <div style={{
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        background: isActive ? 'rgba(0,0,0,0.8)' : 'transparent',
                        border: isActive ? `1px solid ${color || '#4fc3f7'}` : 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        pointerEvents: 'none',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: hovered || isActive ? 1 : 0.3,
                        backdropFilter: isActive ? 'blur(4px)' : 'none'
                    }}>
                        {name}
                    </div>
                </Html>
            </group>
        </group>
    );
}

function SaturnRing({ r }) {
    const geo = useMemo(() => new THREE.RingGeometry(r * 1.4, r * 2.2, 64), [r]);
    return (
        <mesh geometry={geo} rotation={[-Math.PI / 2.5, 0, 0]}>
            <meshBasicMaterial color="#c8a84b" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
    );
}

/*  Earth (close-up for orbital view)  */
export function Earth() {
    const earthTex = useLoader(TextureLoader, '/textures/earth.jpg');
    const ref = useRef();
    const atmRef = useRef();

    useFrame(() => {
        if (ref.current) ref.current.rotation.y += 0.0004;
        if (atmRef.current) atmRef.current.rotation.y -= 0.0001;
    });

    return (
        <group>
            <Sphere ref={ref} args={[EARTH_R, 64, 64]}>
                <meshStandardMaterial map={earthTex} roughness={0.5} metalness={0.05} />
            </Sphere>
            <Sphere args={[EARTH_R * 1.06, 32, 32]}>
                <meshBasicMaterial color="#4fc3f7" transparent opacity={0.07} side={THREE.BackSide} />
            </Sphere>
            <Sphere ref={atmRef} args={[EARTH_R * 1.01, 20, 20]}>
                <meshBasicMaterial color="#0d2340" wireframe transparent opacity={0.07} />
            </Sphere>
        </group>
    );
}

/*  Orbit trajectory (debris paths)  */
export function OrbitTrajectory({ trajectory, riskEvent }) {
    const isRisk = !!riskEvent;
    const points = useMemo(() => {
        if (!trajectory || trajectory.length === 0) return [];
        return trajectory.map(s => new THREE.Vector3(
            s.position.x * SCALE,
            s.position.y * SCALE,
            s.position.z * SCALE,
        ));
    }, [trajectory]);

    if (points.length < 2) return null;
    const color = isRisk ? '#c6200a' : '#00c8ff';
    const opacity = isRisk ? 0.9 : 0.3;

    // Scale the ellipsoid visually so it's visible on the globe
    const uScale = riskEvent?.uncertainty_ellipsoid
        ? [
            Math.max(0.4, riskEvent.uncertainty_ellipsoid.radial_km * 0.1),
            Math.max(0.5, riskEvent.uncertainty_ellipsoid.in_track_km * 0.1),
            Math.max(0.4, riskEvent.uncertainty_ellipsoid.cross_track_km * 0.1)
        ]
        : [0.6, 0.8, 0.6];

    return (
        <>
            <Line points={points} color={color} lineWidth={isRisk ? 2.5 : 1} transparent opacity={opacity} />
            <Sphere position={points[0]} args={[isRisk ? 0.2 : 0.1, 8, 8]}>
                <meshBasicMaterial color={color} />
            </Sphere>
            {isRisk && (
                <mesh position={points[0]} scale={uScale}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color="#ff2a2a" wireframe transparent opacity={0.35} />
                </mesh>
            )}
        </>
    );
}

function Moons({ count, planetRadius, timeMultiplier = 1 }) {
    // Cap visual moons at 30 for performance to avoid clutter
    const visualCount = Math.min(count, 30);
    const moonsData = useMemo(() => {
        return Array.from({ length: visualCount }).map((_, i) => ({
            distance: planetRadius * (1.5 + Math.random() * 2.5),
            speed: (Math.random() * 2 + 1) * (i % 2 === 0 ? 1 : -1),
            offset: Math.random() * Math.PI * 2,
            size: planetRadius * 0.05 * (0.5 + Math.random()),
        }));
    }, [count, planetRadius]);

    const groupRef = useRef();
    const simTime = useRef(0);

    useFrame((state, delta) => {
        simTime.current += delta * timeMultiplier;
        const t = simTime.current;
        if (groupRef.current) {
            groupRef.current.children.forEach((moon, i) => {
                const data = moonsData[i];
                const a = data.offset + t * data.speed;
                moon.position.x = Math.cos(a) * data.distance;
                moon.position.z = Math.sin(a) * data.distance;
            });
        }
    });

    return (
        <group>
            {moonsData.map((data, i) => {
                const pts = Array.from({ length: 65 }, (_, j) => {
                    const a = (j / 64) * Math.PI * 2;
                    return new THREE.Vector3(Math.cos(a) * data.distance, 0, Math.sin(a) * data.distance);
                });
                return <Line key={`orb-${i}`} points={pts} color="rgba(255,255,255,0.4)" transparent opacity={0.1} lineWidth={0.5} />;
            })}
            <group ref={groupRef}>
                {moonsData.map((data, i) => (
                    <mesh key={i}>
                        <sphereGeometry args={[data.size, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function SolarSystemCamera({ activePlanet, controlsRef }) {
    const { scene, camera } = useThree();
    const targetPos = useMemo(() => new THREE.Vector3(), []);
    const cameraTargetPos = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        if (!controlsRef?.current) return;

        const planetName = activePlanet ? activePlanet.charAt(0).toUpperCase() + activePlanet.slice(1) : null;
        const planetGroup = planetName ? scene.getObjectByName(planetName) : null;

        if (planetGroup) {
            planetGroup.getWorldPosition(targetPos);
            const targetRadius = planetGroup.userData.radius || 0.1;

            // Smooth target transition
            controlsRef.current.target.lerp(targetPos, 0.05);

            // Calculate ideal camera position (offset from planet)
            // Use a fixed angled offset so the camera swoops to a nice 3/4 view of the planet
            const offsetDist = targetRadius * 6; // Zoom depth
            cameraTargetPos.copy(targetPos).add(new THREE.Vector3(offsetDist, offsetDist * 0.5, offsetDist));

            // Smoothly move the camera itself
            camera.position.lerp(cameraTargetPos, 0.05);

            controlsRef.current.minDistance = targetRadius * 2;
            controlsRef.current.maxDistance = targetRadius * 15;
            controlsRef.current.autoRotateSpeed = 0.5;
        } else {
            targetPos.set(0, 0, 0);
            controlsRef.current.target.lerp(targetPos, 0.05);

            // Default wide camera view
            cameraTargetPos.set(0, 80, 180);
            camera.position.lerp(cameraTargetPos, 0.03);

            controlsRef.current.minDistance = 40;
            controlsRef.current.maxDistance = 400;
            controlsRef.current.autoRotateSpeed = 0.1;
        }
    });

    return null;
}

/*  Full Solar System Scene  */
export function SolarSystemScene({ showNeo, timeMultiplier = 1, activePlanet, onPlanetSelect, controlsRef }) {
    const earthTex = useLoader(TextureLoader, '/textures/earth.jpg');
    return (
        <>
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={0.05} />
            <Stars radius={300} depth={100} count={12000} factor={6} saturation={0.5} fade speed={0.4} />
            <Sun />
            <SolarSystemCamera activePlanet={activePlanet} controlsRef={controlsRef} />

            <AsteroidBelt timeMultiplier={timeMultiplier} />

            {PLANETS.map(p => (
                <Planet
                    key={p.name}
                    {...p}
                    earthTex={p.name === 'Earth' ? earthTex : null}
                    timeMultiplier={timeMultiplier}
                    isActive={activePlanet && activePlanet.toLowerCase() === p.name.toLowerCase()}
                    isMuted={activePlanet && activePlanet.toLowerCase() !== p.name.toLowerCase()}
                    onSelect={onPlanetSelect}
                />
            ))}
            {showNeo && <NeoTrajectory timeMultiplier={timeMultiplier} />}

            {/* Cinematic Bloom Pipeline */}
            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
        </>
    );
}

function NeoTrajectory({ timeMultiplier = 1 }) {
    const points = useMemo(() => {
        const pts = [];
        const a = EARTH_R * 28; // semi-major axis roughly 0.92 AU
        const e = 0.191;
        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
            pts.push(new THREE.Vector3(
                r * Math.cos(angle) + EARTH_R * 12, // Offset to make it cross Earth's orbit interestingly
                EARTH_R * Math.sin(angle) * 2,      // Inclined orbit
                r * Math.sin(angle)
            ));
        }
        return pts;
    }, []);

    const rockRef = useRef();
    const simTime = useRef(0);

    useFrame((state, delta) => {
        simTime.current += delta * timeMultiplier;
        if (rockRef.current) {
            const t = (simTime.current * 0.1) % (Math.PI * 2);
            const a = EARTH_R * 28;
            const e = 0.191;
            const r = (a * (1 - e * e)) / (1 + e * Math.cos(t));
            rockRef.current.position.set(
                r * Math.cos(t) + EARTH_R * 12,
                EARTH_R * Math.sin(t) * 2,
                r * Math.sin(t)
            );
        }
    });

    return (
        <group>
            <Line points={points} color="#ff2a2a" lineWidth={2} transparent opacity={0.6} />
            <mesh ref={rockRef}>
                <dodecahedronGeometry args={[EARTH_R * 0.3, 0]} />
                <meshStandardMaterial color="#884444" roughness={0.9} />
            </mesh>
        </group>
    );
}

/*  Debris Cloud Rendering (Cascade)  */
export function DebrisCloud({ cascadeData }) {
    const totalFragments = cascadeData?.stages?.reduce((sum, s) => sum + s.fragments_added, 0) || 0;
    const count = Math.min(10000, totalFragments);

    const [positions] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const altScale = (6371 + (cascadeData?.stages[0]?.altitude_km || 550)) * SCALE;

        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);

            const jitter = (Math.random() - 0.5) * 100 * SCALE;
            const r = altScale + jitter;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return [positions];
    }, [count, cascadeData]);

    const pointsRef = useRef();

    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0005;
        }
    });

    if (count === 0) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color="#ff2a2a"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SATELLITE SWARM — 12,149 individually orbiting satellites
   Each satellite has unique: altitude, inclination, RAAN, speed
   ════════════════════════════════════════════════════════════════ */
export function SatelliteSwarm({ timeMultiplier = 1 }) {
    const posAttrRef = useRef();
    const timeRef    = useRef(0);

    const SHELLS = [
        { name: 'LEO',    altMin: 200,   altMax: 2000,  count: 8800,  color: '#00e5ff', baseSpeed: 4.0  },
        { name: 'MEO',    altMin: 2000,  altMax: 20000, count: 1400,  color: '#7c4dff', baseSpeed: 1.2  },
        { name: 'GEO',    altMin: 35786, altMax: 36100, count: 500,   color: '#ffd740', baseSpeed: 0.07 },
        { name: 'HEO',    altMin: 1000,  altMax: 39000, count: 449,   color: '#ff6e40', baseSpeed: 0.5  },
        { name: 'DEBRIS', altMin: 300,   altMax: 1500,  count: 1000,  color: '#ff1744', baseSpeed: 3.8  },
    ];
    const TOTAL = SHELLS.reduce((s, sh) => s + sh.count, 0);

    // ── Precompute orbital elements once ──────────────────────────
    // Store as flat Float32Arrays for fast access inside useFrame
    // Per satellite: [r, a0, speed, ux, uy, uz, vx, vy, vz]  (9 values)
    const { orb, colors, positions } = useMemo(() => {
        const orb       = new Float32Array(TOTAL * 9);
        const colors    = new Float32Array(TOTAL * 3);
        const positions = new Float32Array(TOTAL * 3);

        let idx = 0;
        SHELLS.forEach(shell => {
            const col = new THREE.Color(shell.color);
            for (let i = 0; i < shell.count; i++) {
                const altKm = shell.altMin + Math.random() * (shell.altMax - shell.altMin);
                const r     = (6371 + altKm) * SCALE;

                // Keplerian speed: ω ∝ r^(-3/2), normalized to LEO baseline
                const rLEO  = (6371 + 400) * SCALE;
                const speed = shell.baseSpeed * Math.pow(rLEO / r, 1.5);

                const a0   = Math.random() * Math.PI * 2;

                // Orbital plane angles
                const inc  = shell.name === 'GEO'
                    ? (Math.random() - 0.5) * 0.1          // near-equatorial
                    : shell.name === 'DEBRIS'
                        ? Math.random() * Math.PI           // chaotic inclinations
                        : (0.1 + Math.random() * 0.95) * Math.PI; // 10°–170°
                const RAAN = Math.random() * Math.PI * 2;

                // Orbital basis vectors:
                // u = direction of ascending node
                // v = perpendicular in orbital plane (above equator at ascending node)
                const cosR = Math.cos(RAAN), sinR = Math.sin(RAAN);
                const cosI = Math.cos(inc),  sinI = Math.sin(inc);

                // u = (cos Ω, 0, sin Ω)
                const ux =  cosR,  uy = 0,    uz = sinR;
                // v = (-sin Ω cos i, sin i, cos Ω cos i)
                const vx = -sinR * cosI, vy = sinI, vz = cosR * cosI;

                const base = idx * 9;
                orb[base]   = r;
                orb[base+1] = a0;
                orb[base+2] = speed;
                orb[base+3] = ux;  orb[base+4] = uy;  orb[base+5] = uz;
                orb[base+6] = vx;  orb[base+7] = vy;  orb[base+8] = vz;

                colors[idx * 3]     = col.r;
                colors[idx * 3 + 1] = col.g;
                colors[idx * 3 + 2] = col.b;
                idx++;
            }
        });
        return { orb, colors, positions };
    }, []);

    // ── Update every frame ─────────────────────────────────────────
    useFrame((_, delta) => {
        timeRef.current += delta * 0.25 * timeMultiplier; // scales with sim speed
        const t = timeRef.current;

        for (let i = 0; i < TOTAL; i++) {
            const base  = i * 9;
            const r     = orb[base];
            const theta = orb[base+1] + t * orb[base+2];
            const cosT  = Math.cos(theta);
            const sinT  = Math.sin(theta);

            // p = r * (cosθ · u + sinθ · v)
            positions[i * 3]     = r * (cosT * orb[base+3] + sinT * orb[base+6]);
            positions[i * 3 + 1] = r * (cosT * orb[base+4] + sinT * orb[base+7]);
            positions[i * 3 + 2] = r * (cosT * orb[base+5] + sinT * orb[base+8]);
        }

        if (posAttrRef.current) posAttrRef.current.needsUpdate = true;
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    ref={posAttrRef}
                    attach="attributes-position"
                    count={TOTAL}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={TOTAL}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                vertexColors
                size={0.055}
                transparent
                opacity={0.92}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}


