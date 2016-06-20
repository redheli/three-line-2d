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

        texture1: {type: 't', value: opt.texture },

        dashSize: { type: 'f', value: number(opt.dashSize, 1.0) },
        totalSize: { type: 'f', value: number(opt.totalSize, 3.0) }
      },
      vertexShader: [
        'uniform float scale;',
        'attribute float lineDistance;',
        'varying float vLineDistance;',

        'uniform float thickness;',
        'attribute float lineMiter;',
        'attribute vec2 lineNormal;',
        '//attribute float lineDistance;',
        'varying float lineU;',
        'varying float vRotation;',
        'varying vec3 pos;',

        '#include <common>',
        '#include <color_pars_vertex>',
        '#include <logdepthbuf_pars_vertex>',


        'void main() {',
          '#include <color_vertex>',
          'vLineDistance =  lineDistance;',
          'pos = position;',
          'vRotation = 0.5;',
        'lineU = lineDistance;',
        'vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );',
          '#include <logdepthbuf_vertex>',

        '}'
      ].join('\n'),
      fragmentShader: [
          'uniform sampler2D texture1;',
          'uniform float opacity;',
           'uniform float dashSize;',
          'uniform float totalSize;',

          'varying float vLineDistance;',
          '#include <common>',
          '#include <color_pars_vertex>',
          '#include <logdepthbuf_pars_vertex>',

        'varying float lineU;',

        '//uniform float opacity;',
        'uniform vec3 diffuse;',
        'uniform vec3 diffuse2;',
        'uniform float dashSteps;',
        'uniform float dashSmooth;',
        'uniform float dashDistance;',
          'varying vec3 pos;',
          'varying float vRotation;',


        'void main() {',

        'float tx = mod(pos.x,1.0);',
        'float ty = mod(pos.y,1.0)*0.2;',
        'float mid = 0.5;',
        'vec2 rotated = vec2(cos(vRotation) * (tx - mid) + sin(vRotation) * (ty - mid) + mid,',
        'cos(vRotation) * (ty - mid) - sin(vRotation) * (tx - mid) + mid);',
        'vec4 rotatedTexture = texture2D( texture1,  rotated);',
        'gl_FragColor = rotatedTexture;',

        '#include <logdepthbuf_fragment>',
        '#include <color_fragment>',

        '#include <premultiplied_alpha_fragment>',
        '#include <tonemapping_fragment>',
        '#include <encodings_fragment>',
        '#include <fog_fragment>',

        '//float lineUMod = mod(lineU, 1.0/dashSteps) * dashSteps;',
        '//float dash = smoothstep(dashDistance, dashDistance+dashSmooth, length(lineUMod-0.5));',
        '//gl_FragColor = vec4(vec3(dash), opacity * dash);',
        '}'
      ].join('\n')
    }, opt);

    // remove to satisfy r73
    delete ret.thickness;
    delete ret.opacity;
    delete ret.diffuse;

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
