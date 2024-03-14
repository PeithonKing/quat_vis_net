let qin = 1; // Default number of neurons
let qout = 1;
let rin = 4;
let rout = 4;

let scale = 1

WHITE = [255, 255, 255]
BLACK = [0, 0, 0]
RED = [255, 0, 0]
GREEN = [0, 255, 0]
BLUE = [0, 0, 255]
RED = [255, 0, 0]
RED = [255, 0, 0]
RED = [255, 0, 0]
RED = [255, 0, 0]

console.log("sketch.js is loaded");

class Node {
    constructor(x, y, color = RED, size = 25*scale) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.draw();

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
        return (point.x - this.x)**2 + (point.y - this.y)**2 < (this.size/2)**2;
    }
}

class Edge {
    constructor(node1, node2, width=0.1, color=BLACK, highlight_color=GREEN, weight_coordinate=[0, 0]) {
        this.node1 = node1;
        this.node2 = node2;
        this.width = width;
        this.color = color;
        this.highlight_color = highlight_color;
        
        // Calculate vertices
        this.calculateVertices();
        this.draw(false);
    }

    draw(highlighted = false) {
        // Highlight or de-highlight the rectangle
        if (highlighted) {
            // Highlight
            fill(this.highlight_color);
        } else {
            // De-highlight
            fill(this.color);
        }
        quad(this.v1.x, this.v1.y, this.v2.x, this.v2.y, this.v3.x, this.v3.y, this.v4.x, this.v4.y);
    }

    calculateVertices() {
        // Calculate slope
        
        
        // Calculate tan(theta), sin(theta), and cos(theta)
        var tan_theta = -(this.node2.y - this.node1.y) / (this.node2.x - this.node1.x);
        var sin_theta = tan_theta / Math.sqrt(1 + tan_theta**2);
        var cos_theta = 1 / Math.sqrt(1 + tan_theta**2);
        
        console.log(tan_theta, sin_theta, cos_theta);
        // Calculate the coordinates of the vertices
        this.v1 = { x: this.node1.x - this.width/2 * cos_theta, y: this.node1.y - this.width/2 * sin_theta };
        this.v2 = { x: this.node1.x + this.width/2 * cos_theta, y: this.node1.y + this.width/2 * sin_theta };
        this.v3 = { x: this.node2.x + this.width/2 * cos_theta, y: this.node2.y + this.width/2 * sin_theta };
        this.v4 = { x: this.node2.x - this.width/2 * cos_theta, y: this.node2.y - this.width/2 * sin_theta };
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

function prepareNetwork(qin, qout) {
    rin = qin * 4;
    rout = qout * 4;
    
    let x_spacing = 150;
    let y_spacing = 50;
    let real_origin = [150, 325]
    let quat_origin = [400, 150]

    // stroke(0);
    // fill(GREEN);
    // ellipse(real_origin[0], real_origin[1], 20, 20);
    // fill(BLACK);
    // ellipse(quat_origin[0], quat_origin[1], 20, 20);
    // list of rin number of Nodes

    real_input_nodes = [];
    for(let i = -rin/2; i < rin/2; i++) {
        real_input_nodes.push(new Node(real_origin[0]-x_spacing/2, real_origin[1] + y_spacing * i, RED));
    }
    
    real_output_nodes = [];
    for(let i = -rout/2; i < rout/2; i++) {
        real_output_nodes.push(new Node(real_origin[0]+x_spacing/2, real_origin[1] + y_spacing * i, RED));
    }
    
    quat_input_nodes = [];
    for(let i = -qin/2; i < qin/2; i++) {
        quat_input_nodes.push(new Node(quat_origin[0]-x_spacing/2, quat_origin[1] + y_spacing * i, BLUE));
    }
    
    quat_output_nodes = [];
    for(let i = -qout/2; i < qout/2; i++) {
        quat_output_nodes.push(new Node(quat_origin[0]+x_spacing/2, quat_origin[1] + y_spacing * i, BLUE));
    }

    console.log(real_input_nodes.length, real_output_nodes.length, quat_input_nodes.length, quat_output_nodes.length);

    real_input_nodes.forEach(node1 => {
        real_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
        });
    });

    quat_input_nodes.forEach(node1 => {
        quat_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
        });
    });


}

function setup() {
    createCanvas(800*scale, 600*scale);
}

function draw() {
    background(200);

    // Update the number of neurons based on the slider value
    qin = document.getElementById("inNeurons").value;
    qout = document.getElementById("outNeurons").value;

    // Calculate the spacing between neurons
    // let spacing = width / (numNeurons + 1);
    // let spacing = 100;

    prepareNetwork(qin, qout);


    // Draw circles for each neuron
    // for (let i = 1; i <= qin; i++) {
    //     let x = i * spacing;
    //     let y = height / 2;
    //     drawNeuron(x, y);
    // }

    // // Draw circles for each neuron
    // for (let i = 1; i <= qout; i++) {
    //     let x = i * spacing+10;
    //     let y = height / 2;
    //     drawNeuron(x, y);
    // }
}
