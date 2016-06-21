global.THREE = require('three');
const createLoop = require('raf-loop');
const createApp = require('./app');

var Line = require('../')(THREE);
var BasicShader = require('../shaders/basic')(THREE);
var DashShader = require('./shader-dash')(THREE);
var TwoDLineShader = require('./shader-2Dline')(THREE);
var GradientShader = require('./shader-gradient')(THREE);

var normalize = require('normalize-path-scale');
var arc = require('arc-to');
var curve = require('adaptive-bezier-curve');

// test normal
var getNormals = require('polyline-normals');
var my_path = [[0, 1], [4, 1]];
var my_path2 = [[0, 4], [4, 4],[8,8],[12,4],[16,4],[30,50],[10,30]];
var normals = getNormals(my_path, false);
console.log(normals);


var curvePath = path1();
var circlePath = normalize(arc(0, 0, 25, 0, Math.PI * 2, false, 64));
var boxPath = [[0, 1], [4, 1]];

var app = createApp({ antialias: true });
app.renderer.setClearColor('#1d1d1d', 1);

var time = 0;
setup();

function setup () {
  // // Our bezier curve
  var curveGeometry = Line(my_path2);
  var mat = new THREE.ShaderMaterial(BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 2
  }));
  var mesh = new THREE.Mesh(curveGeometry, mat);
  // app.scene.add(mesh);

  // // Our dashed circle
  // circlePath.pop();
  // var circleGeometry = Line(circlePath, { distances: true, closed: true });
  // var dashMat = new THREE.ShaderMaterial(DashShader({
  //   side: THREE.DoubleSide,
  //   diffuse: 0x5cd7ff
  // }));
  // var mesh2 = new THREE.Mesh(circleGeometry, dashMat);
  // mesh2.position.x = -2;
  // //mesh2.scale.multiplyScalar(0.5);
  // app.scene.add(mesh2);

  // // Our 2D line
  // circlePath.pop();
  var loader = new THREE.TextureLoader();

  loader.load('images/direction.png', function ( texture ) {

      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

    var twoDGeometry = Line(my_path, {distances: true, closed: false, diffuse: 0x5cd7ff});
    twoDGeometry.lineDistancesNeedUpdate = true;
    var twoDMat = new THREE.ShaderMaterial(TwoDLineShader({
      thickness: 2,
      side: THREE.DoubleSide,
      diffuse: 0x00ff00,

      texture1: texture,

      dashSize: 0.5,
      totalSize: 1.0
    }));
    var twoDMesh = new THREE.Mesh(twoDGeometry, twoDMat);
    // twoDMesh.position.y = 0.5;
    // twoDMesh.position.z = 0.5;
    app.scene.add(twoDMesh);

    //
    var twoDGeometry2 = Line(my_path2, {distances: true, closed: false, diffuse: 0x5cd7ff});
    twoDGeometry2.lineDistancesNeedUpdate = true;
    var twoDMat2 = new THREE.ShaderMaterial(TwoDLineShader({
      thickness: 2,
      side: THREE.DoubleSide,
      diffuse: 0x00ff00,

      texture1: texture,

      dashSize: 0.5,
      totalSize: 1.0
    }));
    var twoDMesh2 = new THREE.Mesh(twoDGeometry2, twoDMat2);
    // twoDMesh.position.y = 0.5;
    // twoDMesh.position.z = 0.5;
    app.scene.add(twoDMesh2);

  } );

  // // // Our glowing box
  // circlePath.pop();
  // var boxGeometry = Line(boxPath, { distances: true, closed: false, diffuse: 0x5cd7ff });
  // var boxMat = new THREE.ShaderMaterial(GradientShader({
  //   thickness: 1,
  //   side: THREE.DoubleSide
  // }));
  // var boxMesh = new THREE.Mesh(boxGeometry, mat);
  // boxMesh.position.y = 0.5;
  // boxMesh.position.z = 0.5;
  // // boxMesh.scale.multiplyScalar(0.5);
  // app.scene.add(boxMesh);

  createLoop(function (dt) {
  //   time += dt / 1000;
  //   // animate some thickness stuff
  //   mat.uniforms.thickness.value = Math.sin(time * 0.5) * 0.2;
  //
  //   // animate some dash properties
  //   dashMat.uniforms.dashDistance.value = (Math.sin(time) / 2 + 0.5) * 0.5;
  //   dashMat.uniforms.dashSteps.value = (Math.sin(Math.cos(time)) / 2 + 0.5) * 24;
  //
  //   // animate gradient
  //   // boxMat.uniforms.time.value = time;
  //
    app.updateProjectionMatrix();
    app.renderer.render(app.scene, app.camera);
  }).start();
}

function path1 () {
  var curvePath = curve([40, 40], [70, 100], [120, 20], [200, 40], 5);
  curvePath.push([200, 100]);
  curvePath.push([250, 50]);

  // a bezier curve, normalized to -1.0 to 1.0
  return normalize(curvePath);
}
