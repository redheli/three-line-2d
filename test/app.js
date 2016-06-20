
/*
  This is a generic "ThreeJS Application"
  helper which sets up a renderer and camera
  controls.
 */

const createControls = require('orbit-controls');
const assign = require('object-assign');

module.exports = createApp;
function createApp (opt) {
  opt = opt || {};

  // Scale for retina
  const dpr = window.devicePixelRatio;

  // Our WebGL renderer with alpha and device-scaled
  const renderer = new THREE.WebGLRenderer(assign({
    antialias: true // default enabled
  }, opt));
  
  // Not available in old ThreeJS versions
  if (typeof renderer.setPixelRatio === 'function') {
    renderer.setPixelRatio(dpr);
  }

  // Show the <canvas> on screen
  const canvas = renderer.domElement;
  document.body.appendChild(canvas);

  // 3D camera looking
  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
  const target = new THREE.Vector3();

  // 3D scene
  const scene = new THREE.Scene();

  // 3D orbit controller with damping
  const controls = createControls(assign({
    canvas: canvas,
    theta: 5 * Math.PI / 180,
    phi: -90 * Math.PI / 180,
    distance: 3,
    distanceBounds: [ 2, 40 ]
  }, opt));

  // Update frame size
  window.addEventListener('resize', resize);

  // Setup initial size
  resize();
  createGrid();

  return {
    updateProjectionMatrix: updateProjectionMatrix,
    camera: camera,
    scene: scene,
    renderer: renderer,
    controls: controls,
    canvas: canvas
  };

  function updateProjectionMatrix () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // update camera controls
    controls.update();
    camera.position.fromArray(controls.position);
    camera.up.fromArray(controls.up);
    camera.lookAt(target.fromArray(controls.direction));

    // Update camera matrices
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function resize () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateProjectionMatrix();
  }

  function createGrid() {
    var size = 100;
    var step = 1;

    var gridHelper = new THREE.GridHelper( size, step );
    gridHelper.position = new THREE.Vector3(0, 0, 0);
    // http://danni-three.blogspot.sg/2013/09/threejs-helpers.html
    // grid XY
    gridHelper.rotation.x = Math.PI/2;
    scene.add( gridHelper );

    // axis
    var axisHelper = new THREE.AxisHelper( 10 );
    scene.add( axisHelper );
  }
}
