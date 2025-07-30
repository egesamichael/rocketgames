import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510); // Space-like dark background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Create a star field
const starCount = 300;
const stars = [];
for (let i = 0; i < starCount; i++) {
  const geometry = new THREE.SphereGeometry(0.03, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.position.x = (Math.random() - 0.5) * 40;
  star.position.y = (Math.random() - 0.5) * 40;
  star.position.z = (Math.random() - 0.5) * 40;
  scene.add(star);
  stars.push(star);
}

// Create the bingo ball sphere
const ballRadius = 5;
const ballGeometry = new THREE.SphereGeometry(ballRadius, 64, 64);

// Load the bingo text texture
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load('bingo.jpg', (texture) => {
  // Adjust texture settings for better appearance
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

const ballMaterial = new THREE.MeshBasicMaterial({
  map: ballTexture,
  color: 0xffffff,
  shininess: 100,
  specular: 0x111111,
  emissive: 0x000000,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9
});

const bingoBall = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(bingoBall);

// Add glowing edge to the ball
// const edges = new THREE.EdgesGeometry(ballGeometry);
// const edgeMaterial = new THREE.LineBasicMaterial({ 
//   color: 0x66aaff, 
//   linewidth: 2,
//   transparent: true,
//   opacity: 0.7
// });
// const ballEdges = new THREE.LineSegments(edges, edgeMaterial);
// bingoBall.add(ballEdges);

// Animation variables
let ballRotationSpeed = 0.005;
let pulseDirection = 1;
let pulseSpeed = 0.005;

camera.position.z = 15;

// Add a soft ambient and point light for glow
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x66aaff, 1.2, 40);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// Add another point light for better illumination
const pointLight2 = new THREE.PointLight(0xff6666, 0.8, 30);
pointLight2.position.set(10, 10, 5);
scene.add(pointLight2);

// Animate stars to float gently
function animateStars() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.position.x += Math.sin(Date.now() * 0.0002 + i) * 0.0005;
    star.position.y += Math.cos(Date.now() * 0.0002 + i) * 0.0005;
  }
}

function animate() {
  // Rotate the bingo ball
  bingoBall.rotation.x += ballRotationSpeed * 0.5;
  bingoBall.rotation.y += ballRotationSpeed;
  
  // Pulsing effect
  const scale = bingoBall.scale.x;
  if (scale > 1.1) pulseDirection = -1;
  if (scale < 0.9) pulseDirection = 1;
  bingoBall.scale.x += pulseSpeed * pulseDirection;
  bingoBall.scale.y += pulseSpeed * pulseDirection;
  bingoBall.scale.z += pulseSpeed * pulseDirection;
  
  // Slightly rotate the camera for a dynamic space effect
  camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
  camera.position.y = Math.cos(Date.now() * 0.0001) * 2;
  camera.lookAt(0, 0, 0);

  animateStars();
  if (window.controls) window.controls.update();
  renderer.render(scene, camera);
}

// Add OrbitControls for camera movement
(async () => {
  const module = await import('three/examples/jsm/controls/OrbitControls.js');
  const OrbitControls = module.OrbitControls;
  window.controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 40;
})();