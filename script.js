var G = new vector(0, 0.4); // gravity
var B = 0.7; // bounciness

var world = [];
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
    ctx.moveTo(this.p.x - this.r * 0.30, this.p.y - this.r * 0.55);
    ctx.lineTo(this.p.x + this.r * 0.30, this.p.y - this.r * 0.55);
    ctx.lineTo(this.p.x - this.r * 0.30, this.p.y + this.r * 0.25);
    ctx.lineTo(this.p.x + this.r * 0.30, this.p.y + this.r * 0.25);
    ctx.moveTo(this.p.x - this.r * 0.30, this.p.y + this.r * 0.55);
    ctx.lineTo(this.p.x + this.r * 0.30, this.p.y + this.r * 0.55);
    ctx.stroke();
    ctx.closePath();
}

function spawn(x, y) {
    var a = Math.PI / 4 + (Math.PI / 2 * Math.random());
    return new logo(
        new vector(x, y),
        10 + Math.random() * 50,
        new vector(Math.cos(a) * 5, -Math.sin(a) * 5)
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
canvas.onclick = function(e) {
    world.push(spawn(e.offsetX, e.offsetY));
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

setInterval(function() {
    var i = 0;

    each(world, function(o) {
        // apply resistance
        var m = Math.sqrt(o.dir.x * o.dir.x + o.dir.y * o.dir.y);

        var t = Math.atan2(o.dir.y, o.dir.x);
        o.dir.x = Math.cos(t) * m * 0.98;
        o.dir.y = Math.sin(t) * m * 0.99;

        if (o.p.y + o.r >= 499) {
            o.dir.y = o.dir.y * -B;
            if (0 < o.dir.y && o.dir.y < 1) {
                o.dir.y = 0;
            }
        }
        o.p.add(o.dir);
        o.dir.add(G);
    });

    requestAnimationFrame(function() {
        ctx.clearRect(0, 0, 500, 500);
        each(world, function(o) {
            o.draw(ctx);
        });
    });
}, 20);
