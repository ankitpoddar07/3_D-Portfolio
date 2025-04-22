import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Three.js Scene Setup
const canvas = document.querySelector('canvas.webgl');
if (!canvas) throw new Error('Canvas not found');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;

// Geometry
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material = new THREE.MeshNormalMaterial();
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

// Stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 1000;
    starPositions[i + 1] = (Math.random() - 0.5) * 1000;
    starPositions[i + 2] = (Math.random() - 0.5) * 1000;

    starColors[i] = 0.8 + Math.random() * 0.2;
    starColors[i + 1] = 0.8 + Math.random() * 0.2;
    starColors[i + 2] = 0.9 + Math.random() * 0.1;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    sizeAttenuation: true
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Enhanced Lighting Setup
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 5, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 0, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemisphereLight);

// Texture Loader with error handling
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('./textures/sun.webp', undefined, undefined, (err) => {
    console.error('Error loading sun texture:', err);
});
const planetTextures = [
    textureLoader.load('/textures/mercury.jpg', undefined, undefined, (err) => console.error('Error loading mercury texture:', err)),
    textureLoader.load('/textures/venus.jpg', undefined, undefined, (err) => console.error('Error loading venus texture:', err)),
    textureLoader.load('/textures/earth.jpg', undefined, undefined, (err) => console.error('Error loading earth texture:', err)),
    textureLoader.load('/textures/mars.jpg', undefined, undefined, (err) => console.error('Error loading mars texture:', err)),
    textureLoader.load('/textures/jupiter.png', undefined, undefined, (err) => console.error('Error loading jupiter texture:', err)),
    textureLoader.load('/textures/saturn.webp', undefined, undefined, (err) => console.error('Error loading saturn texture:', err)),
    textureLoader.load('/textures/uranus.webp', undefined, undefined, (err) => console.error('Error loading uranus texture:', err)),
    textureLoader.load('/textures/neptune.jpg', undefined, undefined, (err) => console.error('Error loading neptune texture:', err))
];

// Sun with enhanced material
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    toneMapped: false
});
sunMaterial.color.setHSL(0.1, 0.9, 0.9);
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    sunMaterial
);
scene.add(sun);

// Planets with enhanced materials
const planets = [];
const distances = [5, 8, 11, 14, 20, 26, 32, 38];
const sizes = [0.4, 0.6, 0.6, 0.5, 1.2, 1.0, 0.8, 0.8];

for (let i = 0; i < planetTextures.length; i++) {
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTextures[i],
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0x111111,
        emissiveIntensity: 0.3,
        toneMapped: false
    });

    planetMaterial.color.setHSL(
        Math.random() * 0.1 + 0.05,
        0.8,
        0.8
    );

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(sizes[i], 64, 64),
        planetMaterial
    );

    // Add atmospheric glow effect
    const glowGeometry = new THREE.SphereGeometry(sizes[i] * 1.1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);

    planet.position.x = distances[i];
    scene.add(planet);
    planets.push(planet);
}

// Load Astronaut Model
const loader = new GLTFLoader();
let astronaut;
loader.load(
    'astronaut.glb',
    (gltf) => {
        astronaut = gltf.scene;
        astronaut.scale.set(0.5, 0.5, 0.5);
        astronaut.position.set(0, 0, 10);
        scene.add(astronaut);
    },
    undefined,
    (error) => {
        console.error('Error loading astronaut model:', error);
    }
);

// Butterflies
class Butterfly {
    constructor() {
        const wingGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([-0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0,
            0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0
        ]);
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const hue = Math.random() * 0.2 + 0.8;
        const wingMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 0.9, 0.6),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });

        this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.rightWing.position.x = 0.5;
        this.leftWing.position.x = -0.5;

        this.mesh = new THREE.Group();
        this.mesh.add(this.leftWing);
        this.mesh.add(this.rightWing);

        this.mesh.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );

        this.wingSpeed = 0.1 + Math.random() * 0.2;
        this.flySpeed = 0.02 + Math.random() * 0.03;
        this.time = Math.random() * 100;
        this.direction = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize();

        scene.add(this.mesh);
    }

    animate() {
        this.time += this.wingSpeed;
        this.leftWing.rotation.y = Math.sin(this.time) * 0.5;
        this.rightWing.rotation.y = -Math.sin(this.time) * 0.5;

        this.mesh.position.add(this.direction.clone().multiplyScalar(this.flySpeed));
        this.mesh.position.y += Math.sin(this.time * 2) * 0.02;

        if (Math.random() < 0.01) {
            this.direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
        }
    }
}
const butterflies = Array(20).fill().map(() => new Butterfly());

// Animation
const animate = () => {
    requestAnimationFrame(animate);

    torusKnot.rotation.x += 0.01;
    torusKnot.rotation.y += 0.01;

    planets.forEach((planet, index) => {
        const angle = Date.now() * 0.0001 * (index + 1);
        planet.position.x = distances[index] * Math.cos(angle);
        planet.position.z = distances[index] * Math.sin(angle);
        planet.rotation.y += 0.01;
    });

    butterflies.forEach(butterfly => butterfly.animate());

    if (astronaut) {
        const astronautAngle = Date.now() * 0.0002;
        astronaut.position.x = 10 * Math.cos(astronautAngle);
        astronaut.position.z = 10 * Math.sin(astronautAngle);
        astronaut.lookAt(0, 0, 0);
    }

    controls.update();
    renderer.render(scene, camera);
};

animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Cleanup function
window.addEventListener('beforeunload', () => {
    [geometry, starGeometry].forEach(geom => geom.dispose());
    [material, starMaterial].forEach(mat => mat.dispose());
    planetTextures.forEach(tex => tex.dispose());
    if (sunTexture) sunTexture.dispose();
});