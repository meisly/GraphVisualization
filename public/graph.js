let qtree;
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(20);

    axios.get('./data/kargerMinCut.txt').then(res => {
        let data = res.data;
        if (!data) return [];
        else {
            let roughAr = data.split("\r\n")
                .map(elem => elem.split("\t")
                    .filter(ele => ele != "")
                    .map(el => el.trim()))
                .filter(el => el.length > 1);

            for (let i = 0; i < roughAr.length; i++) {
                particles[roughAr[i][0]] = new Particle(roughAr[i][0], roughAr[i].slice(1));
            }
        }
    })

    // getData().then(data =>{
    //     console.log("getting data")
    //     for(let i = 0;i<data.length;i++){
    //         particles.push(new Particle(data[i][0], data[i].slice(1)));
    //       }
    // });

}

// an object to add multiple particles
let particles = {};
let stopper = 10000;
let check = null;

function draw() {
    background('#0f0f0f');
    rectMode(CENTER);
    let boundary = new Rectangle(width, height, width, height);
    qtree = new QuadTree(boundary, 4);
    for (let i in particles) {
        let p = particles[i];
        p.drawParticle();
        qtree.insert(p);
        p.joinParticles(p.connections);

    }
    qtree.show();

    for (let i in particles) {
        if (stopper > 0) {
            let p = particles[i];
            p.repelParticles(width, height);

            for (const connects of p.connections.slice(0, 5)) {
                p.attractParticle(particles[connects]);
            }
            if (p.label == check) {
                console.log(p)
            }
            p.moveParticle(width, height);
            stopper--;

        }

    }


}
// this class describes the properties of a single particle.
class Particle {
    // setting the co-ordinates, radius and the
    // speed of a particle in both the co-ordinates axes.
    constructor(label, connections) {
        this.x = random(0, width);
        this.y = random(0, height);
        this.r = 8;
        this.label = `${label}`;
        this.connections = connections;
        this.xForce = 0;
        this.yForce = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
    }

    // creation of a particle.
    drawParticle() {
        noStroke();
        fill('rgba(200,169,169,0.5)');
        circle(this.x, this.y, this.r);
        textSize(8);
        textAlign(CENTER, CENTER);
        fill('rgba(200,169,169,0.5)');
        text(this.label, this.x, this.y + 10);
    }

    attractParticle(p2) {
        let k = 2;

        let stretch = dist(this.x, this.y, p2.x, p2.y);
        let deltaX = this.x - p2.x;
        let deltaY = this.y - p2.y;
        let angle = atan(deltaY / deltaX);
        let force = k ** 2 / stretch;

        deltaY > 0 ? (this.yForce += force * sin(angle)) : (this.yForce -= (force * sin(angle)));
        deltaX > 0 ? (this.xForce += force * cos(angle)) : (this.xForce -= force * cos(angle));

    }
    repelParticles(width, height) {
        let k = 20;
        let range = new Rectangle(this.x, this.y, 200, 200);
        let nearPoints = qtree.query(range);

        for (let i = 0; i < nearPoints.length; i++) {
            let p2 = nearPoints[i];
            if (this.label == p2.label) {
                return
            }
            let stretch = dist(this.x, this.y, p2.x, p2.y);
            let deltaX = this.x - p2.x;
            let deltaY = this.y - p2.y;
            let angle = atan(deltaY / deltaX);
            let force = (stretch) / k;

            deltaY > 0 ? (this.yForce += force * sin(angle)) : (this.yForce -= (force * sin(angle)));
            deltaX > 0 ? (this.xForce += force * cos(angle)) : (this.xForce -= force * cos(angle));

        }

        // let horizBounderyForce = k/(this.x - 0) + k/(this.x - width);
        // this.xForce += horizBounderyForce;
        // let vertBoundaryForce = k/(this.y - 0) + k/(this.y - height);
        // this.yForce += vertBoundaryForce;

    }

    moveParticle(height, width) {
        if (this.label == check) {
            console.log(`deltaX ${this.xForce} deltaY ${this.yForce}`)
        }
        if (this.x < 0) {
            this.xForce *= -1 * (this.x);
        } else if (this.x > width) {
            this.xForce *= -1 * (this.x / width);
        } else if (this.x < 100) {
            this.xForce += this.xForce / this.x;
        } else if (width - this.x < 50) {
            this.xForce -= this.xForce / (width - this.x);
        }
        if (this.y < 0) {
            this.yForce *= -1 * this.y;
        } else if (this.y > height) {
            this.yForce *= -1 * (this.y / height);
        } else if (this.y - 100 < 0) {
            this.yForce -= this.yForce / this.y;
        } else if (height - this.y < 100) {
            this.yForce -= this.yForce / (height - this.y);
        }

        this.x += this.xForce;
        this.y += this.yForce;
        if (this.label == check) {
            console.log(`deltaX ${this.xForce} deltaY ${this.yForce}`)
        }

        this.xForce = 0;
        this.yForce = 0;

    }
    // this function creates the connections(lines)
    // between particles which are less than a certain distance apart
    joinParticles(connection) {
        connection.forEach(connect => {
            if (this.label == check) {
                stroke('rgba(0,255,0,1)');
                line(this.x, this.y, particles[connect].x, particles[connect].y);
            }
            stroke('rgba(255,255,255,0.01)');
            line(this.x, this.y, particles[connect].x, particles[connect].y);

        })
    }
}



