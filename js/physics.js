var physics = physics || {};

(function(physics) {
  physics.MIN_OPTICAL_WAVELENGTH = 400;
  physics.MAX_OPTICAL_WAVELENGTH = 750;

  physics.EMWave = class EMWave {
    constructor(wavelength, intensity_s, intensity_p) {
      this.wavelength = wavelength;
      this.intensity_s = intensity_s;
      this.intensity_p = intensity_p;
      if (typeof this.intensity_s === 'undefined') {
        this.intensity_s = 1;
      }
      if (typeof this.intensity_p === 'undefined') {
        this.intensity_s = this.intensity_p = this.intensity_s / 2;
      }

      let r, g, b;
      
      // Inaccurate approximation
      if (wavelength >= 380 && wavelength < 440) {
        r = -1 * (wavelength - 440) / (440 - 380);
        g = 0;
        b = 1;
      } else if (wavelength >= 440 && wavelength < 490) {
        r = 0;
        g = (wavelength - 440) / (490 - 440);
        b = 1;  
      } else if (wavelength >= 490 && wavelength < 510) {
        r = 0;
        g = 1;
        b = -1 * (wavelength - 510) / (510 - 490);
      } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1;
        b = 0;
      } else if (wavelength >= 580 && wavelength < 645) {
        r = 1;
        g = -1 * (wavelength - 645) / (645 - 580);
        b = 0.0;
      } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1;
        g = 0;
        b = 0;
      } else {
        r = 0;
        g = 0;
        b = 0;
      }

      // Intensty is lower at the edges of the visible spectrum.
      let intensity_factor;
      if (wavelength > 780 || wavelength < 380) {
        intensity_factor = 0;
      } else if (wavelength > 700) {
        intensity_factor = (780 - wavelength) / (780 - 700);
      } else if (wavelength < 420) {
        intensity_factor = (wavelength - 380) / (420 - 380);
      } else {
        intensity_factor = 1;
      }

      this.color = new Color(
          r, g, b, (this.intensity_s + this.intensity_p) * intensity_factor);
    }
  };

  physics.EMRay = class EMRay {
    constructor(source, direction, wave) {
      this.source = source;
      this.direction = direction;
      this.wave = wave;
    }
  };
  
  physics.RefractiveMaterial = class RefractiveMaterial {
    constructor(points) {
      this.points = [];
      for (let i = 0; i < points.length; ++i) {
        this.points.push({wavelength: points[i][0],
                          ri: points[i][1]});
      }
      this.points.sort(function(p1, p2) { return p1.wavelength - p2.wavelength; });
    }

    refractiveIndexForWavelength(wavelength) {
      let l = -1, r = this.points.length;
      while (l + 1 < r) {
        let m = l + Math.floor((r - l) / 2);
        if (this.points[m].wavelength < wavelength) {
          l = m;
        } else {
          r = m;
        }
      }
      if (r == 0) {
        return this.points[r].ri;
      }
      if (l == this.points.length - 1) {
        return this.points[l].ri;
      }
      let alpha = (wavelength - this.points[l].wavelength) /
                  (this.points[r].wavelength - this.points[l].wavelength);
      return this.points[l].ri * (1 - alpha) + this.points[r].ri * alpha;
    }
  };

  physics.material = {};
  physics.material.water = new physics.RefractiveMaterial([
      [physics.MIN_OPTICAL_WAVELENGTH, 1.3406],
      [physics.MAX_OPTICAL_WAVELENGTH, 1.3298],
  ]);

  physics.getRefractedVector = function(direction, n, ri1, ri2) {
    let cosThetaI = geom.dotProduct(n, geom.vNeg(direction));
    let sinThetaI = geom.crossProduct(geom.vNeg(direction), n);
    let sinThetaT = sinThetaI * ri1/ ri2;
    let cosThetaT = Math.sqrt(1 - sinThetaT * sinThetaT);
    return geom.vAdd(
        geom.mul(direction, ri1 / ri2),
        geom.mul(cosThetaI * ri1 / ri2 - cosThetaT, n)).normalized();
  };

  physics.fresnel = function(direction, n, r1, r2) {
    let cosThetaI = geom.dotProduct(n, geom.vNeg(direction));
    let sinThetaI = geom.crossProduct(geom.vNeg(direction), n);
    let sinThetaT = sinThetaI * ri1/ ri2;
    let cosThetaT = Math.sqrt(1 - sinThetaT * sinThetaT);

    let reflectedDir =
      geom.vSub(direction, geom.mul(2 * geom.dotProduct(direction, n), n));
    let refractedDir = geom.vAdd(
        geom.mul(direction, ri1 / ri2),
        geom.mul(cosThetaI * ri1 / ri2 - cosThetaT, n)).normalized();

    let reflS = (cosThetaI - ri * cosThetaT) / (cosThetaI + ri * cosThetaT);
    reflS *= reflS;
    let reflP = (cosThetaT - ri * cosThetaI) / (cosThetaT + ri * cosThetaI);
    reflP *= reflP;

    // Направление, новая интенсивность (wave)
  };
})(physics);
