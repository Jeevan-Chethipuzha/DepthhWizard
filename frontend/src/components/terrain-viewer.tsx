import { useEffect, useRef } from "react";
import terrainAerial from "@/assets/terrain-aerial.jpg";

export function TerrainViewer({ exaggeration = 1.5, wireframe = false, autoRotate = false }: { exaggeration?: number; wireframe?: boolean; autoRotate?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ mesh?: import("three").Mesh; controls?: { autoRotate: boolean }; cleanup?: () => void }>({});
  useEffect(() => {
    let disposed = false;
    const element = host.current;
    if (!element) return;
    async function init() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (disposed || !element) return;
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x142b2e);
      const camera = new THREE.PerspectiveCamera(45, element.clientWidth / element.clientHeight, 0.1, 200);
      camera.position.set(0, 13, 17);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(element.clientWidth, element.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      element.appendChild(renderer.domElement);
      const geometry = new THREE.PlaneGeometry(18, 13, 140, 100);
      const positions = geometry.getAttribute("position");
      if (!positions) return;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), y = positions.getY(i);
        const peak1 = 3.8 * Math.exp(-((x+4)**2/13 + (y-1.5)**2/8));
        const peak2 = 3.2 * Math.exp(-((x-3.2)**2/10 + (y+1)**2/8));
        const peak3 = 2.4 * Math.exp(-((x+0.5)**2/16 + (y+4)**2/6));
        const ridges = (Math.sin(x*1.8+y*.8)*Math.cos(y*1.5-x*.3)*.36 + Math.sin(x*4+y*2)*.11);
        const valley = 1.7*Math.exp(-((x-y*.6)**2/2.5));
        positions.setZ(i, Math.max(0, peak1+peak2+peak3+ridges-valley)*1.5);
      }
      geometry.computeVertexNormals();
      const texture = new THREE.TextureLoader().load(terrainAerial); texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material); mesh.rotation.x = -Math.PI/2; scene.add(mesh);
      scene.add(new THREE.AmbientLight(0xffffff, 2.2));
      const sun = new THREE.DirectionalLight(0xffffff, 2.7); sun.position.set(-5, 12, 6); scene.add(sun);
      const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 8; controls.maxDistance = 36; controls.maxPolarAngle = Math.PI/2.05; controls.autoRotate = autoRotate; controls.autoRotateSpeed = .7; controls.target.set(0, 1, 0); controls.update();
      state.current = { mesh, controls };
      const resize = new ResizeObserver(() => { if (!element) return; camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(element.clientWidth, element.clientHeight); }); resize.observe(element);
      let frame = 0; const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
      state.current.cleanup = () => { cancelAnimationFrame(frame); resize.disconnect(); controls.dispose(); geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); renderer.domElement.remove(); };
    }
    init();
    return () => { disposed = true; state.current.cleanup?.(); state.current = {}; };
  }, []);
  useEffect(() => { const mesh = state.current.mesh; if (mesh) mesh.scale.z = exaggeration / 1.5; }, [exaggeration]);
  useEffect(() => { const mesh = state.current.mesh; if (mesh) { const material = mesh.material; if (!Array.isArray(material) && "wireframe" in material) { material.wireframe = wireframe; } } }, [wireframe]);
  useEffect(() => { if (state.current.controls) state.current.controls.autoRotate = autoRotate; }, [autoRotate]);
  return <div ref={host} className="h-full w-full bg-ink" aria-label="Interactive 3D terrain model" />;
}
