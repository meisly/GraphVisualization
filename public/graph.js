

function setup() {
    createCanvas(.9 * windowWidth, .9 * windowHeight);
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

function draw() {
    background('#0f0f0f');
    for (const i in particles) {
        particles[i].createParticle();
        
        for( const connects of particles[i].connections.slice(0,5)){
            particles[i].attractParticle(particles[connects])
        }
        particles[i].joinParticles(particles[i].connections);
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
    createParticle() {
        noStroke();
        fill('rgba(200,169,169,0.5)');
        circle(this.x, this.y, this.r);
        textSize(8);
        textAlign(CENTER, CENTER);
        fill('rgba(200,169,169,0.5)');
        text(this.label, this.x, this.y + 10);
    }

    // setting the particle in motion.
    attractParticle(p2) {
        let k = 10;
        let stretch = dist(this.x, this.y, p2.x, p2.y);
        let deltaX = this.x - p2.x;
        let deltaY = this.y - p2.y;
        let angle = atan(deltaY/deltaX);
        let force = k**2/stretch;
        this.yForce = force * sin(angle);
        this.xForce = force * cos(angle);
        
        console.log(`force ${force} angle ${angle}`)

        this.x += this.xForce;
        this.y += this.yForce;
    }
    repelParticles(p2) {
        let k = 1;
        let stretch = dist(this.x, this.y, p2.x, p2.y);
        let deltaX = this.x - p2.x;
        let deltaY = this.y - p2.y;
        let angle = atan(deltaY/deltaX);
        let force = stretch**2 / k;
        this.yForce = force * sin(angle);
        this.xForce = force * cos(angle);

        
        this.x += this.xForce;
        this.y += this.yForce;
    }

    // this function creates the connections(lines)
    // between particles which are less than a certain distance apart
    joinParticles(connection) {
        connection.forEach(connect => {
            stroke('rgba(255,255,255,0.01)');
            line(this.x, this.y, particles[connect].x, particles[connect].y);
        
        })
    }
}



