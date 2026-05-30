import * as THREE from 'three';

// ── Container Setup ──────────────────────────────────────────
const container = document.getElementById('three-interactive-canvas');

if (container) {
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  // ── Scene, Camera, Renderer ────────────────────────────────
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ── Lighting ──────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x0a0a0a, 1.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xc8ff00, 3.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00ff88, 1.5);
  fillLight.position.set(-5, -5, 3);
  scene.add(fillLight);

  // ── Geometry & Materials ──────────────────────────────────
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
  
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xc8ff00,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    wireframe: true,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ── Particle System Background ────────────────────────────
  const particleCount = 60;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00ff88,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Interaction State ─────────────────────────────────────
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // ── Event Listeners ────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    // Standard coordinates mapped -1 to +1
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Check if mouse is hovering over canvas area
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = x;
      mouseY = y;
      targetRotationY = mouseX * 1.5;
      targetRotationX = -mouseY * 1.5;
    }
  });

  // Drag interaction
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    mesh.rotation.y += deltaX * 0.015;
    mesh.rotation.x += deltaY * 0.015;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch drag interaction for mobile
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    mesh.rotation.y += deltaX * 0.015;
    mesh.rotation.x += deltaY * 0.015;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  // ── Resize Listener ───────────────────────────────────────
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ── Animation Loop ────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Constant slow drift
    if (!isDragging) {
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.003;
      
      // Interpolate slowly towards cursor target coordinate rotation
      mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.08;
      mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.08;
    }

    // Dynamic morph vertices size bob
    const scale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.06;
    mesh.scale.set(scale, scale, scale);

    // Particle background slow spin
    particles.rotation.y = elapsedTime * 0.04;

    renderer.render(scene, camera);
  }

  animate();
}
