import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth, OrbitTrajectory, SolarSystemScene, DebrisCloud } from './DigitalTwin';
import ErrorBoundary from './ErrorBoundary';

/* Orbital debris view — Earth close-up */
export const VizCanvas = ({ orbits, riskEvents, mode = 'orbital', showNeo = false, cascadeActive = false, cascadeData = null, timeMultiplier = 1, activePlanet, onPlanetSelect }) => {
    const riskMap = {};
    (riskEvents || []).forEach(e => {
        riskMap[e.sat1_id] = e;
        riskMap[e.sat2_id] = e;
    });

    if (mode === 'solar') {
        const controlsRef = useRef();
        return (
            <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <ErrorBoundary>
                    <Canvas camera={{ position: [0, 80, 180], fov: 45 }}>
                        <Suspense fallback={null}>
                            <SolarSystemScene showNeo={showNeo} timeMultiplier={timeMultiplier} activePlanet={activePlanet} onPlanetSelect={onPlanetSelect} controlsRef={controlsRef} />
                            <OrbitControls ref={controlsRef} enablePan={false} minDistance={40} maxDistance={400}
                                autoRotate autoRotateSpeed={0.1} enableDamping dampingFactor={0.05} />
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <ErrorBoundary>
                <Canvas camera={{ position: [0, 8, 22], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[20, 15, 10]} intensity={1.5} color="#fff8e7" />
                    <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={0.5} />

                    <Suspense fallback={null}>
                        <Earth />
                        {Object.entries(orbits).map(([satId, trajectory]) => (
                            <OrbitTrajectory key={satId} trajectory={trajectory} riskEvent={riskMap[satId]} />
                        ))}
                        {cascadeActive && cascadeData && (
                            <DebrisCloud cascadeData={cascadeData} />
                        )}
                    </Suspense>

                    <OrbitControls enablePan={false} minDistance={10} maxDistance={45}
                        autoRotate autoRotateSpeed={0.3} enableDamping dampingFactor={0.05} />
                </Canvas>
            </ErrorBoundary>
        </div>
    );
};
