import * as THREE from './three.module.js';
import * as CANNON from './cannon-es.js';

/*
  CHANGES:
  - Uses procedural textures for the bridge surface (road) and guard rails.
  - All wall meshes are created with their visible property set to false so they exist for collision detection but are not rendered.
  - Walls are added for both Floor1 and Floor2 with openings for the bridge.
  - Character movement speed for arrow keys is increased 3×.
  - The camera follows the humanoid in a third-person shooter style:
      * The camera’s desired offset is (0,10,20) (inverted from the previous default) so it sits in front of the character.
      * The user can manually rotate the camera (using mouse drag on desktop via orbitAngle).
      * However, when any arrow key is pressed the manual rotation (orbitAngle) is reset (set to 0), and the camera snaps back to the default perspective.
  - On mobile devices, a set of large arrow buttons (inside a container with id "mobileControls") controls movement.
  - Touch events on these buttons update keyStates with proper release on touchend/touchcancel.
  - Other features (speed slider, sun, clouds, clamping, walls, etc.) remain.
*/

// Procedurally generate a road texture using a canvas.
function generateRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#444444';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#888888';
  context.lineWidth = 4;
  context.setLineDash([20, 20]);
  context.beginPath();
  context.moveTo(0, canvas.height / 2);
  context.lineTo(canvas.width, canvas.height / 2);
  context.stroke();
  return new THREE.CanvasTexture(canvas);
}

// Procedurally generate a guard rail texture using a canvas.
function generateGuardRailTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#777777';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#999999';
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width, canvas.height);
  context.stroke();
  context.beginPath();
  context.moveTo(canvas.width, 0);
  context.lineTo(0, canvas.height);
  context.stroke();
  return new THREE.CanvasTexture(canvas);
}

const roadTexture = generateRoadTexture();
roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(4, 1);

const guardrailTexture = generateGuardRailTexture();
guardrailTexture.wrapS = guardrailTexture.wrapT = THREE.RepeatWrapping;
guardrailTexture.repeat.set(1, 1);

// Global camera control variables.
let invertCamera = false;
let orbitAngle = 0; // manual rotation angle
let forwardAngle = null;

// 1) SPEED SLIDER
const speedSlider = document.getElementById('speedSlider');
const speedLabel  = document.getElementById('speedLabel');
let moveSpeed = parseFloat(speedSlider.value);
speedLabel.textContent = moveSpeed;
speedSlider.addEventListener('input', () => {
  moveSpeed = parseFloat(speedSlider.value);
  speedLabel.textContent = moveSpeed;
});
['keydown','keypress','keyup'].forEach(evt => {
  speedSlider.addEventListener(evt, e => e.preventDefault());
});

// 2) MOBILE ARROW KEY CONTROLS (for mobile view)
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const keyStates = {};
if (isMobile) {
  const mobileControls = document.getElementById('mobileControls');
  if(mobileControls) {
    mobileControls.style.display = 'block';
    mobileControls.style.position = 'absolute';
    mobileControls.style.bottom = '20px';
    mobileControls.style.left = '20px';
    mobileControls.style.width = '300px';
    mobileControls.style.height = '300px';
    mobileControls.style.fontSize = '32px';
    const buttons = mobileControls.getElementsByTagName('button');
    for (let btn of buttons) {
      btn.style.width = '80px';
      btn.style.height = '80px';
      btn.style.margin = '10px';
    }
    document.getElementById('arrowUp').addEventListener('touchstart', () => { keyStates['ArrowUp'] = true; });
    document.getElementById('arrowUp').addEventListener('touchend', () => { keyStates['ArrowUp'] = false; });
    document.getElementById('arrowUp').addEventListener('touchcancel', () => { keyStates['ArrowUp'] = false; });
    document.getElementById('arrowDown').addEventListener('touchstart', () => { keyStates['ArrowDown'] = true; });
    document.getElementById('arrowDown').addEventListener('touchend', () => { keyStates['ArrowDown'] = false; });
    document.getElementById('arrowDown').addEventListener('touchcancel', () => { keyStates['ArrowDown'] = false; });
    document.getElementById('arrowLeft').addEventListener('touchstart', () => { keyStates['ArrowLeft'] = true; });
    document.getElementById('arrowLeft').addEventListener('touchend', () => { keyStates['ArrowLeft'] = false; });
    document.getElementById('arrowLeft').addEventListener('touchcancel', () => { keyStates['ArrowLeft'] = false; });
    document.getElementById('arrowRight').addEventListener('touchstart', () => { keyStates['ArrowRight'] = true; });
    document.getElementById('arrowRight').addEventListener('touchend', () => { keyStates['ArrowRight'] = false; });
    document.getElementById('arrowRight').addEventListener('touchcancel', () => { keyStates['ArrowRight'] = false; });
  }
} else {
  window.addEventListener('keydown', e => keyStates[e.code] = true);
  window.addEventListener('keyup', e => keyStates[e.code] = false);
}

// 3) THREE SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(100, 100, -100);
scene.add(sun);
for (let i = 0; i < 5; i++) {
  const cloudGeo = new THREE.SphereGeometry(3, 16, 16);
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const cloud = new THREE.Mesh(cloudGeo, cloudMat);
  cloud.position.set(Math.random() * 200 - 100, Math.random() * 30 + 50, Math.random() * 200 - 100);
  scene.add(cloud);
}
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 10, 20);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);
const ambLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambLight);

// 4) CAMERA ORBIT (manual rotation, desktop only)
if(!isMobile) {
  let isDragging = false;
  let prevMouseX = 0;
  const dragSpeed = 0.005;
  function rotateCameraWithMouse(deltaX) {
    orbitAngle += deltaX * dragSpeed; // note: positive rotation for manual control
  }
  renderer.domElement.addEventListener('mousedown', e => {
    if (e.button === 0) {
      isDragging = true;
      prevMouseX = e.clientX;
    }
  });
  renderer.domElement.addEventListener('mouseup', e => {
    if (e.button === 0) isDragging = false;
  });
  renderer.domElement.addEventListener('mousemove', e => {
    if (!isDragging) return;
    let deltaX = e.movementX || (e.clientX - prevMouseX);
    prevMouseX = e.clientX;
    rotateCameraWithMouse(deltaX);
  });
}

// 5) FLOORS & BRIDGE
const floorW = 160, floorD = 120;
const floorGeo1 = new THREE.PlaneGeometry(floorW, floorD);
const floorMat1 = new THREE.MeshStandardMaterial({ color: 0x008000 });
const floorMesh1 = new THREE.Mesh(floorGeo1, floorMat1);
floorMesh1.rotation.x = -Math.PI / 2;
scene.add(floorMesh1);

const bridgeWidth = 10;
const bridgeLen = 90;
const bridgeThick = 0.1;
const bridgeGeo = new THREE.BoxGeometry(bridgeWidth, bridgeThick, bridgeLen);
const bridgeMat = new THREE.MeshStandardMaterial({ 
  map: roadTexture,
  roughness: 0.8,
  metalness: 0.2
});
const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
bridgeMesh.position.set(0, 0, 105);
scene.add(bridgeMesh);

function createBridgeWall(xPos) {
  const wallGeo = new THREE.BoxGeometry(wallThick, 4, bridgeLen);
  const guardRailMat = new THREE.MeshStandardMaterial({ 
    map: guardrailTexture,
    roughness: 0.5,
    metalness: 0.7
  });
  const wall = new THREE.Mesh(wallGeo, guardRailMat);
  wall.position.set(xPos, 2, 105);
  wall.visible = false;
  scene.add(wall);
}
const wallThick = 0.2;
createBridgeWall(-(bridgeWidth / 2 + wallThick / 2));
createBridgeWall((bridgeWidth / 2 + wallThick / 2));

const floorGeo2 = new THREE.PlaneGeometry(floorW, floorD);
const floorMat2 = new THREE.MeshStandardMaterial({ color: 0x008000 });
const floorMesh2 = new THREE.Mesh(floorGeo2, floorMat2);
floorMesh2.rotation.x = -Math.PI / 2;
floorMesh2.position.z = 210;
scene.add(floorMesh2);

const grid1 = new THREE.GridHelper(floorW, 40, 0xffffff, 0xffffff);
grid1.position.y = 0.01;
grid1.scale.z = floorD / floorW;
scene.add(grid1);
const grid2 = new THREE.GridHelper(floorW, 40, 0xffffff, 0xffffff);
grid2.position.set(0, 0.01, 210);
grid2.scale.z = floorD / floorW;
scene.add(grid2);

// 6) CANNON WORLD SETUP
const world = new CANNON.World();
world.gravity.set(0, -50, 0);
const floorMaterial = new CANNON.Material();
const floorBody1 = new CANNON.Body({
  shape: new CANNON.Plane(),
  type: CANNON.Body.STATIC,
  material: floorMaterial
});
floorBody1.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floorBody1);
const bridgeBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(bridgeWidth / 2, bridgeThick / 2, bridgeLen / 2)),
  type: CANNON.Body.STATIC,
  material: floorMaterial
});
bridgeBody.position.set(0, 0, 105);
world.addBody(bridgeBody);
function createBridgeWallBody(xPos) {
  const wBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(wallThick / 2, 2, bridgeLen / 2)),
    type: CANNON.Body.STATIC,
    material: floorMaterial
  });
  wBody.position.set(xPos, 2, 105);
  world.addBody(wBody);
}
createBridgeWallBody(-(bridgeWidth / 2 + wallThick / 2));
createBridgeWallBody((bridgeWidth / 2 + wallThick / 2));
const floorBody2 = new CANNON.Body({
  shape: new CANNON.Plane(),
  type: CANNON.Body.STATIC,
  material: floorMaterial
});
floorBody2.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
floorBody2.position.z = 210;
world.addBody(floorBody2);
const humanMaterial = new CANNON.Material();
const contactMat = new CANNON.ContactMaterial(humanMaterial, floorMaterial, {
  friction: 3.0,
  restitution: 0.0
});
world.addContactMaterial(contactMat);

// 6.5) FLOOR 2 WALLS (with collision, invisible)
function createFloor2Wall(width, height, depth, posX, posY, posZ) {
  const wallGeo = new THREE.BoxGeometry(width, height, depth);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(posX, posY, posZ);
  wallMesh.visible = false;
  scene.add(wallMesh);
  
  const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
  const wallShape = new CANNON.Box(halfExtents);
  const wallBody = new CANNON.Body({ mass: 0, material: floorMaterial });
  wallBody.addShape(wallShape);
  wallBody.position.set(posX, posY, posZ);
  world.addBody(wallBody);
}
const floor2WallHeight = 4;
createFloor2Wall(floorW / 2 - 10, floor2WallHeight, 2, (10 + floorW / 2) / 2, floor2WallHeight / 2, 150);
createFloor2Wall(floorW / 2 - 10, floor2WallHeight, 2, (-floorW / 2 + -10) / 2, floor2WallHeight / 2, 150);
createFloor2Wall(floorW, floor2WallHeight, 2, 0, floor2WallHeight / 2, 270);
createFloor2Wall(2, floor2WallHeight, floorD, -floorW / 2, floor2WallHeight / 2, 210);
createFloor2Wall(2, floor2WallHeight, floorD, floorW / 2, floor2WallHeight / 2, 210);

// 6.5.1) FLOOR 1 WALLS (with collision, invisible)
function createFloor1Wall(width, height, depth, posX, posY, posZ) {
  const wallGeo = new THREE.BoxGeometry(width, height, depth);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(posX, posY, posZ);
  wallMesh.visible = false;
  scene.add(wallMesh);
  
  const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
  const wallShape = new CANNON.Box(halfExtents);
  const wallBody = new CANNON.Body({ mass: 0, material: floorMaterial });
  wallBody.addShape(wallShape);
  wallBody.position.set(posX, posY, posZ);
  world.addBody(wallBody);
}
const floor1WallHeight = 4;
createFloor1Wall(floorW, floor1WallHeight, 2, 0, floor1WallHeight / 2, -floorD / 2);
createFloor1Wall(2, floor1WallHeight, floorD, -floorW / 2, floor1WallHeight / 2, 0);
createFloor1Wall(2, floor1WallHeight, floorD, floorW / 2, floor1WallHeight / 2, 0);
createFloor1Wall(floorW / 2 - 10, floor1WallHeight, 2, (10 + floorW / 2) / 2, floor1WallHeight / 2, floorD / 2);
createFloor1Wall(floorW / 2 - 10, floor1WallHeight, 2, (-floorW / 2 - 10) / 2, floor1WallHeight / 2, floorD / 2);

// 7) HUMANOID SETUP
const human = new THREE.Group();
scene.add(human);
const faceTexture = new THREE.TextureLoader().load('./face.png');
const headGeo = new THREE.SphereGeometry(0.5, 32, 32);
const headMat = new THREE.MeshStandardMaterial({ map: faceTexture });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 2.2;
human.add(head);
const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 1.2;
human.add(body);
const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
const armMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const leftArm = new THREE.Mesh(armGeo, armMat);
leftArm.position.set(-0.7, 1.4, 0);
human.add(leftArm);
const rightArm = new THREE.Mesh(armGeo, armMat);
rightArm.position.set(0.7, 1.4, 0);
human.add(rightArm);
const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
const legMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
const leftLeg = new THREE.Mesh(legGeo, legMat);
leftLeg.position.set(-0.3, 0.5, 0);
human.add(leftLeg);
const rightLeg = new THREE.Mesh(legGeo, legMat);
rightLeg.position.set(0.3, 0.5, 0);
human.add(rightLeg);
const humanBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 1.2, 0.3)),
  mass: 10,
  position: new CANNON.Vec3(0, 2, 0),
  material: humanMaterial
});
humanBody.fixedRotation = true;
humanBody.updateMassProperties();
world.addBody(humanBody);

// 8) MOVEMENT, CLAMPING, AND CAMERA FOLLOW
let oldTime = performance.now();
let walkTime = 0;
function animate(){
  requestAnimationFrame(animate);
  const newTime = performance.now();
  const delta = (newTime - oldTime) / 1000;
  oldTime = newTime;
  world.step(1/60, delta, 3);
  humanBody.velocity.x = 0;
  humanBody.velocity.z = 0;
  // Increase movement speed 3× for arrow keys.
  if(keyStates['ArrowUp'])   { humanBody.velocity.z = moveSpeed * 3; }
  if(keyStates['ArrowDown']) { humanBody.velocity.z = -moveSpeed * 3; }
  if(keyStates['ArrowLeft']) { humanBody.velocity.x = moveSpeed * 3; }
  if(keyStates['ArrowRight']){ humanBody.velocity.x = -moveSpeed * 3; }
  const vx = humanBody.velocity.x;
  const vz = humanBody.velocity.z;
  const isMoving = (Math.abs(vx) > 0.1 || Math.abs(vz) > 0.1);
  if(isMoving){
    const angle = Math.atan2(vx, -vz);
    human.rotation.y = angle;
  }
  let px = humanBody.position.x;
  let pz = humanBody.position.z;
  if(pz < 60){
    px = Math.max(-79, Math.min(79, px));
    pz = Math.max(-59, Math.min(60, pz));
  } else if(pz > 155){
    px = Math.max(-79, Math.min(79, px));
    pz = Math.max(155, Math.min(270, pz));
  } else {
    if(Math.abs(px) < 10) {
      px = Math.max(-4, Math.min(4, px));
    } else {
      px = Math.max(-79, Math.min(79, px));
    }
    pz = Math.max(60, Math.min(155, pz));
  }
  humanBody.position.x = px;
  humanBody.position.z = pz;
  human.position.copy(humanBody.position);
  if(isMoving){
    walkTime += delta * 5;
    const swing = Math.sin(walkTime * 10) * 0.4;
    leftArm.rotation.x = swing;
    rightArm.rotation.x = -swing;
    leftLeg.rotation.x = -swing;
    rightLeg.rotation.x = swing;
  } else {
    leftArm.rotation.x = 0;
    rightArm.rotation.x = 0;
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
  // Camera follow logic:
  // If any arrow key is pressed, reset manual rotation (orbitAngle) to 0.
  if(keyStates['ArrowUp'] || keyStates['ArrowDown'] || keyStates['ArrowLeft'] || keyStates['ArrowRight']){
    orbitAngle = 0;
  }
  // Desired offset is (0,10,20) in the character’s local space (inverted view).
  const desiredOffset = new THREE.Vector3(0, 10, 20);
  // If no arrow keys are pressed, allow manual rotation via orbitAngle.
  if(!(keyStates['ArrowUp'] || keyStates['ArrowDown'] || keyStates['ArrowLeft'] || keyStates['ArrowRight'])){
    desiredOffset.applyAxisAngle(new THREE.Vector3(0,1,0), orbitAngle);
  }
  desiredOffset.applyQuaternion(human.quaternion);
  const desiredCameraPos = human.position.clone().add(desiredOffset);
  // Smoothly interpolate the camera to the desired position.
  camera.position.lerp(desiredCameraPos, 0.1);
  camera.lookAt(human.position);
  renderer.render(scene, camera);
}
animate();