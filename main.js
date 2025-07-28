import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer(
  { canvas: document.getElementById('bg') }
)

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.z = 30

renderer.render(scene, camera)

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshStandardMaterial({ color: 0x00ff00});
// const torus = new THREE.Mesh(geometry, material);
// scene.add(torus);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function addStars() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24); // Smaller size for stars
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

// Create 200 stars
Array(200).fill().forEach(addStars);

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

const myTexture = new THREE.TextureLoader().load('egesa.jpeg');

const egesa = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ map: myTexture })
)

scene.add(egesa)

function animate() {
  requestAnimationFrame(animate);
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.01;
  egesa.rotation.x += 0.01;
  egesa.rotation.y += 0.005;
  egesa.rotation.z += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

animate();