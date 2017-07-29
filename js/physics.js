var physics = physics || {};

(function(physics) {
  physics.Wave = class Wave {
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

  var WAVELENGTH_MIN = 400;
  var WAVELENGTH_MAX = 750;
  physics.material = {};
  physics.material.water = new physics.RefractiveMaterial([
      [WAVELENGTH_MIN, 1.3406],
      [WAVELENGTH_MAX, 1.3298],
  ]);
})(physics);
