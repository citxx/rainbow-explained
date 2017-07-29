var Color = function(r, g, b, alpha) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
};

Color.prototype.toString = function() {
  return "rgba(" + (this.r * 100) + "%,"
                 + (this.g * 100) + "%,"
                 + (this.b * 100) + "%, "
                 + this.alpha + ")";
};
