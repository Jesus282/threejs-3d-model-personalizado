import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// =============================
// VARIABLES
// =============================
const manager = new THREE.LoadingManager();

let camera, scene, renderer, stats;
let object, mixer;
let clock = new THREE.Clock();

let actions = {};
let activeAction;
let previousAction;

// 🔥 IMPORTANTE: turn.fbx tiene modelo
const baseModel = 'turn.fbx';

// Animaciones externas (SIN SKIN)
const animationsList = {
    sitting: 'sitting.fbx',
    thumbs: 'thumbs_up.fbx',
    snatch: 'snatch.fbx',
    phone: 'phone.fbx'
};

// =============================
// INIT
// =============================
init();

function init() {

    const container = document.getElementById('container');

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // Luces
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(0, 200, 100);
    scene.add(dirLight);

    // Suelo
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20);
    scene.add(grid);

    // 🔥 Cargar modelo base (turn)
    loadBaseModel();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animate);

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    stats = new Stats();
    container.appendChild(stats.dom);

    setupKeyboard();
}

// =============================
// CARGAR MODELO BASE
// =============================
function loadBaseModel() {

    const loader = new FBXLoader(manager);

    loader.load('./assets/models/fbx/' + baseModel, (fbx) => {

        object = fbx;
        object.scale.set(1, 1, 1);

        mixer = new THREE.AnimationMixer(object);

        // 🔥 usar animación del mismo turn
        const baseClip = fbx.animations[0];
        const baseAction = mixer.clipAction(baseClip);

        actions['turn'] = baseAction;
        activeAction = baseAction;
        baseAction.play();

        scene.add(object);

        loadAnimations(); // cargar las demás
    });
}

// =============================
// CARGAR ANIMACIONES EXTERNAS
// =============================
function loadAnimations() {

    const loader = new FBXLoader(manager);

    for (const key in animationsList) {

        loader.load('./assets/animations/' + animationsList[key], (anim) => {

            const clip = anim.animations[0];
            const action = mixer.clipAction(clip);

            actions[key] = action;
        });
    }
}

// =============================
// TRANSICIÓN SUAVE
// =============================
function fadeToAction(name, duration = 0.5) {

    if (!actions[name]) return;

    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {

        previousAction.fadeOut(duration);

        activeAction
            .reset()
            .fadeIn(duration)
            .play();
    }
}

// =============================
// TECLADO
// =============================
function setupKeyboard() {

    window.addEventListener('keydown', (e) => {

        switch (e.key) {

            case '1':
                fadeToAction('sitting');
                break;

            case '2':
                fadeToAction('thumbs');
                break;

            case '3':
                fadeToAction('snatch');
                break;

            case '4':
                fadeToAction('phone');
                break;

            case '5':
                fadeToAction('turn');
                break;
        }
    });
}

// =============================
// RESIZE
// =============================
function onWindowResize() {

    const container = document.getElementById('container');

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// =============================
// ANIMATE
// =============================
function animate() {

    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    stats.update();
}