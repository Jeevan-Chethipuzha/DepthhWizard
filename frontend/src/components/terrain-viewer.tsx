

import { useEffect, useRef } from "react";

type TerrainViewerProps = {
  exaggeration?: number;
  wireframe?: boolean;
  autoRotate?: boolean;
  heights?: number[][];
  imageData?: string | null;
};

export function TerrainViewer({
  exaggeration = 1.5,
  wireframe = false,
  autoRotate = false,
  heights = [],
  imageData = null,
}: TerrainViewerProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const element = host.current;

    if (!element) return;

    async function init() {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/addons/controls/OrbitControls.js"
      );

      if (disposed || !element) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x142b2e);

      const camera = new THREE.PerspectiveCamera(
        45,
        element.clientWidth / Math.max(element.clientHeight, 1),
        0.1,
        200
      );
      camera.position.set(0, 13, 17);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(element.clientWidth, element.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      element.appendChild(renderer.domElement);

      const rows = 64;
      const columns = 64;
      const geometry = new THREE.PlaneGeometry(
        18,
        13,
        columns - 1,
        rows - 1
      );

      let texture: InstanceType<typeof THREE.Texture> | undefined;
      let sampledHeights: number[][] = [];

      if (imageData) {
        try {
          const image = new Image();
          image.src = imageData;

          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(
              new Error("Could not read the uploaded image.")
            );
          });

          if (disposed) {
            geometry.dispose();
            renderer.dispose();
            return;
          }

          texture = await new THREE.TextureLoader().loadAsync(imageData);
          texture.colorSpace = THREE.SRGBColorSpace;

          const canvas = document.createElement("canvas");
          canvas.width = columns;
          canvas.height = rows;

          const context = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          if (context) {
            context.drawImage(image, 0, 0, columns, rows);
            const pixels = context.getImageData(
              0, 0, columns, rows
            ).data;

            sampledHeights = Array.from(
              { length: rows },
              (_, row) =>
                Array.from({ length: columns }, (_, column) => {
                  const i = (row * columns + column) * 4;
                  const brightness =

  (pixels[i]! * 0.299 +
    pixels[i + 1]! * 0.587 +
    pixels[i + 2]! * 0.114) / 255;

                  return brightness;
                })
            );
          }
        } catch (error) {
          console.error("Image terrain generation failed:", error);
        }
      }

      if (disposed) {
        geometry.dispose();
        texture?.dispose();
        renderer.dispose();
        return;
      }

      const positions = geometry.getAttribute("position");

      for (let i = 0; i < positions.count; i++) {
        const row = Math.floor(i / columns);
        const column = i % columns;

        const imageHeight = sampledHeights[row]?.[column];
        const backendHeight = heights[row]?.[column];

        const value =
          imageHeight !== undefined
            ? imageHeight
            : backendHeight !== undefined
              ? Math.max(0, Math.min(1, Number(backendHeight) || 0))
              : 0.15;

        positions.setZ(i, (value - 0.35) * 3.5);
      }

      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: texture ?? null,
  roughness: 1,
  side: THREE.DoubleSide,
  wireframe,
});

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.z = exaggeration / 1.5;
      scene.add(mesh);

      scene.add(new THREE.AmbientLight(0xffffff, 2.2));

      const sun = new THREE.DirectionalLight(0xffffff, 2.7);
      sun.position.set(-5, 12, 6);
      scene.add(sun);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 8;
      controls.maxDistance = 36;
      controls.maxPolarAngle = Math.PI / 2.05;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.7;
      controls.target.set(0, 0, 0);
      controls.update();

      const resize = new ResizeObserver(() => {
        if (disposed) return;

        camera.aspect =
          element.clientWidth / Math.max(element.clientHeight, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(element.clientWidth, element.clientHeight);
      });

      resize.observe(element);

      let frame = 0;

      function animate() {
        frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }

      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        controls.dispose();
        geometry.dispose();
        material.dispose();
        texture?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    init().catch((error) => {
      console.error("3D viewer failed to initialize:", error);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [heights, exaggeration, wireframe, autoRotate, imageData]);

  return (
    <div
      ref={host}
      className="h-full w-full bg-ink"
      aria-label="Interactive approximate 3D terrain visualization"
    />
  );
}
