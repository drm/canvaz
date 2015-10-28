var G = new vector(0, 0.8),
    CANVAS = new vector(window.innerWidth, window.innerHeight), // gravity
    MAX = 1000,
    B = 0.8, // bounciness
    world = [],
    canvas = document.createElement('canvas');

canvas.style.position = 'absolute';
canvas.style.left = 0;
canvas.style.top = 0;
canvas.width = CANVAS.x;
canvas.height = CANVAS.y;

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

vector.prototype.clone = function() {
    return new vector(this.x, this.y);
}

function logo(p, r, dir) {
    this.p = p;
    this.r = r;
    this.mass = r;
    this.forces = [dir, G.clone()];
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
    if (world.length >= MAX) {
        return;
    }
    world.push(new logo(
        new vector(x, y),
        10 + Math.random() * 50,
        new vector(Math.cos(a) * 10, -Math.sin(a) * 10)
    ));
}

var interval = null, mx, my;
canvas.onmousedown = function(e) {
    if (interval) {
        return;
    }
    interval = setInterval(function() {
        spawn(mx, my);
    }, 40);
}
canvas.onclick = function(e) {
    spawn(e.offsetX, e.offsetY);
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

    requestAnimationFrame(function() {
        each(world, function(o) {
            var resultant = o.forces[0];
            resultant.add(o.forces[1]);
            o.forces[1].y += o.mass * 0.0003;
            o.p.add(resultant);
            if (o.p.y + o.r >= CANVAS.y && resultant.y > 0) {
                resultant.y *= -B;
            }
            if (o.p.y + o.r >= CANVAS.y && Math.abs(resultant.y) < 1) {
                resultant.y = 0;
                o.forces[1].y = 0;
            }

            if (o.p.x + o.r >= CANVAS.x || o.p.x - o.r < 0) {
                resultant.x *= -1;
            }
            // floor friction
            if (o.forces[1].y == 0) {
                resultant.x *= 0.8;
                if(Math.abs(resultant.x) < 0.1) {
                    resultant.x = 0;
                }
            }
            
            o.forces[0] = resultant;
        });

        ctx.clearRect(0, 0, CANVAS.x, CANVAS.y);
        each(world, function(o) {
            o.draw(ctx);
        });
    });
}, 20);
