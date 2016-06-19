var inherits = require('inherits');
var getNormals = require('polyline-normals');
var VERTS_PER_POINT = 2;

module.exports = function createLineMesh (THREE) {
  function LineMesh (path, opt) {
    if (!(this instanceof LineMesh)) {
      return new LineMesh(path, opt);
    }
    THREE.BufferGeometry.call(this);

    if (Array.isArray(path)) {
      opt = opt || {};
    } else if (typeof path === 'object') {
      opt = path;
      path = [];
    }

    opt = opt || {};

    this.addAttribute('position', new THREE.BufferAttribute(null, 3));
    this.addAttribute('lineNormal', new THREE.BufferAttribute(null, 2));
    this.addAttribute('lineMiter', new THREE.BufferAttribute(null, 1));
    if (opt.distances) {
      this.addAttribute('lineDistance', new THREE.BufferAttribute(null, 1));
    }
    if (typeof this.setIndex === 'function') {
      this.setIndex(new THREE.BufferAttribute(null, 1));
    } else {
      this.addAttribute('index', new THREE.BufferAttribute(null, 1));
    }
    this.update(path, opt.closed);
  }

  inherits(LineMesh, THREE.BufferGeometry);

  LineMesh.prototype.update = function (path, closed) {
    path = path || [];
    var normals = getNormals(path, closed);

    if (closed) {
      path = path.slice();
      path.push(path[0]);
      normals.push(normals[0]);
    }

    var attrPosition = this.getAttribute('position');
    var attrNormal = this.getAttribute('lineNormal');
    var attrMiter = this.getAttribute('lineMiter');
    var attrDistance = this.getAttribute('lineDistance');
    var attrIndex = typeof this.getIndex === 'function' ? this.getIndex() : this.getAttribute('index');

    if (!attrPosition.array ||
        (path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT)) {
      var count = path.length * VERTS_PER_POINT;
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      attrIndex.array = new Uint16Array(Math.max(0, (path.length - 1) * 6));

      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    attrPosition.needsUpdate = true;
    attrNormal.needsUpdate = true;
    attrMiter.needsUpdate = true;
    if (attrDistance) {
      attrDistance.needsUpdate = true;
    }

    var index = 0;
    var c = 0;
    var dIndex = 0;
    var indexArray = attrIndex.array;
    var d = 0;
    var d_up = 0.0 ;
    var d_down = 0.0;
    var nnn = normals;
    var mmm = [ [1,2],[2,3] ];
    path.forEach(function (normals,point, pointIndex,list) {
      var i = index;
      indexArray[c++] = i + 0;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 3;

      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);

      if (attrDistance) {
        // var d = pointIndex / (list.length - 1);
        // attrDistance.setX(dIndex++, d);
        // attrDistance.setX(dIndex++, d);
        var rd;
        if ( pointIndex > 0 ) {
          var v1 = new THREE.Vector2(path[pointIndex][0],path[pointIndex][1]);
          var v2 = new THREE.Vector2(path[pointIndex-1][0],path[pointIndex-1][1]);
          d += v1.distanceTo( v2 );
          var rd = v1.distanceTo( v2 );

          var miter = normals[pointIndex][1];
          var width = 1.0;
          var x = normals[pointIndex][0][0];
          var y = normals[pointIndex][0][1];
          var gg = Math.sqrt(x*x+y*y);
          gg = gg* width/2.0 * miter;

          // x = x+ x * width/2.0 * miter;
          // y = y+ y * width/2.0 * miter;
          var m_w = gg*gg-(width/2.0)*(width/2.0);
          var dd = Math.sqrt(m_w);
          d_up += rd-dd;
          d_down += rd+dd;

        }



        // d = 0.6;

        attrDistance.setX(dIndex++, d_up);
        attrDistance.setX(dIndex++, d_down);
      }
    }.bind(null,normals) );

    var nIndex = 0;
    var mIndex = 0;
    normals.forEach(function (n) {
      var norm = n[0];
      var miter = n[1];
      attrNormal.setXY(nIndex++, norm[0], norm[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  };

  return LineMesh;
};
