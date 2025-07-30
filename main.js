import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// Star field
const starCount = 300;
const stars = [];
for (let i = 0; i < starCount; i++) {
  const geometry = new THREE.SphereGeometry(0.03, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40
  );
  scene.add(star);
  stars.push(star);
}

// Texture loader with error handling
const textureLoader = new THREE.TextureLoader();
let bingoTexture;

try {
  bingoTexture = textureLoader.load('bingo.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  });
} catch (error) {
  console.error("Error loading texture:", error);
  // Fallback color if texture fails to load
  bingoTexture = null;
}

// Create bingo balls
const ballRadius = 1.5;
const ballGeometry = new THREE.SphereGeometry(ballRadius, 64, 64);
const ballCount = 8;
const bingoBalls = [];

for (let i = 0; i < ballCount; i++) {
  // Create material with texture
  const ballMaterial = new THREE.MeshPhongMaterial({
    map: bingoTexture || new THREE.Color(Math.random() * 0xffffff),
    bumpScale: 0.05,
    shininess: 100,
    specular: 0x111111,
    transparent: false,
    opacity: 0.95,
    side: THREE.DoubleSide
  });

  const bingoBall = new THREE.Mesh(ballGeometry, ballMaterial);
  
  // Position balls randomly
  bingoBall.position.set(
    (Math.random() - 0.5) * 15,
    Math.random() * 10 + 10,
    (Math.random() - 0.5) * 10
  );
  
  // Physics properties
  bingoBall.userData = {
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      -Math.random() * 0.2,
      (Math.random() - 0.5) * 0.2
    ),
    gravity: -0.008,
    bounce: 0.7 + Math.random() * 0.2,
    rotationSpeed: new THREE.Vector3(
      Math.random() * 0.02,
      Math.random() * 0.02,
      Math.random() * 0.02
    )
  };
  
  // Add subtle emissive glow
  if (bingoTexture) {
    ballMaterial.emissive = new THREE.Color(0x333333);
    ballMaterial.emissiveMap = bingoTexture;
  }
  
  scene.add(bingoBall);
  bingoBalls.push(bingoBall);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x66aaff, 1.5, 50);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff6666, 1.0, 40);
pointLight2.position.set(10, 10, 5);
scene.add(pointLight2);

// Floor with grid
const floorSize = 30;
const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x111133,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
  metalness: 0.2,
  roughness: 0.7
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -5;
scene.add(floor);

const gridHelper = new THREE.GridHelper(floorSize, 20, 0x444466, 0x222244);
gridHelper.position.y = -5;
scene.add(gridHelper);

// Invisible walls
const wallGeometry = new THREE.PlaneGeometry(floorSize, 20);
const wallMaterial = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

const wallPositions = [
  { position: [0, 0, -floorSize/2], rotation: [0, 0, 0] },
  { position: [0, 0, floorSize/2], rotation: [0, Math.PI, 0] },
  { position: [-floorSize/2, 0, 0], rotation: [0, Math.PI/2, 0] },
  { position: [floorSize/2, 0, 0], rotation: [0, -Math.PI/2, 0] }
];

wallPositions.forEach(pos => {
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(pos.position[0], pos.position[1], pos.position[2]);
  wall.rotation.set(pos.rotation[0], pos.rotation[1], pos.rotation[2]);
  scene.add(wall);
});

// Animation functions
function animateStars() {
  stars.forEach((star, i) => {
    star.position.x += Math.sin(Date.now() * 0.0002 + i) * 0.0005;
    star.position.y += Math.cos(Date.now() * 0.0002 + i) * 0.0005;
  });
}

function updateBalls() {
  const floorLevel = -5 + ballRadius;
  const boundary = floorSize/2 - ballRadius;

  bingoBalls.forEach(ball => {
    const physics = ball.userData;
    
    physics.velocity.y += physics.gravity;
    ball.position.add(physics.velocity);
    
    // Floor collision
    if (ball.position.y < floorLevel) {
      ball.position.y = floorLevel;
      physics.velocity.y *= -physics.bounce;
      physics.velocity.multiplyScalar(0.9);
    }
    
    // Wall collisions
    if (Math.abs(ball.position.x) > boundary) {
      ball.position.x = Math.sign(ball.position.x) * boundary;
      physics.velocity.x *= -physics.bounce;
    }
    if (Math.abs(ball.position.z) > boundary) {
      ball.position.z = Math.sign(ball.position.z) * boundary;
      physics.velocity.z *= -physics.bounce;
    }
    
    // Rotation
    ball.rotation.x += physics.rotationSpeed.x;
    ball.rotation.y += physics.rotationSpeed.y;
    ball.rotation.z += physics.rotationSpeed.z;
    
    // Respawn if settled
    if (Math.abs(physics.velocity.y) < 0.001 && ball.position.y <= floorLevel + 0.1) {
      if (Math.random() < 0.01) {
        ball.position.set(
          (Math.random() - 0.5) * (boundary * 0.8),
          Math.random() * 10 + 10,
          (Math.random() - 0.5) * (boundary * 0.8)
        );
        physics.velocity.set(
          (Math.random() - 0.5) * 0.3,
          -Math.random() * 0.3,
          (Math.random() - 0.5) * 0.3
        );
      }
    }
  });
}

function animate() {
  updateBalls();
  animateStars();
  
  // Camera movement
  camera.position.x = Math.sin(Date.now() * 0.0002) * 3;
  camera.position.z = 20 + Math.cos(Date.now() * 0.0003) * 2;
  camera.lookAt(0, 0, 0);

  if (window.controls) window.controls.update();
  renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// OrbitControls
(async () => {
  const module = await import('three/examples/jsm/controls/OrbitControls.js');
  const OrbitControls = module.OrbitControls;
  window.controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI * 0.8;
})();