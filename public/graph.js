let qtree;
let k;

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
//     axios.get('./data/tinyG.txt').then(res => {
//         let data = res.data;
//         let graphDic = {};
//         if (!data) return [];
//         else {
//             let roughAr = data.split("\n")
//                 .map(elem => elem.split(" ")
//                     .filter(ele => ele != "")
//                     .map(el => el.trim()))
//                 .filter(el => el.length > 1);

//             for (let i = 0; i < roughAr.length; i++){
//                 let key = roughAr[i][0];
//                 let value = roughAr[i][1];
//                 if (!graphDic[key]) {
//                     graphDic[key] = [value];
//                 } else {
//                     graphDic[key].push(value);
//                 }
//                 if(!graphDic[value]){
//                     graphDic[value] = [key];
//                 }
//             }
//             for (let key in graphDic) {
//                 particles[key] = new Particle(key, graphDic[key]);
//             }
//         }
//     })
    k = 2*sqrt((width*height)/200);
}

// an object to add multiple particles
let particles = {};
let check = 50;
let stopper = 100000;

function draw() {
    background('#0f0f0f');
    rectMode(CENTER);
    let boundary = new Rectangle(width/2, height/2, width/2, height/2);
    
    qtree = new QuadTree(boundary, 4);
    for (let i in particles) {
        let p = particles[i];
        p.drawParticle();
        qtree.insert(p);
        p.joinParticles(p.connections);

    }
    qtree.show();

    for (let i in particles) {
        if (stopper> 0) {
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
 

        let stretch = dist(this.x, this.y, p2.x, p2.y);
        let deltaX = this.x - p2.x;
        let deltaY = this.y - p2.y;
        let angle = atan(deltaY / deltaX);
        let force = (stretch**2) / k;
        if (!force){
            return
        }
        deltaY > 0 ? (this.yForce += force * sin(angle)) : (this.yForce -= (force * sin(angle)));
        deltaX > 0 ? (this.xForce -= force * cos(angle)) : (this.xForce += force * cos(angle));

    }
    repelParticles() {

        let range = new Rectangle(this.x, this.y, 100, 100);
        let nearPoints = qtree.query(range);

        for (let i = 0; i < nearPoints.length; i++) {
            let p2 = nearPoints[i];
            if (this.label == p2.label) {
                continue;
            }
            let stretch = dist(this.x, this.y, p2.x, p2.y);
            let deltaX = this.x - p2.x;
            let deltaY = this.y - p2.y;
            let angle = atan(deltaY / deltaX);
            let force = ((k ** 2) / stretch);
            if (!force){
                continue;
            }
            deltaY > 0 ? (this.yForce -= force * sin(angle)) : (this.yForce += (force * sin(angle)));
            deltaX > 0 ? (this.xForce += force * cos(angle)) : (this.xForce -= force * cos(angle));



        }


    }

    moveParticle(width, height) {
        if (!this.xForce || !this.yForce) {
            this.xForce = 0;
            this.yForce = 0;
            return;
        }
        this.x += Math.min(Math.max(0.1*this.xForce, -width/10), width/10);
        this.y += Math.min(Math.max(0.1*this.yForce, -height/10), height/10);
        // this.x += 0.1*this.xForce;
        // this.y += 0.1*this.yForce;
        this.x = Math.min(width -10, Math.max(10, this.x));
        this.y = Math.min(height -10, Math.max(10, this.y));


        this.xForce = 0;
        this.yForce = 0;

    }
    // this function creates the connections(lines)
    // between particles which are less than a certain distance apart
    joinParticles(connection) {
        connection.forEach(connect => {
            // if (dist(this.x, this.y, particles[connect].x, particles[connect].y) > 200) {
            //     stroke('rgba(0,255,0,1)');
            //     line(this.x, this.y, particles[connect].x, particles[connect].y);
            // }
            stroke('rgba(255,255,255,0.05)');
            line(this.x, this.y, particles[connect].x, particles[connect].y);

        })
    }
}



