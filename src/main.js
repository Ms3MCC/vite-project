import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

// Setup a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(0, -6, 12);

// Setup the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 500);
pointLight.position.set(-6, 0, 10);
scene.add(pointLight);



// Define all geometries
const geometries = {
  Sphere: new THREE.SphereGeometry(1, 32, 32),
  Box: new THREE.BoxGeometry(2, 2, 2),
  Cone: new THREE.ConeGeometry(1, 2, 32),
  Cylinder: new THREE.CylinderGeometry(1, 1, 2, 32),
  Torus: new THREE.TorusGeometry(1, 0.4, 32, 64),
  TorusKnot: new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
};

// Common color for materials
const commonColor = 0x0088ff;

// Define all materials
const materials = {
  lambert: new THREE.MeshLambertMaterial({ color: commonColor }),
  standard: new THREE.MeshStandardMaterial({ color: commonColor, roughness: 0.8, metalness: 0.4 }),
  physical: new THREE.MeshPhysicalMaterial({
    color: commonColor,
    roughness: 0.5,
    metalness: 0.8,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
  }),
  phong: new THREE.MeshPhongMaterial({ color: commonColor, shininess: 150 }),
};

// Create an object to manage meshes and current shape
let currentShape = "Sphere";
const meshes = [];

// Function to create meshes for the current shape
const createMeshesForShape = (shapeName) => {
  // Remove old meshes
  meshes.forEach(({ mesh }) => scene.remove(mesh));
  meshes.length = 0;

  let xOffset = -12;
  for (const key in materials) {
    const mesh = new THREE.Mesh(geometries[shapeName], materials[key]);
    mesh.position.x = xOffset; // Position each mesh horizontally
    xOffset += 6;
    scene.add(mesh);
    meshes.push({ mesh, material: materials[key] });
  }
};

// Add Tweakpane controls
const pane = new Pane();
pane.element.style.width = "250px";

// Dropdown to select shape
const params = { Shape: "Sphere", rotationSpeed: 0.01, rotate: true };
pane.addBinding(params, "Shape", {
  options: {
    Sphere: "Sphere",
    Box: "Box",
    Cone: "Cone",
    Cylinder: "Cylinder",
    Torus: "Torus",
    TorusKnot: "TorusKnot",
  },
}).on("change", (ev) => {
  currentShape = ev.value;
  createMeshesForShape(currentShape);
});

// Rotation speed slider
pane.addBinding(params, "rotationSpeed", { min: 0, max: 0.1, step: 0.001 }).on("change", (ev) => {
  rotationSpeed = ev.value;
});

// Toggle rotation checkbox
pane.addBinding(params, "rotate").on("change", (ev) => {
  rotationEnabled = ev.value;
});

// Helper to create folders for material properties
const createMaterialFolder = (name, material) => {
  const folder = pane.addFolder({ title: name });

  // Roughness
  if ("roughness" in material) {
    folder.addBinding(material, "roughness", { min: 0, max: 1 });
  }

  // Metalness
  if ("metalness" in material) {
    folder.addBinding(material, "metalness", { min: 0, max: 1 });
  }

  // Clearcoat
  if ("clearcoat" in material) {
    folder.addBinding(material, "clearcoat", { min: 0, max: 1 });
    folder.addBinding(material, "clearcoatRoughness", { min: 0, max: 1 });
  }

  // Shininess
  if ("shininess" in material) {
    folder.addBinding(material, "shininess", { min: 0, max: 200 });
  }
};

// Add folders for all materials
for (const key in materials) {
  createMaterialFolder(key, materials[key]);
}

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Animation loop
let rotationSpeed = 0.01;
let rotationEnabled = true;

function animate() {
  requestAnimationFrame(animate);

  // Rotate the meshes if rotation is enabled
  if (rotationEnabled) {
    meshes.forEach(({ mesh }) => {
      mesh.rotation.x += rotationSpeed;
      mesh.rotation.y += rotationSpeed;
    });
  }

  renderer.render(scene, camera);
  controls.update();
}

// Initialize with the first shape
createMeshesForShape(currentShape);
animate();

// Adjust scene on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
