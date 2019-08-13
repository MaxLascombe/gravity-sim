var FPS = 30;
var G = 50; // universal gravitional constant

class Obj {

  constructor (newID, newX, newY, newM = 10, newVx = 0, newVy = 0) {
    this.id = "#" + newID;
    this.x = newX;
    this.y = newY;
    this.m = newM;
    this.vx = newVx;
    this.vy = newVy;

    var newEl = "<div id='" + newID + "' class='obj'></div>";
    $("body").append(newEl);
  }

  width () {
    return Math.sqrt(this.m);
  }

  updateXY () {
    this.x += this.vx;
    this.y += this.vy;
    var rad = this.width()/2;
    $(this.id).css({
      "top": this.y - rad + "px",
      "left": this.x - rad + "px",
      "width": 2*rad + "px",
      "height": 2*rad + "px"
    });
  }

  // PROBLEM IN THIS FUNCTION
  updateV (otherObjs) {

    // if (!isNaN(this.x)) {
    //   console.log("called" + this.id)
    //   console.log(this.x);
    //   console.log(this.y);
    //   console.log(this.m);
    //   console.log(this.vx);
    //   console.log(this.vy);
    // }

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
    this.vx += Fx / this.m;
    this.vy += Fy / this.m;
  }

  g (other_m, r) {
    return G * this.m * other_m / (r*r);
  }

  r (obj) {
    return Math.sqrt( Math.pow(this.x-obj.x, 2) + Math.pow(this.y-obj.y, 2) );
  }

  collidesWith (obj) {
    return this.r(obj) < this.width()/2+obj.width()/2;
  }

  absorb (obj) {
    this.x = (this.x + obj.x) / 2;
    this.y = (this.y + obj.y) / 2;
    this.vx = (this.vx * this.m + obj.vx * obj.m) / (this.m + obj.m);
    this.vy = (this.vy * this.m + obj.vy * obj.m) / (this.m + obj.m);
    this.m += obj.m;
  }

}

var objs = [];

$(document).click(function(e) {
  objs.push(new Obj("obj"+objs.length, e.pageX, e.pageY));
})

$(document).ready(function() {
  for (var i = 0; i < 100; i++) {
    objs.push(new Obj("obj"+objs.length, Math.random()*window.innerWidth, Math.random()*window.innerHeight, Math.random()*50, Math.random()*0.4-0.2, Math.random()*0.4-0.2));
  }
  setInterval(function () {updateUniverse();}, 1000/FPS);
})

function updateUniverse () {

  // check for collisions
  for (var i = 0; i < objs.length; i++) {
    for (var j = objs.length-1; j > i; j--) {
      var oi = objs[i];
      var oj = objs[j];
      if (oi.collidesWith(oj)) {
        oi.absorb(oj);
        $(oj.id).remove();
        objs.splice(j,1);
      }
    }
  }

  // update velocities
  for (var i = 0; i < objs.length; i++) {
    objs[i].updateV(objs);
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
