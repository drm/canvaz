var G = new Vector(0, 0.8),
    CANVAS = new Vector(window.innerWidth, window.innerHeight), // gravity
    MAX = 1000,
    B = 0.8, // bounciness
    world = [];

/**
 * Utility function to iterate over an object and calling the callback
 *
 * @param {Object} w
 * @param {Function} fn
 */
function each(w, fn) {
    var i;
    for (i in w) {
        if (w.hasOwnProperty(i)) {
            fn(w[i], i);
        }
    }
}

/**
 * Vector in 2d space
 *
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Add another vector to this one.
 *
 * @param {Vector} v
 */
Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
};

/**
 * Clone the vector.
 *
 * @return {Vector}
 */
Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
};

/**
 * Represents the Zicht logo.
 *
 * @param {Vector} position
 * @param {number} radius
 * @param {Vector} direction
 * @constructor
 */
function Logo(position, radius, direction) {
    this.p = position;
    this.r = radius;
    this.mass = radius * 0.0003;
    this.forces = [direction, G.clone()];
    this.shade = 0;
    this.angle = 0;
    this.spin = 0;
}

/**
 * Draw the logo on the given canvas context
 *
 * @param {CanvasRenderingContext2D} ctx
 */
Logo.prototype.draw = function(ctx) {
    ctx.lineWidth = this.r / 5.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, ' + (1 - this.shade/128) + ')';

    ctx.save();
    ctx.translate(this.p.x, this.p.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.p.x, -this.p.y);
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
    ctx.restore();
};

/**
 * Spawn a new logo at the given coordinates.
 *
 * @param {number} x
 * @param {number} y
 */
function spawn(x, y) {
    // random angle pointing upward for happy effect.
    var a = Math.PI / 4 + (Math.PI / 2 * Math.random()), e;
    if (world.length >= MAX) {
        return;
    }

    world.push(new Logo(
        new Vector(x, y),
        10 + Math.random() * 50,
        new Vector(Math.cos(a) * 15, -Math.sin(a) * 15)
    ));
}

/**
 * Create the canvas
 *
 * @returns {HTMLCanvasElement}
 */
function init() {
    var interval = null, mx, my;

    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = CANVAS.x;
    canvas.height = CANVAS.y;

    canvas.onclick = function(e) {
        spawn(e.offsetX, e.offsetY);
    };
    canvas.onmousedown = function(e) {
        if (interval) {
            return;
        }
        interval = setInterval(function() {
            spawn(mx, my);
        }, 40);
    };
    canvas.onmouseup = function() {
        clearInterval(interval);
        interval = null;
    };
    canvas.onmousemove = function(e) {
        mx = e.offsetX;
        my = e.offsetY;
    };

    return canvas;
}

/**
 * Get the engine running
 *
 * @param {HTMLCanvasElement} canvas
 */
function run(canvas) {
    setInterval(function() {
        requestAnimationFrame(function() {
            var ctx = canvas.getContext('2d');

            var remove = [];
            each(world, function(o, i) {
                var resultant = o.forces[0];
                if (resultant.x == 0 && resultant.y == 0) {
                    o.shade += 1;
                    if (o.shade >= 127) {
                        o.shade = 0;

                        remove.unshift(i);
                    }
                } else {
                    resultant.add(o.forces[1]);
                    o.forces[1].y += o.mass;
                    o.angle += o.spin;
                    o.p.add(resultant);

                    if (o.p.y + o.r >= CANVAS.y && resultant.y > 0) {
                        resultant.y *= -B;
                        // effect
                        o.spin += resultant.x / 100;
                    }
                    if (
                        (o.p.x + o.r >= CANVAS.x && resultant.x > 0)
                        || (o.p.x - o.r <= 0 && resultant.x < 0
                    )) {
                        resultant.x *= -B;
                        // effect
                        o.spin += resultant.y / 100;
                    }
                    if (o.p.y + o.r >= CANVAS.y && Math.abs(resultant.y) <= 1) {
                        // lying on the floor now.
                        resultant.y = 0;
                        o.forces[1].y = 0;
                    }
                    // floor friction
                    if (o.forces[1].y == 0) {
                        resultant.x *= 0.95;
                        o.spin = resultant.x / 15;
                        if(Math.abs(resultant.x) < 0.1) {
                            resultant.x = 0;
                        }
                    }

                    o.forces[0] = resultant;
                }
            });

            each(remove, function(i) {
                world.splice(i, 1);
            });

            ctx.clearRect(0, 0, CANVAS.x, CANVAS.y);
            each(world, function(o) {
                o.draw(ctx);
            });
        });
    }, 20);
}
