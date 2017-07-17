var geom = geom || {};

(function(geom) {
  // Used for floating point comparisons
  geom.EPS = 1e-6;

  function isNumeric(val) {
    return Number(parseFloat(val)) == val;
  }

  geom.Vector = class Vector {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    normalized() {
      return geom.div(this, Math.sqrt(geom.dotProduct(this, this)));
    }
  };

  geom.vNeg = function(v) {
    return new geom.Vector(-v.x, -v.y);
  };

  geom.vAdd = function(v1, v2) {
    return new geom.Vector(v1.x + v2.x, v1.y + v2.y);
  };

  geom.vSub = function(v1, v2) {
    return new geom.Vector(v1.x - v2.x, v1.y - v2.y);
  };

  geom.mul = function(a, b) {
    if (isNumeric(b)) { var tmp = a; a = b; b = tmp; }
    if (isNumeric(a) && b instanceof geom.Vector) {
      return new geom.Vector(a * b.x, a * b.y);
    }
    return undefined;
  };

  geom.div = function(v, a) {
    if (isNumeric(a) && v instanceof geom.Vector) {
      return new geom.Vector(v.x / a, v.y / a);
    }
    return undefined;
  };

  geom.dotProduct = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  };

  geom.crossProduct = function(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  };

  // Straight line. Stored using normal vector and offset from the following
  // equation:
  //     (n, v) + c = 0
  geom.Line = class Line {
    constructor(n, c) {
      this.n = n;
      this.c = c;
    }

    static fromPointAndDirection(p, v) {
      var n = new geom.Vector(v.y, -v.x);
      var c = -geom.dotProduct(p, n);
      return new geom.Line(n, c);
    }

    static fromTwoPoints(p1, p2) {
      return geom.Line.fromPointAndDirection(p1, geom.vSub(p2, p1));
    }
  };

  geom.Circle = class Circle {
    constructor(center, r) {
      this.center = center;
      this.r = r;
    }
  };

  geom.projectPointToLine = function(p, line) {
    var k = -(line.c + geom.dotProduct(line.n, p));
    return geom.vAdd(p, geom.mul(k, line.n));
  };

  // Returns array of intersection points of the specified line and circle.
  geom.LineCircleIntersection = function(line, circle) {
    var p = geom.projectPointToLine(circle.center, line);
    var c_p = geom.vSub(p, circle.center);
    var c_p_2 = geom.dotProduct(c_p, c_p);
    var r_2 = circle.r * circle.r;
    if (c_p_2 > r_2 + geom.EPS) {
      return [];
    }
    if (c_p_2 > r_2 - geom.EPS) {
      return [p];
    }

    var dir = new geom.Vector(line.n.y, -line.n.x);
    var factor = Math.sqrt((r_2 - c_p_2) / geom.dotProduct(dir, dir));
    var delta = geom.mul(factor, dir);
    return [geom.vAdd(p, delta), geom.vSub(p, delta)];
  };
})(geom);
