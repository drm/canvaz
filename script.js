var G = new vector(0, 0.4);

var canvas = document.createElement('canvas');

canvas.width = 500;
canvas.height = 500;

document.body.appendChild(canvas);

var ctx = canvas.getContext('2d');

function vector(x, y) {
    this.x = x;
    this.y = y;
}

vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
}

function logo(p, r, dir) {
    this.p = p;
    this.r = r;
    this.dir = dir;
}

logo.prototype.draw = function(ctx) {
    ctx.lineWidth = this.r / 5.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, this.r, 0, Math.PI * 2, true);
    ctx.moveTo(this.p.x - this.r * 0.40, this.p.y - this.r * 0.55);
    ctx.lineTo(this.p.x + this.r * 0.40, this.p.y - this.r * 0.55);
    ctx.lineTo(this.p.x - this.r * 0.40, this.p.y + this.r * 0.25);
    ctx.lineTo(this.p.x + this.r * 0.40, this.p.y + this.r * 0.25);
    ctx.moveTo(this.p.x - this.r * 0.40, this.p.y + this.r * 0.55);
    ctx.lineTo(this.p.x + this.r * 0.40, this.p.y + this.r * 0.55);
    ctx.stroke();
    ctx.closePath();
}

var world = [];

function spawn(x, y) {
  var a = Math.PI / 4 + (Math.PI / 2 * Math.random());
  return new logo(
    new vector(x, y),
    10 + Math.random() * 50,
    new vector(Math.cos(a) * 10, -Math.sin(a) * 10)
  );
}

var interval = null, mx, my;
canvas.onmousedown = function(e) {
  if (interval) {
    return;
  }
  interval = setInterval(function() {
    world.push(spawn(mx, my));
  }, 40);
}
canvas.onmousemove = function(e) {
  mx = e.offsetX;
  my = e.offsetY;
}
canvas.onmouseup = function() {
  clearInterval(interval);
  interval = null;
}

function each(w, fn) {
  var i;
  for (i in w) {
    if (w.hasOwnProperty(i)) {
      fn(w[i], i);
    }
  }
}
var B = 0.7;

setInterval(function() {
  var i = 0;

  each(world, function(o) {
    // apply resistance
    var m = Math.sqrt(o.dir.x * o.dir.x + o.dir.y * o.dir.y);

    var t = Math.atan2(o.dir.y, o.dir.x);
    o.dir.x = Math.cos(t) * m * 0.99;
    o.dir.y = Math.sin(t) * m * 0.99;
    o.p.add(o.dir);
    o.dir.add(G);

    if (o.p.y + o.r >= 499) {
      o.dir.y = -o.dir.y * B;
      if (m < 1) {
        o.dir.x = 0;
        o.dir.y = 0;
      }
    }
  });

    requestAnimationFrame(function() {
        ctx.clearRect(0, 0, 500, 500);
        each(world, function(o) {
          o.draw(ctx);
        });
    });
}, 20);
