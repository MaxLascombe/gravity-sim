var FPS = 300;
var G = 50; // universal gravitional constant
var collapseOnCollision = true;

class Obj {

  constructor (newID, newX, newY, newM = 10, newVx = 0, newVy = 0) {
    this.id = "#" + newID;
    this.x = newX;
    this.y = newY;
    this.m = newM;
    this.vx = newVx;
    this.vy = newVy;
    this.ax = 0;
    this.ay = 0;

    var newEl = "<div id='" + newID + "' class='obj'></div>";
    $("body").append(newEl);
  }

  width () { return Math.sqrt(this.m); }
  g (other_m, r) { return G * this.m * other_m / (r*r); }
  r (obj) { return Math.sqrt( Math.pow(this.x-obj.x, 2) + Math.pow(this.y-obj.y, 2) ); }

  updateXY () {
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    var rad = this.width()/2;
    $(this.id).css({
      "top": this.y - rad + "px",
      "left": this.x - rad + "px",
      "width": 2*rad + "px",
      "height": 2*rad + "px",
      "background-color": this.color()
    });
  }

  color () {
    var speed = Math.sqrt( this.vx*this.vx + this.vy*this.vy );
    var atan = Math.atan( speed / 3 );
    var gb = 255 * (1 - atan / (Math.PI / 2));
    return "rgb(255,"+gb+","+gb+")";
  }

  updateA (otherObjs) {

    // calculate force
    var Fx = 0;
    var Fy = 0;
    for (var i = 0; i < otherObjs.length; i++) {
      var obj = otherObjs[i]
      if (obj !== this) {
        var F = this.g(obj.m, this.r(obj)) / FPS;
        if (this.x == obj.x) {
          Fy = F;
          Fx = F;
        } else {
          var grad = (this.y - obj.y) / (this.x - obj.x);
          var curFx = Math.sqrt(F*F/(grad*grad + 1));
          Fx += ((obj.x > this.x) ? 1 : -1) * curFx;
          Fy += ((obj.y > this.y) ? 1 : -1) * Math.sqrt(F*F - curFx*curFx);
        }
      }
    }

    // calculate new velocity
    this.ax = Fx / this.m;
    this.ay = Fy / this.m;
  }

  collidesWith (obj) {
    var nextX = this.x + this.vx + this.ax;
    var nextY = this.y + this.vy + this.ay;
    var oNextX = obj.x + obj.vx + obj.ax;
    var oNextY = obj.y + obj.vy + obj.ay;
    return Math.sqrt( Math.pow(nextX-oNextX, 2) + Math.pow(nextY-oNextY, 2) ) < this.width()/2+obj.width()/2;
  }

  absorb (obj) {
    this.x = (this.m > obj.m) ? this.x : obj.x;
    this.y = (this.m > obj.m) ? this.y : obj.y;
    this.vx = (this.vx * this.m + obj.vx * obj.m) / (this.m + obj.m);
    this.vy = (this.vy * this.m + obj.vy * obj.m) / (this.m + obj.m);
    this.m += obj.m;
  }

}

var objs = [];

function updateUniverse () {

  // update velocities
  for (var i = 0; i < objs.length; i++) {
    objs[i].updateA(objs);
  }

  // check for collisions
  for (var i = 0; i < objs.length; i++) {
    for (var j = objs.length-1; j > i; j--) {
      var oi = objs[i];
      var oj = objs[j];
      if (oi.collidesWith(oj)) {
        if (collapseOnCollision) {
          oi.absorb(oj);
          $(oj.id).remove();
          objs.splice(j,1);
        } else {
          oi.ax = 0;
          oi.ay = 0;
          oj.ax = 0;
          oj.ay = 0;
          oi.vx = -oi.vx;
          oi.vy = -oi.vy;
          oj.vx = -oj.vx;
          oj.vy = -oj.vy;
        }
      }
    }
  }

  // and displacements
  for (var i = 0; i < objs.length; i++) {
    objs[i].updateXY(objs);
  }

  /*
  For collisions, need to detect before they touch, so that velocity
  isn't affected and it works with low FPS
  */
}

$(document).click(function(e) {
  objs.push(new Obj("obj"+objs.length, e.pageX, e.pageY));
})

$(document).ready(function() {
  for (var i = 0; i < 50; i++) {
    var max_v = 0.5;
    objs.push(new Obj("obj"+objs.length, Math.random()*window.innerWidth, Math.random()*window.innerHeight, Math.random()*200, Math.random()*max_v-max_v/2, Math.random()*max_v-max_v/2));
  }
  setInterval(function () {updateUniverse();}, 1000/FPS);
})

$(document).keypress(function(e) {
  if (e.which == 104)
    for (var i = 0; i < objs.length; i++)
      objs[i].x += 100;
  else if (e.which == 106)
    for (var i = 0; i < objs.length; i++)
      objs[i].y -= 100;
  else if (e.which == 107)
    for (var i = 0; i < objs.length; i++)
      objs[i].y += 100;
  else if (e.which == 108)
    for (var i = 0; i < objs.length; i++)
      objs[i].x -= 100;
});
