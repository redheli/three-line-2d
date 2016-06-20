var number = require('as-number');
var assign = require('object-assign');

module.exports = function (THREE) {
  return function (opt) {
    opt = opt || {};

    var ret = assign({
      transparent: true,
      uniforms: {
        thickness: { type: 'f', value: number(opt.thickness, 1) },
        opacity: { type: 'f', value: number(opt.opacity, 1.0) },
        diffuse: { type: 'c', value: new THREE.Color(opt.diffuse) },
        dashSteps: { type: 'f', value: 12 },
        dashDistance: { type: 'f', value: 0.2 },
        dashSmooth: { type: 'f', value: 0.01 },

        texture1: {type: 't', value: opt.texture1 },

        dashSize: { type: 'f', value: number(opt.dashSize, 1.0) },
        totalSize: { type: 'f', value: number(opt.totalSize, 3.0) }
      },
      vertexShader: [
        'uniform float scale;',
        'attribute float lineDistance;',

        'uniform float thickness;',
        'attribute float lineMiter;',
        'attribute vec2 lineNormal;',
        'attribute float rn;',
        'attribute float rp;',

        'varying vec3 pos;',
        'varying vec2 vUv;',
        'varying float vlineMiter;',
        'varying float vThickness;',
        'varying float vRotation;',



        'void main() {',


          'vUv = uv;',
          'vlineMiter = lineMiter;',
          'vThickness = thickness;',
          'float rota_angle = 0.0;',
        'if(abs(lineMiter) != thickness) {',
        'rota_angle = rn;',
        '}',
        'else{',
        '  rota_angle = rp;',
        '}',

          'vRotation = rota_angle;//45.0/57.3;',

          '//if(rota_angle != 0.0){',
              '//vRotation = 45.0/57.3;',
          '//}',

        'vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);',

        'pos = pointPos;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );',

        '}'
      ].join('\n'),
      fragmentShader: [
          'uniform sampler2D texture1;',
          'varying vec3 pos;',
        'varying vec2 vUv;',
        'varying float vlineMiter;',
        'varying float vThickness;',
        'varying float vRotation;',


        'void main() {',

        'float tx = pos.x;',
        'float ty = pos.y;',

        'float mid = 0.5;',
        'vec2 rotated = vec2(cos(vRotation) * (tx - mid) + sin(vRotation) * (ty - mid) + mid,',
        'cos(vRotation) * (ty - mid) - sin(vRotation) * (tx - mid) + mid);',

        ' tx = mod(rotated.x,1.0);',
          'float m = vlineMiter + vThickness/2.0;',
        ' ty = abs(m/vThickness);  ',


          'if(tx>1.0 || tx<0.0) discard;',
        'if(ty>1.0 || ty<0.0) discard;',
        'vec4 rotatedTexture = texture2D( texture1,  vec2(tx,ty));',
        'gl_FragColor = rotatedTexture;',

        '//gl_FragColor = texture2D(texture1, vec2(tx,ty) );',

        "//vec2 p = vUv;",
        "//if (p.x > 0.4){",
        '//gl_FragColor = vec4(0.5, 0.2, 1.0, 1.0);',
          '//} else {',
        '//gl_FragColor = vec4(0.9, 0.2, 0.0, 1.0);',
          '//}',


        '//gl_FragColor = texture2D(texture1, vUv );',


        '//gl_FragColor = vec4(0.5, 0.2, 1.0, 1.0);',

        '}'
      ].join('\n')
    }, opt);

    // remove to satisfy r73
    delete ret.thickness;
    delete ret.opacity;
    delete ret.diffuse;
    delete ret.texture1;
    delete ret.dashSize;
    delete ret.totalSize;

    var threeVers = (parseInt(THREE.REVISION, 10) || 0) | 0;
    if (threeVers < 72) {
      // Old versions need to specify shader attributes
      ret.attributes = {
        lineMiter: { type: 'f', value: 0 },
        //lineDistance: { type: 'f', value: 0 },
        lineNormal: { type: 'v2', value: new THREE.Vector2() }
      };
    }

    return ret;
  };
};
