import './style.css';
import * as THREE from './node_modules/three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function main() {
  const canvas = document.querySelector('.webgl');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 40;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 20, 50);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  // controls.enablePan = false;
  controls.enableDamping = true;
  // controls.enableZoom = false;
  controls.minDistance = 30;
  controls.maxDistance = 80;

  const scene = new THREE.Scene();

  /*
  * Light's & effects
  */
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  const composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  {
    const color = 0xf9d71c;
    const intensity = 0.8;
    const light = new THREE.PointLight(color, intensity);
    scene.add(light);
    scene.add(new THREE.AmbientLight( color, 0.1 ))
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    light.position.set( 0, 0, 0 );
    light.castShadow = true;
    scene.add(light);
    
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500;
  }

  const objects = [];

  const radius = 1;
  const widthSegments = 32;
  const heightSegments = 32;
  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

  /*
   * Textures 
   */
  const milkyWayTexture = new THREE.TextureLoader().load('./textures/milky_way.jpg');
  scene.background = milkyWayTexture;
  const earthTexture = new THREE.TextureLoader().load('./textures/earth.jpg');
  const moonTexture = new THREE.TextureLoader().load('./textures/moon.jpg');

  /*
  * Solar system parent
  */
  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);
  objects.push(solarSystem);

  /*
  * Sun object
  */
  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xf9d71c });
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5);
  solarSystem.add(sunMesh);
  objects.push(sunMesh);

  /*
  * Earth orbit
  */
  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 20;
  solarSystem.add(earthOrbit);
  objects.push(earthOrbit);

  /*
  * Earth object
  */
  const earthMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffffff, emissiveMap: earthTexture });
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
  earthMesh.castShadow = true; //default is false
  earthMesh.receiveShadow = true; //default
  earthOrbit.add(earthMesh);
  objects.push(earthMesh);

  /*
  * Moon object
  */
  const moonEarthOrbit = new THREE.Object3D();
  moonEarthOrbit.position.x = 20;
  solarSystem.add(moonEarthOrbit);
  // objects.push(moonEarthOrbit);

  const moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 3;
  moonEarthOrbit.add(moonOrbit);

  const moonMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffffff, emissiveMap: moonTexture });
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.set(0.5, 0.5, 0.5);
  moonMesh.castShadow = true; //default is false
  moonMesh.receiveShadow = true; //default
  moonOrbit.add(moonMesh);
  objects.push(moonMesh);

  /*
  * Resizing renderer
  */
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /*
  * Animation
  */
  function render(time) {
    time *= 0.001 / 3;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj) => {
      obj.rotation.y = time;
    });
    moonEarthOrbit.rotation.y = time * 5;

    controls.update();

    requestAnimationFrame(render);

    composer.render();
  }

  requestAnimationFrame(render);
}

main();