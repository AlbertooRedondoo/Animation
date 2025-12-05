import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let scene, renderer, camera;
let sabers = [];
let stars;
let clashLight, clashBeam;
let titleGroup = null;
let titleMaterial = null;

const CLASH = { x: 0, y: 1.0 };

const BEAM = { x: 0, y: -2.5 };

const BLADE_LENGTH = 4;

init();
animationLoop();

function init() {
  // Escena y cámara
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Luces base
  const ambient = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambient);

  const keyLight = new THREE.PointLight(0xffffff, 2, 50);
  keyLight.position.set(5, 5, 10);
  scene.add(keyLight);

  // Estrellas, sables, efectos y texto
  createStarField();
  createLightsabers();
  createClashEffects();
  loadTitleFont();

  // Animación principal
  createAnimationSequence();

  // Eventos
  window.addEventListener("resize", onWindowResize);
}

// ESCENA

function createStarField() {
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const r = 80;
    positions[i * 3] = (Math.random() - 0.5) * r * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * r * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * r * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    sizeAttenuation: true,
  });

  stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

function createLightsabers() {
  const bladeHeight = BLADE_LENGTH;
  const bladeRadius = 0.08;
  const bladeGeo = new THREE.CylinderGeometry(
    bladeRadius,
    bladeRadius,
    bladeHeight,
    32
  );

  const blueMat = new THREE.MeshPhongMaterial({
    color: 0x66aaff,
    emissive: 0x2277ff,
    emissiveIntensity: 1.8,
  });

  const redMat = new THREE.MeshPhongMaterial({
    color: 0xff6666,
    emissive: 0xff2222,
    emissiveIntensity: 1.8,
  });

  const hiltGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 16);
  const hiltMat = new THREE.MeshStandardMaterial({
    color: 0xb5b5b5,
    metalness: 1,
    roughness: 0.25,
  });

  // Grupo sable azul
  const blueGroup = new THREE.Group();
  const blueBlade = new THREE.Mesh(bladeGeo, blueMat);
  const blueHilt = new THREE.Mesh(hiltGeo, hiltMat);

  blueBlade.position.y = bladeHeight / 2;
  blueHilt.position.y = -0.3;
  blueGroup.add(blueBlade);
  blueGroup.add(blueHilt);

  // Grupo sable rojo
  const redGroup = new THREE.Group();
  const redBlade = new THREE.Mesh(bladeGeo, redMat);
  const redHilt = new THREE.Mesh(hiltGeo, hiltMat);

  redBlade.position.y = bladeHeight / 2;
  redHilt.position.y = -0.3;
  redGroup.add(redBlade);
  redGroup.add(redHilt);

  resetSabers(blueGroup, redGroup);

  scene.add(blueGroup);
  scene.add(redGroup);
  sabers.push(blueGroup, redGroup);
}

function resetSabers(blueGroup, redGroup) {
  if (!blueGroup || !redGroup) {
    if (sabers.length === 2) {
      blueGroup = sabers[0];
      redGroup = sabers[1];
    }
  }
  if (!blueGroup || !redGroup) return;

  blueGroup.position.set(-6, -3, 0);
  redGroup.position.set(6, -3, 0);
  blueGroup.rotation.set(0, 0, 0);
  redGroup.rotation.set(0, 0, 0);
}

function createClashEffects() {
  clashLight = new THREE.PointLight(0xffffff, 0, 8);
  clashLight.position.set(BEAM.x, BEAM.y, 0);
  scene.add(clashLight);

  // Haz de luz al chocar
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.3, 2.5, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffffee,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
  });

  clashBeam = new THREE.Mesh(beamGeo, beamMat);
  clashBeam.rotation.z = Math.PI / 2; // horizontal
  clashBeam.position.set(BEAM.x, BEAM.y, 0);
  clashBeam.scale.set(0.01, 0.01, 0.01);
  scene.add(clashBeam);
}

function loadTitleFont() {
  const loader = new FontLoader();

  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      createTitleText(font);
    },
    undefined,
    (err) => {
      console.warn("Error cargando fuente:", err);
    }
  );
}

function createTitleText(font) {
  titleGroup = new THREE.Group();

  const textOptions = {
    font,
    size: 1.2,
    height: 0.25,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelOffset: 0,
    bevelSegments: 4,
  };

  const text1Geo = new TextGeometry("INFORMATICA", textOptions);
  const text2Geo = new TextGeometry("GRAFICA", textOptions);

  text1Geo.computeBoundingBox();
  text2Geo.computeBoundingBox();

  const centerGeo = (geo) => {
    const box = geo.boundingBox;
    const offsetX = (box.max.x - box.min.x) / 2;
    const offsetY = (box.max.y - box.min.y) / 2;
    geo.translate(-offsetX, -offsetY, 0);
  };

  centerGeo(text1Geo);
  centerGeo(text2Geo);

  titleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffee33,
    transparent: true,
    opacity: 0.0,
  });

  const textMesh1 = new THREE.Mesh(text1Geo, titleMaterial);
  const textMesh2 = new THREE.Mesh(text2Geo, titleMaterial);

  const lineSpacing = 1.4;
  textMesh1.position.set(0, lineSpacing * 0.5, -2);
  textMesh2.position.set(0, -lineSpacing * 0.5, -2);

  titleGroup.add(textMesh1);
  titleGroup.add(textMesh2);

  titleGroup.scale.set(0.001, 0.001, 0.001);
  titleGroup.visible = false;

  scene.add(titleGroup);
}

// ANIMACIÓN PRINCIPAL

function createAnimationSequence() {
  if (sabers.length < 2) return;
  const [blue, red] = sabers;

  const clashParams = { t: 0 };
  const exitParams = { t: 0 };
  const titleInParams = { s: 0.001, o: 0 };
  const titleOutParams = { s: 1, o: 1 };

  let blueExitStart = { x: 0, y: 0 };
  let redExitStart = { x: 0, y: 0 };

  const clashDuration = 1600; // ms

  // Sables se acercan y chocan en CLASH
  const clashTween = new TWEEN.Tween(clashParams)
    .to({ t: 1 }, clashDuration)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onStart(() => {
      resetSabers(blue, red);
    })
    .onUpdate(({ t }) => {
      // Posiciones iniciales de los mangos
      const blueStart = { x: -6, y: -3 };
      const redStart = { x: 6, y: -3 };
      const clashDistance = BLADE_LENGTH / 2;
      const blueEndBase = new THREE.Vector2(-1.3, -1.2);
      const redEndBase = new THREE.Vector2(1.3, -1.2);

      const blueDir = new THREE.Vector2(
        blueEndBase.x - CLASH.x,
        blueEndBase.y - CLASH.y
      ).normalize();

      const redDir = new THREE.Vector2(
        redEndBase.x - CLASH.x,
        redEndBase.y - CLASH.y
      ).normalize();
      const blueEnd = {
        x: CLASH.x + blueDir.x * clashDistance,
        y: CLASH.y + blueDir.y * clashDistance,
      };

      const redEnd = {
        x: CLASH.x + redDir.x * clashDistance,
        y: CLASH.y + redDir.y * clashDistance,
      };

      blue.position.x = THREE.MathUtils.lerp(blueStart.x, blueEnd.x, t);
      blue.position.y = THREE.MathUtils.lerp(blueStart.y, blueEnd.y, t);

      red.position.x = THREE.MathUtils.lerp(redStart.x, redEnd.x, t);
      red.position.y = THREE.MathUtils.lerp(redStart.y, redEnd.y, t);
      const clashPower = Math.sin(t * Math.PI);

      // Azul
      const dxB = CLASH.x - blue.position.x;
      const dyB = CLASH.y - blue.position.y;
      const angleB = Math.atan2(dxB, dyB); // ángulo del vector
      blue.rotation.set(0, 0, angleB + Math.PI + clashPower * 0.08);

      // Rojo
      const dxR = CLASH.x - red.position.x;
      const dyR = CLASH.y - red.position.y;
      const angleR = Math.atan2(dxR, dyR);
      red.rotation.set(0, 0, angleR + Math.PI - clashPower * 0.08);

      camera.position.x = Math.sin(t * 40) * 0.08 * clashPower;
      camera.position.y = Math.cos(t * 35) * 0.08 * clashPower;
      camera.lookAt(0, 0, 0);
    })
    .onComplete(() => {
      blueExitStart = { x: blue.position.x, y: blue.position.y };
      redExitStart = { x: red.position.x, y: red.position.y };
      startClashFlash();
    });

  // Sables salen disparados fuera de escena
  const exitTween = new TWEEN.Tween(exitParams)
    .to({ t: 1 }, 700)
    .easing(TWEEN.Easing.Cubic.In)
    .onStart(() => {
      exitParams.t = 0;
    })
    .onUpdate(({ t }) => {
      blue.position.x = THREE.MathUtils.lerp(blueExitStart.x, -10, t);
      blue.position.y = THREE.MathUtils.lerp(blueExitStart.y, -6, t);
      red.position.x = THREE.MathUtils.lerp(redExitStart.x, 10, t);
      red.position.y = THREE.MathUtils.lerp(redExitStart.y, -6, t);
    });

  // Entrada del texto INFORMATICA GRAFICA
  const titleInTween = new TWEEN.Tween(titleInParams)
    .to({ s: 1.1, o: 1 }, 1300)
    .easing(TWEEN.Easing.Cubic.Out)
    .onStart(() => {
      if (!titleGroup || !titleMaterial) return;
      titleGroup.visible = true;
      titleInParams.s = 0.001;
      titleInParams.o = 0;
    })
    .onUpdate(({ s, o }) => {
      if (!titleGroup || !titleMaterial) return;
      titleGroup.scale.set(s, s, s);
      titleMaterial.opacity = o;
      titleGroup.rotation.z = 0.03 * Math.sin(performance.now() * 0.002);
    });

  // Mantener título
  const titleHoldTween = new TWEEN.Tween({}).to({}, 1200).onUpdate(() => {
    if (!titleGroup) return;
    titleGroup.rotation.z = 0.03 * Math.sin(performance.now() * 0.002);
  });

  // Salida del título y reset de bucle
  const titleOutTween = new TWEEN.Tween(titleOutParams)
    .to({ s: 1.5, o: 0 }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .onStart(() => {
      titleOutParams.s = 1.1;
      titleOutParams.o = 1;
    })
    .onUpdate(({ s, o }) => {
      if (!titleGroup || !titleMaterial) return;
      titleGroup.scale.set(s, s, s);
      titleMaterial.opacity = o;
    })
    .onComplete(() => {
      if (titleGroup) {
        titleGroup.visible = false;
        titleGroup.scale.set(0.001, 0.001, 0.001);
      }
      resetSabers(blue, red);
      clashParams.t = 0;
      exitParams.t = 0;
      clashTween.start();
    });

  clashTween.chain(exitTween);
  exitTween.chain(titleInTween);
  titleInTween.chain(titleHoldTween);
  titleHoldTween.chain(titleOutTween);

  clashTween.start();
}

function startClashFlash() {
  if (!clashLight || !clashBeam) return;

  const flashParams = {
    intensity: 0,
    beamScale: 0.01,
    beamOpacity: 0.0,
  };

  const flashTween = new TWEEN.Tween(flashParams)
    .to(
      {
        intensity: 6,
        beamScale: 1,
        beamOpacity: 0.9,
      },
      180
    )
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .repeat(1)
    .onUpdate(({ intensity, beamScale, beamOpacity }) => {
      clashLight.intensity = intensity;
      clashBeam.scale.set(beamScale, beamScale, beamScale);
      clashBeam.material.opacity = beamOpacity;
    })
    .onComplete(() => {
      clashLight.intensity = 0;
      clashBeam.scale.set(0.01, 0.01, 0.01);
      clashBeam.material.opacity = 0.0;
    });

  flashTween.start();
}

//LOOP

function animationLoop() {
  requestAnimationFrame(animationLoop);

  const time = performance.now() * 0.0002;

  if (stars) {
    stars.rotation.y = time * 0.5;
  }

  TWEEN.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
