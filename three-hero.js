import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ── Target Container & Sizing ──────────────────────────────
const container = document.getElementById('three-hero-canvas') || document.body;
const width = container.clientWidth || 320;
const height = container.clientHeight || 320;

// ── Scene ─────────────────────────────────────────────────
const scene = new THREE.Scene();
// Transparent background to float beautifully over profile and background noise
// scene.background = new THREE.Color(0x080c0a); // Disabled for transparency

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(3.2, 2.2, 4.2);
camera.lookAt(0, 0, 0);

// Enable alpha transparency in the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

container.appendChild(renderer.domElement);

// ── Environment (fake IBL via CubeRenderTarget) ───────────
const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
scene.add(cubeCamera);

// ── Lighting ──────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0xb6ffcc, 0.35);
scene.add(ambient);

// Key lime backlight
const keyLight = new THREE.DirectionalLight(0xccff44, 2.8);
keyLight.position.set(-4, 6, -5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -6;
keyLight.shadow.camera.right = 6;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -6;
keyLight.shadow.bias = -0.001;
keyLight.shadow.normalBias = 0.02;
scene.add(keyLight);

// Rim from front-right
const rimLight = new THREE.DirectionalLight(0x00ff88, 1.6);
rimLight.position.set(5, 2, 4);
scene.add(rimLight);

// Cool deep fill
const fillLight = new THREE.DirectionalLight(0x0a1a10, 0.6);
fillLight.position.set(0, -4, 0);
scene.add(fillLight);

// Lime point light — floats with cube
const pointGlow = new THREE.PointLight(0x88ff22, 3.5, 8, 1.6);
pointGlow.name = 'pointGlow';
scene.add(pointGlow);

// ── Subtle grid floor ─────────────────────────────────────
const gridHelper = new THREE.GridHelper(24, 30, 0x1a3320, 0x111a13);
gridHelper.name = 'gridHelper';
gridHelper.position.y = -2.2;
scene.add(gridHelper);

// ── Ground fog plane ──────────────────────────────────────
const fogGeo = new THREE.PlaneGeometry(20, 20);
const fogMat = new THREE.MeshBasicMaterial({
  color: 0x080c0a,
  transparent: true,
  opacity: 0.55,
});
const fogPlane = new THREE.Mesh(fogGeo, fogMat);
fogPlane.name = 'fogPlane';
fogPlane.rotation.x = -Math.PI / 2;
fogPlane.position.y = -2.19;
scene.add(fogPlane);

// ── Main glass cube ───────────────────────────────────────
const cubeSize = 1.85;
const cubeGeo = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 6, 0.14);

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x88ffaa,
  emissive: 0x1a4a22,
  emissiveIntensity: 0.18,
  roughness: 0.04,
  metalness: 0.0,
  transmission: 0.88,
  thickness: 1.4,
  ior: 1.48,
  transparent: true,
  opacity: 0.72,
  envMapIntensity: 2.2,
  attenuationColor: new THREE.Color(0x44ff88),
  attenuationDistance: 2.2,
  side: THREE.DoubleSide,
});

const cube = new THREE.Mesh(cubeGeo, glassMat);
cube.name = 'glassCube';
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// ── Rim edge glow wireframe ───────────────────────────────
const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(cubeSize + 0.01, cubeSize + 0.01, cubeSize + 0.01), 15);
const edgesMat = new THREE.LineBasicMaterial({
  color: 0xaaff44,
  transparent: true,
  opacity: 0.55,
});
const edges = new THREE.LineSegments(edgesGeo, edgesMat);
edges.name = 'glowEdges';
cube.add(edges);

// ── Inner refraction layer (slightly smaller, inverted normals) ──
const innerGeo = new RoundedBoxGeometry(cubeSize * 0.92, cubeSize * 0.92, cubeSize * 0.92, 6, 0.12);
const innerMat = new THREE.MeshPhysicalMaterial({
  color: 0x44ff88,
  roughness: 0.0,
  metalness: 0.0,
  transmission: 0.96,
  thickness: 0.4,
  ior: 1.2,
  transparent: true,
  opacity: 0.18,
  side: THREE.BackSide,
  envMapIntensity: 1.4,
});
const innerCube = new THREE.Mesh(innerGeo, innerMat);
innerCube.name = 'innerGlass';
cube.add(innerCube);

// ── Gloss highlight plane (top face shine) ────────────────
const shineGeo = new THREE.PlaneGeometry(1.1, 0.38);
const shineMat = new THREE.MeshBasicMaterial({
  color: 0xeeffcc,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
});
const shine = new THREE.Mesh(shineGeo, shineMat);
shine.name = 'shineTop';
shine.position.set(-0.18, 0.93, 0.08);
shine.rotation.x = -Math.PI / 2;
cube.add(shine);

// ── Lime glow sprite behind cube ─────────────────────────
const spriteMat = new THREE.SpriteMaterial({
  color: 0x66ff44,
  transparent: true,
  opacity: 0.13,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const glowSprite = new THREE.Sprite(spriteMat);
glowSprite.name = 'glowSprite';
glowSprite.scale.set(5.5, 5.5, 1);
glowSprite.position.set(0, 0, -0.5);
scene.add(glowSprite);

// Second tighter glow
const spriteMat2 = new THREE.SpriteMaterial({
  color: 0xaaff44,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const glowSprite2 = new THREE.Sprite(spriteMat2);
glowSprite2.name = 'glowSprite2';
glowSprite2.scale.set(2.8, 2.8, 1);
scene.add(glowSprite2);

// ── Drop shadow disc ──────────────────────────────────────
const discGeo = new THREE.CircleGeometry(1.4, 64);
const discMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
});
const shadowDisc = new THREE.Mesh(discGeo, discMat);
shadowDisc.name = 'shadowDisc';
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -2.18;
scene.add(shadowDisc);

// Lime glow disc on floor
const glowDiscGeo = new THREE.CircleGeometry(1.1, 64);
const glowDiscMat = new THREE.MeshBasicMaterial({
  color: 0x66ff44,
  transparent: true,
  opacity: 0.07,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const glowDisc = new THREE.Mesh(glowDiscGeo, glowDiscMat);
glowDisc.name = 'glowDisc';
glowDisc.rotation.x = -Math.PI / 2;
glowDisc.position.y = -2.17;
scene.add(glowDisc);

// ── Particle dust ─────────────────────────────────────────
const particleCount = 120;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 7;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0x99ff66,
  size: 0.025,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
});
const particles = new THREE.Points(particleGeo, particleMat);
particles.name = 'dustParticles';
scene.add(particles);

// ── Animation ─────────────────────────────────────────────
const clock = new THREE.Clock();
let envUpdated = false;

function animate() {
  const t = clock.getElapsedTime();

  // Floating bob
  const floatY = Math.sin(t * 0.85) * 0.22;
  cube.position.y = floatY;

  // Gentle rotation
  cube.rotation.y = t * 0.22;
  cube.rotation.x = 0.15 + Math.sin(t * 0.4) * 0.07;
  cube.rotation.z = Math.sin(t * 0.35) * 0.04;

  // Glow light follows cube
  pointGlow.position.set(
    Math.sin(t * 0.5) * 1.0,
    floatY + 0.4,
    Math.cos(t * 0.5) * 1.0
  );
  pointGlow.intensity = 3.2 + Math.sin(t * 1.4) * 0.6;

  // Glow sprites follow
  glowSprite.position.set(cube.position.x, floatY, cube.position.z - 0.6);
  glowSprite2.position.copy(cube.position);

  // Shadow breathes
  const shadowScale = 0.92 - floatY * 0.14;
  shadowDisc.scale.set(shadowScale, shadowScale, 1);
  discMat.opacity = 0.38 - floatY * 0.06;
  glowDisc.scale.set(shadowScale, shadowScale, 1);

  // Particles drift slowly
  particles.rotation.y = t * 0.03;
  particles.rotation.x = t * 0.012;

  // Update env map once after first frame
  if (!envUpdated) {
    cube.visible = false;
    cubeCamera.update(renderer, scene);
    cube.visible = true;
    glassMat.envMap = cubeRT.texture;
    innerMat.envMap = cubeRT.texture;
    glassMat.needsUpdate = true;
    innerMat.needsUpdate = true;
    envUpdated = true;
  }

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// ── Resize ────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (container) {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
});
