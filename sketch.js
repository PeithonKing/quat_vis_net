let qin = 1; // Default number of neurons
let qout = 1;
let rin = 4;
let rout = 4;

let scale = 1.7;

let all_nodes = [];
let all_edges = [];

WHITE = [255, 255, 255]
BLACK = [  0,   0,   0]
RED =   [255,   0,   0]
GREEN = [  0, 255,   0]
BLUE =  [  0,   0, 255]

Cr = "#d94179"  // 233, 30, 99
Ci = "#459be6"  // 66, 165, 245
Cj = "#ff774d"  // 255, 138, 101
Ck = "#3dccb4"  // 76, 175, 80

Cr_light = "#F48FB1"  // 244, 143, 177
Ci_light = "#90CAF9"  // 144, 202, 249
Cj_light = "#FFAB91"  // 255, 171, 145
Ck_light = "#81C784"  // 129, 200, 132

// RED = [255, 0, 0]
// RED = [255, 0, 0]
// RED = [255, 0, 0]
// RED = [255, 0, 0]

console.log("sketch.js is loaded");

class Node {
    constructor(x, y, corr = null, color = RED, size = 25*scale) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.draw();
        this.corr = corr;

        // it is expected that the ith edge will lead to the ith neighbour
        // the neighbours can be both in the fwd direction and the bwd direction
        this.neighbours = [];
        this.edges = [];
    }

    draw() {
        fill(this.color);
        stroke(0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    hit(point) {
        let hitornot =  (point.x - this.x)**2 + (point.y - this.y)**2 < (this.size/2)**2;
        // if (hitornot) {
        //     console.log("hit");
        // }
        return hitornot;
    }

    highlight(recurse = true) {
        fill(GREEN);
        stroke(0);
        ellipse(this.x, this.y, this.size, this.size);
        if (recurse) {
            this.edges.forEach(edge => {
                edge.highlight(recurse = false);
            });
            if (this.corr) {
                this.corr.forEach(element => {
                    element.highlight();
                });
            }
        }
    }
}

class Edge {
    constructor(node1, node2, width=1, color=BLACK, highlight_color=BLUE, weight_coordinate=[0, 0]) {
        this.node1 = node1;
        this.node2 = node2;
        this.width = width;
        this.color = color;
        this.highlight_color = highlight_color;

        // Calculate vertices
        this.calculateVertices();
        this.draw();
    }

    highlight(recurse = true) {
        // console.log("highlighting edge");
        fill(this.highlight_color);
        stroke(this.highlight_color);
        quad(this.v1.x, this.v1.y, this.v2.x, this.v2.y, this.v3.x, this.v3.y, this.v4.x, this.v4.y);
        if (recurse) {
            this.node1.highlight(false);
            this.node2.highlight(false);
        }
    }

    draw() {
        fill(this.color);
        stroke(this.color);
        quad(this.v1.x, this.v1.y, this.v2.x, this.v2.y, this.v3.x, this.v3.y, this.v4.x, this.v4.y);
    }

    calculateVertices() {
        // Calculate slope

        // Calculate tan(theta), sin(theta), and cos(theta)
        var tan_theta = -(this.node2.y - this.node1.y) / (this.node2.x - this.node1.x);
        var sin_theta = tan_theta / Math.sqrt(1 + tan_theta**2);
        var cos_theta = 1 / Math.sqrt(1 + tan_theta**2);

        // console.log(tan_theta, sin_theta, cos_theta);
        // Calculate the coordinates of the vertices
        this.v1 = { x: this.node1.x - this.width/2 * sin_theta, y: this.node1.y - this.width/2 * cos_theta };
        this.v2 = { x: this.node1.x + this.width/2 * sin_theta, y: this.node1.y + this.width/2 * cos_theta };
        this.v3 = { x: this.node2.x + this.width/2 * sin_theta, y: this.node2.y + this.width/2 * cos_theta };
        this.v4 = { x: this.node2.x - this.width/2 * sin_theta, y: this.node2.y - this.width/2 * cos_theta };

        this.hit_v1 = { x: this.node1.x - this.width * sin_theta, y: this.node1.y - this.width * cos_theta };
        this.hit_v2 = { x: this.node1.x + this.width * sin_theta, y: this.node1.y + this.width * cos_theta };
        this.hit_v3 = { x: this.node2.x + this.width * sin_theta, y: this.node2.y + this.width * cos_theta };
        this.hit_v4 = { x: this.node2.x - this.width * sin_theta, y: this.node2.y - this.width * cos_theta };

    }

    hit(point) {
        // Check if the point lies inside the rectangle
        var v1v2 = (point.x - this.v1.x) * (this.v2.y - this.v1.y) - (point.y - this.v1.y) * (this.v2.x - this.v1.x);
        var v2v3 = (point.x - this.v2.x) * (this.v3.y - this.v2.y) - (point.y - this.v2.y) * (this.v3.x - this.v2.x);
        var v3v4 = (point.x - this.v3.x) * (this.v4.y - this.v3.y) - (point.y - this.v3.y) * (this.v4.x - this.v3.x);
        var v4v1 = (point.x - this.v4.x) * (this.v1.y - this.v4.y) - (point.y - this.v4.y) * (this.v1.x - this.v4.x);

        return (v1v2 < 0 && v2v3 < 0 && v3v4 < 0 && v4v1 < 0) || (v1v2 > 0 && v2v3 > 0 && v3v4 > 0 && v4v1 > 0);
    }
}

// class RealNetwork{
//     constructor(inF, outF, center, x_spacing, y_spacing, size = 50) {
//         this.in = inF;
//         this.out = outF;
//         this.center = center;
//         make_network();
//     }

//     make_network() {
//         shift_x, shift_y = self.center;


//     }
// }

class Matrix{
    constructor(width, height, origin, size, color = RED, highlight_color = BLUE) {
        this.width = width;
        this.height = height;
        this.origin = origin;
        this.size = size;
        this.color = color;
        this.highlight_color = highlight_color;
        this.draw(color);
        // console.log("width = ", this.width, "height = ", this.height, "origin = ", this.origin, "size = ", this.size, "color = ", this.color);
    }

    highlight() {
        this.draw(this.highlight_color);
    }

    draw(color) {
        // console.log("drawing matrix");
        fill(color);
        stroke(0);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                square(this.origin[0] + i * this.size, this.origin[1] + j * this.size, this.size);
            }
        }
    }

}

class QuatMatrix{
    constructor(width, height, origin, size, color = RED, highlight_color = BLUE) {
        this.width = width;
        this.height = height;
        this.origin = origin;
        this.size = size;
        this.color = color;
        this.highlight_color = highlight_color;
        this.draw(color);
        // console.log("width = ", this.width, "height = ", this.height, "origin = ", this.origin, "size = ", this.size, "color = ", this.color);
    }

    highlight() {
        this.draw(this.highlight_color);
    }

    draw(color) {
        // console.log("drawing matrix");
        fill(color);
        stroke(0);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                square(this.origin[0] + i * this.size, this.origin[1] + j * this.size, this.size);
            }
        }
    }

}

class RealMatrix{
    constructor(width, height, origin, size, color = RED, highlight_color = BLUE) {
        this.width = width;
        this.height = height;
        this.origin = origin;
        this.size = size;
        this.color = color;
        this.highlight_color = highlight_color;
        this.draw(color);
        // console.log("width = ", this.width, "height = ", this.height, "origin = ", this.origin, "size = ", this.size, "color = ", this.color);
    }

    highlight() {
        this.draw(this.highlight_color);
    }

    draw(color) {
        // console.log("drawing matrix");
        fill(color);
        stroke(0);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                square(this.origin[0] + i * this.size, this.origin[1] + j * this.size, this.size);
            }
        }
    }

}

function prepareNetwork(qin, qout) {
    rin = qin * 4;
    rout = qout * 4;
    
    let x_spacing = 150*scale;
    let y_spacing = 50*scale;
    let real_origin = [150*scale, 325*scale]
    let quat_origin = [400*scale, 150*scale]

    // stroke(0);
    // fill(GREEN);
    // ellipse(real_origin[0], real_origin[1], 20, 20);
    // fill(BLACK);
    // ellipse(quat_origin[0], quat_origin[1], 20, 20);
    // list of rin number of Nodes

    real_input_nodes = [];
    for(let i = -rin/2; i < rin/2; i++) {
        real_input_nodes.push(new Node(real_origin[0]-x_spacing/2, real_origin[1] + y_spacing * i, null, RED));
    }

    real_output_nodes = [];
    for(let i = -rout/2; i < rout/2; i++) {
        real_output_nodes.push(new Node(real_origin[0]+x_spacing/2, real_origin[1] + y_spacing * i, null, RED));
    }

    quat_input_nodes = [];
    for(let i = -qin/2; i < qin/2; i++) {
        // semd the real_input_nodes[i to i+4] as corr
        p = (i+qin/2)*4;
        quat_input_nodes.push(new Node(quat_origin[0]-x_spacing/2, quat_origin[1] + y_spacing * i, real_input_nodes.slice(p, p+4), BLUE));
    }

    quat_output_nodes = [];
    for(let i = -qout/2; i < qout/2; i++) {
        // semd the real_output_nodes[i to i+4] as corr
        p = (i+qout/2)*4;
        quat_output_nodes.push(new Node(quat_origin[0]+x_spacing/2, quat_origin[1] + y_spacing * i, real_output_nodes.slice(p, p+4), BLUE));
    }

    // console.log(real_input_nodes.length, real_output_nodes.length, quat_input_nodes.length, quat_output_nodes.length);

    real_edges = [];

    // make the edges
    real_input_nodes.forEach(node1 => {
        real_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2, 1, BLACK, GREEN);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
            real_edges.push(newedge);
        });
    });

    quat_edges = [];
    quat_input_nodes.forEach(node1 => {
        quat_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2, 1, BLACK, GREEN);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
            quat_edges.push(newedge);
        });
    });


    // display a (qin, qout) dimentional matrix

    // for(let i = 0; i < qin; i++) {
    //     for(let j = 0; j < qout; j++) {
    //         // console.log(quat_input_nodes[i].neighbours[j]);
    //         // console.log(quat_input_nodes[i].edges[j]);
    //         // console.log(quat_output_nodes[j].neighbours[i]);
    //         // console.log(quat_output_nodes[j].edges[i]);
    //     }
    // }

    size = 15*scale;
    spacing = 50*scale
    
    o = [500*scale, 300*scale]
    // the 4 * 4 = 16 matrices for real_edges

    // new RealMatrix(qin, qout, [o[0]+0*spacing, o[1]+0*spacing], size, Cr, Cr_light)
    // new RealMatrix(qin, qout, [o[0]+1*spacing, o[1]+0*spacing], size, Ci, Ci_light)
    // new RealMatrix(qin, qout, [o[0]+2*spacing, o[1]+0*spacing], size, Cj, Cj_light)
    // new RealMatrix(qin, qout, [o[0]+3*spacing, o[1]+0*spacing], size, Ck, Ck_light)

    // new RealMatrix(qin, qout, [o[0]+0*spacing, o[1]+1*spacing], size, Ci, Ci_light)
    // new RealMatrix(qin, qout, [o[0]+1*spacing, o[1]+1*spacing], size, Cr, Cr_light)
    // new RealMatrix(qin, qout, [o[0]+2*spacing, o[1]+1*spacing], size, Ck, Ck_light)
    // new RealMatrix(qin, qout, [o[0]+3*spacing, o[1]+1*spacing], size, Cj, Cj_light)

    // new RealMatrix(qin, qout, [o[0]+0*spacing, o[1]+2*spacing], size, Cj, Cj_light)
    // new RealMatrix(qin, qout, [o[0]+1*spacing, o[1]+2*spacing], size, Ck, Ck_light)
    // new RealMatrix(qin, qout, [o[0]+2*spacing, o[1]+2*spacing], size, Cr, Cr_light)
    // new RealMatrix(qin, qout, [o[0]+3*spacing, o[1]+2*spacing], size, Ci, Ci_light)

    // new RealMatrix(qin, qout, [o[0]+0*spacing, o[1]+3*spacing], size, Ck, Ck_light)
    // new RealMatrix(qin, qout, [o[0]+1*spacing, o[1]+3*spacing], size, Cj, Cj_light)
    // new RealMatrix(qin, qout, [o[0]+2*spacing, o[1]+3*spacing], size, Ci, Ci_light)
    // new RealMatrix(qin, qout, [o[0]+3*spacing, o[1]+3*spacing], size, Cr, Cr_light)

    new RealMatrix(rin, rout, [o[0]        , o[1]        ], size, Cr, Cr_light)

    o = [300*scale, 300*scale]
    // the four quaternion matrices
    // new QuatMatrix(qin, qout, [o[0]        , o[1]        ], size, Cr, Cr_light)
    // new QuatMatrix(qin, qout, [o[0]+spacing, o[1]        ], size, Ci, Ci_light)
    // new QuatMatrix(qin, qout, [o[0]        , o[1]+spacing], size, Cj, Cj_light)
    // new QuatMatrix(qin, qout, [o[0]+spacing, o[1]+spacing], size, Ck, Ck_light)
    new QuatMatrix(qin, qout, [o[0]        , o[1]        ], size, Cr, Cr_light)

    // return a list which contains all the elements in real_input_nodes, real_output_nodes, quat_input_nodes and quat_output_nodes
    all_nodes = real_input_nodes.concat(real_output_nodes, quat_input_nodes, quat_output_nodes);
    all_edges = real_edges.concat(quat_edges);
    // return [all_nodes, all_edges];
}

// let [nodes, edges] = prepareNetwork(qin, qout);

function setup() {
    background(220);
    createCanvas(800*scale, 600*scale);

    qin = document.getElementById("inNeurons").value;
    qout = document.getElementById("outNeurons").value;
    prepareNetwork(qin, qout);
    console.log("setup is done");
    
}

function draw() {
    // Update the number of neurons based on the slider value

    if (
        qin != document.getElementById("inNeurons").value ||
        qout != document.getElementById("outNeurons").value
    ) setup();

    all_edges.forEach(element => {
        element.draw();
    });

    all_nodes.forEach(element => {
        element.draw();
    });

    all_edges.forEach(element => {
        if (element.hit({x: mouseX, y: mouseY})) {
            element.highlight();
        }
    });

    all_nodes.forEach(element => {
        if (element.hit({x: mouseX, y: mouseY})) {
            element.highlight();
        }
    });

}
