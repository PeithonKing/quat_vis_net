let qin = 1; // Default number of neurons
let qout = 1;
let rin = 4;
let rout = 4;

// set the scale to be the minimum of window width / 800 and window height / 600
let scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
console.log(scale);

let all_nodes = [];
let all_edges = [];
let all_real_matrix_cells = [];
let all_quat_matrix_cells = [];

WHITE = [255, 255, 255]
BLACK = [0, 0, 0]
RED = [255, 0, 0]
GREEN = [0, 255, 0]
BLUE = [0, 0, 255]

Cr = "#d94179"  // 233, 30, 99
Ci = "#ff774d"  // 255, 138, 101
Cj = "#459be6"  // 66, 165, 245
Ck = "#3dccb4"  // 76, 175, 80

Cr_light = "#F48FB1"  // 244, 143, 177
Ci_light = "#FFAB91"  // 255, 171, 145
Cj_light = "#90CAF9"  // 144, 202, 249
Ck_light = "#81C784"  // 129, 200, 132

// RED = [255, 0, 0]
// RED = [255, 0, 0]
// RED = [255, 0, 0]
// RED = [255, 0, 0]

console.log("sketch.js is loaded");

function flattenArrays(...arrays) {
    // Use reduce to flatten each array and concatenate them
    return arrays.reduce((flattened, currentArray) => {
        // Use concat to merge the flattened array with the current array
        return flattened.concat(currentArray.flat());
    }, []);
}

class Node {
    constructor(x, y, corr = null, color = RED, size = 25 * scale) {
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
        let hitornot = (point.x - this.x) ** 2 + (point.y - this.y) ** 2 < (this.size / 2) ** 2;
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
    constructor(node1, node2, width = 1, color = BLACK, highlight_color = BLUE, weight_coordinate = [0, 0]) {
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
        let tan_theta = -(this.node2.y - this.node1.y) / (this.node2.x - this.node1.x);
        let sin_theta = tan_theta / Math.sqrt(1 + tan_theta ** 2);
        let cos_theta = 1 / Math.sqrt(1 + tan_theta ** 2);

        // console.log(tan_theta, sin_theta, cos_theta);
        // Calculate the coordinates of the vertices
        this.v1 = { x: this.node1.x - this.width / 2 * sin_theta, y: this.node1.y - this.width / 2 * cos_theta };
        this.v2 = { x: this.node1.x + this.width / 2 * sin_theta, y: this.node1.y + this.width / 2 * cos_theta };
        this.v3 = { x: this.node2.x + this.width / 2 * sin_theta, y: this.node2.y + this.width / 2 * cos_theta };
        this.v4 = { x: this.node2.x - this.width / 2 * sin_theta, y: this.node2.y - this.width / 2 * cos_theta };

        this.hit_v1 = { x: this.node1.x - this.width * sin_theta, y: this.node1.y - this.width * cos_theta };
        this.hit_v2 = { x: this.node1.x + this.width * sin_theta, y: this.node1.y + this.width * cos_theta };
        this.hit_v3 = { x: this.node2.x + this.width * sin_theta, y: this.node2.y + this.width * cos_theta };
        this.hit_v4 = { x: this.node2.x - this.width * sin_theta, y: this.node2.y - this.width * cos_theta };

    }

    hit(point) {
        // Check if the point lies inside the rectangle
        let v1v2 = (point.x - this.v1.x) * (this.v2.y - this.v1.y) - (point.y - this.v1.y) * (this.v2.x - this.v1.x);
        let v2v3 = (point.x - this.v2.x) * (this.v3.y - this.v2.y) - (point.y - this.v2.y) * (this.v3.x - this.v2.x);
        let v3v4 = (point.x - this.v3.x) * (this.v4.y - this.v3.y) - (point.y - this.v3.y) * (this.v4.x - this.v3.x);
        let v4v1 = (point.x - this.v4.x) * (this.v1.y - this.v4.y) - (point.y - this.v4.y) * (this.v1.x - this.v4.x);

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


class MatricCell{
    constructor(x, y, size, color, highlight_color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.highlight_color = highlight_color;
        this.draw();
    }

    draw() {
        fill(this.color);
        stroke(0);
        rect(this.x, this.y, this.size, this.size);
    }

    hit (point) {
        return (
            point.x > this.x &&
            point.x < this.x + this.size &&
            point.y > this.y &&
            point.y < this.y + this.size
        );
    }
}

class QuatMatrixCell extends MatricCell{
    constructor(x, y, size, color, highlight_color) {
        super(x, y, size, color, highlight_color);
        this.real_cells = [];
    }

    highlight() {
        fill(this.highlight_color);
        stroke(0);
        rect(this.x, this.y, this.size, this.size);
        this.real_cells.forEach(real_cell => {
            real_cell.highlight();
        });
    }
}

class RealMatrixCell extends MatricCell{
    constructor(x, y, size, color, highlight_color) {
        super(x, y, size, color, highlight_color);
        this.edge = null;
    }

    highlight() {
        fill(this.highlight_color);
        stroke(0);
        rect(this.x, this.y, this.size, this.size);
        if (this.edge) {
            this.edge.highlight();
        }
    }
}

class Matrices {
    constructor(width, height, real_origin, quat_origin, size, real_edges, quat_edges) {
        // width and height should be qin and qout, convert them to ints if they are not
        this.width = parseInt(width);
        this.height = parseInt(height);
        this.real_origin = real_origin;
        this.quat_origin = quat_origin;
        this.size = size;
        this.real_edges = real_edges;
        this.quat_edges = quat_edges;
        this.make_real_matrices();
    }

    make_matrix(width, height, origin, size, color, highlight_color, type) {
        let mat = [];
        for (let i = 0; i < width; i++) {
            let row = [];
            for (let j = 0; j < height; j++) {
                let cell = new type(origin[0] + i * size, origin[1] + j * size, size, color, highlight_color);
                row.push(cell);
            }
            mat.push(row);
        }
        return mat;
    }

    make_real_matrices() {

        let x_offset = this.width * this.size + 0;
        let y_offset = this.height * this.size + 0;

        width = this.width;
        height = this.height;

        // make the 16 matrices for the real edges
        let matr1 = this.make_matrix(width, height, [this.real_origin[0] + 0 * x_offset, this.real_origin[1] + 0 * y_offset], this.size, Cr, Cr_light, RealMatrixCell);
        let matr2 = this.make_matrix(width, height, [this.real_origin[0] + 1 * x_offset, this.real_origin[1] + 1 * y_offset], this.size, Cr, Cr_light, RealMatrixCell);
        let matr3 = this.make_matrix(width, height, [this.real_origin[0] + 2 * x_offset, this.real_origin[1] + 2 * y_offset], this.size, Cr, Cr_light, RealMatrixCell);
        let matr4 = this.make_matrix(width, height, [this.real_origin[0] + 3 * x_offset, this.real_origin[1] + 3 * y_offset], this.size, Cr, Cr_light, RealMatrixCell);

        let mati1 = this.make_matrix(width, height, [this.real_origin[0] + 1 * x_offset, this.real_origin[1] + 0 * y_offset], this.size, Ci, Ci_light, RealMatrixCell);
        let mati2 = this.make_matrix(width, height, [this.real_origin[0] + 0 * x_offset, this.real_origin[1] + 1 * y_offset], this.size, Ci, Ci_light, RealMatrixCell);
        let mati3 = this.make_matrix(width, height, [this.real_origin[0] + 2 * x_offset, this.real_origin[1] + 3 * y_offset], this.size, Ci, Ci_light, RealMatrixCell);
        let mati4 = this.make_matrix(width, height, [this.real_origin[0] + 3 * x_offset, this.real_origin[1] + 2 * y_offset], this.size, Ci, Ci_light, RealMatrixCell);

        let matj1 = this.make_matrix(width, height, [this.real_origin[0] + 0 * x_offset, this.real_origin[1] + 2 * y_offset], this.size, Cj, Cj_light, RealMatrixCell);
        let matj2 = this.make_matrix(width, height, [this.real_origin[0] + 2 * x_offset, this.real_origin[1] + 0 * y_offset], this.size, Cj, Cj_light, RealMatrixCell);
        let matj3 = this.make_matrix(width, height, [this.real_origin[0] + 1 * x_offset, this.real_origin[1] + 3 * y_offset], this.size, Cj, Cj_light, RealMatrixCell);
        let matj4 = this.make_matrix(width, height, [this.real_origin[0] + 3 * x_offset, this.real_origin[1] + 1 * y_offset], this.size, Cj, Cj_light, RealMatrixCell);

        let matk1 = this.make_matrix(width, height, [this.real_origin[0] + 0 * x_offset, this.real_origin[1] + 3 * y_offset], this.size, Ck, Ck_light, RealMatrixCell);
        let matk2 = this.make_matrix(width, height, [this.real_origin[0] + 3 * x_offset, this.real_origin[1] + 0 * y_offset], this.size, Ck, Ck_light, RealMatrixCell);
        let matk3 = this.make_matrix(width, height, [this.real_origin[0] + 2 * x_offset, this.real_origin[1] + 1 * y_offset], this.size, Ck, Ck_light, RealMatrixCell);
        let matk4 = this.make_matrix(width, height, [this.real_origin[0] + 1 * x_offset, this.real_origin[1] + 2 * y_offset], this.size, Ck, Ck_light, RealMatrixCell);

        x_offset += 10;
        y_offset += 10;

        // make the 4 matrices for the quat edges
        let matr = this.make_matrix(width, height, [this.quat_origin[0] + 0 * x_offset, this.quat_origin[1] + 0 * y_offset], this.size, Cr, Cr_light, QuatMatrixCell);
        let mati = this.make_matrix(width, height, [this.quat_origin[0] + 1 * x_offset, this.quat_origin[1] + 0 * y_offset], this.size, Ci, Ci_light, QuatMatrixCell);
        let matj = this.make_matrix(width, height, [this.quat_origin[0] + 0 * x_offset, this.quat_origin[1] + 1 * y_offset], this.size, Cj, Cj_light, QuatMatrixCell);
        let matk = this.make_matrix(width, height, [this.quat_origin[0] + 1 * x_offset, this.quat_origin[1] + 1 * y_offset], this.size, Ck, Ck_light, QuatMatrixCell);

        // assign the real cells to the quat cells
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                matr[i][j].real_cells = [matr1[i][j], matr2[i][j], matr3[i][j], matr4[i][j]];
                mati[i][j].real_cells = [mati1[i][j], mati2[i][j], mati3[i][j], mati4[i][j]];
                matj[i][j].real_cells = [matj1[i][j], matj2[i][j], matj3[i][j], matj4[i][j]];
                matk[i][j].real_cells = [matk1[i][j], matk2[i][j], matk3[i][j], matk4[i][j]];
            }
        }

        // assign the corresponding edges to the real cells
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                matr1[i][j].edge = this.real_edges[i+0*this.width][j+0*this.height];
                matr2[i][j].edge = this.real_edges[i+1*this.width][j+1*this.height];
                matr3[i][j].edge = this.real_edges[i+2*this.width][j+2*this.height];
                matr4[i][j].edge = this.real_edges[i+3*this.width][j+3*this.height];

                mati1[i][j].edge = this.real_edges[i+1*this.width][j+0*this.height];
                mati2[i][j].edge = this.real_edges[i+0*this.width][j+1*this.height];
                mati3[i][j].edge = this.real_edges[i+2*this.width][j+3*this.height];
                mati4[i][j].edge = this.real_edges[i+3*this.width][j+2*this.height];

                matj1[i][j].edge = this.real_edges[i+0*this.width][j+2*this.height];
                matj2[i][j].edge = this.real_edges[i+2*this.width][j+0*this.height];
                matj3[i][j].edge = this.real_edges[i+1*this.width][j+3*this.height];
                matj4[i][j].edge = this.real_edges[i+3*this.width][j+1*this.height];

                matk1[i][j].edge = this.real_edges[i+0*this.width][j+3*this.height];
                matk2[i][j].edge = this.real_edges[i+3*this.width][j+0*this.height];
                matk3[i][j].edge = this.real_edges[i+2*this.width][j+1*this.height];
                matk4[i][j].edge = this.real_edges[i+1*this.width][j+2*this.height];
            }
        }


        all_real_matrix_cells = flattenArrays(
            matr1, matr2, matr3, matr4,
            mati1, mati2, mati3, mati4,
            matj1, matj2, matj3, matj4,
            matk1, matk2, matk3, matk4
        );

        all_quat_matrix_cells = flattenArrays(matr, mati, matj, matk);

        // // testing the matrices
        // console.log(matr1)
        // console.log(matr)
    }





}

function prepareNetwork(qin, qout) {
    rin = qin * 4;
    rout = qout * 4;

    let x_spacing = 150 * scale;
    let y_spacing = 50 * scale;
    let real_origin = [150 * scale, 325 * scale]
    let quat_origin = [400 * scale, 150 * scale]

    // stroke(0);
    // fill(GREEN);
    // ellipse(real_origin[0], real_origin[1], 20, 20);
    // fill(BLACK);
    // ellipse(quat_origin[0], quat_origin[1], 20, 20);
    // list of rin number of Nodes

    real_input_nodes = [];
    for (let i = -rin / 2; i < rin / 2; i++) {
        real_input_nodes.push(new Node(real_origin[0] - x_spacing / 2, real_origin[1] + y_spacing * i, null, RED));
    }

    real_output_nodes = [];
    for (let i = -rout / 2; i < rout / 2; i++) {
        real_output_nodes.push(new Node(real_origin[0] + x_spacing / 2, real_origin[1] + y_spacing * i, null, RED));
    }

    quat_input_nodes = [];
    for (let i = -qin / 2; i < qin / 2; i++) {
        // semd the real_input_nodes[i to i+4] as corr
        p = (i + qin / 2) * 4;
        quat_input_nodes.push(new Node(quat_origin[0] - x_spacing / 2, quat_origin[1] + y_spacing * i, real_input_nodes.slice(p, p + 4), BLUE));
    }

    quat_output_nodes = [];
    for (let i = -qout / 2; i < qout / 2; i++) {
        // semd the real_output_nodes[i to i+4] as corr
        p = (i + qout / 2) * 4;
        quat_output_nodes.push(new Node(quat_origin[0] + x_spacing / 2, quat_origin[1] + y_spacing * i, real_output_nodes.slice(p, p + 4), BLUE));
    }

    // console.log(real_input_nodes.length, real_output_nodes.length, quat_input_nodes.length, quat_output_nodes.length);

    real_edges = [];

    // make the edges
    real_input_nodes.forEach(node1 => {
        let row = [];
        real_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2, 1, BLACK, GREEN);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
            row.push(newedge);
        });
        real_edges.push(row);
    });

    quat_edges = [];
    quat_input_nodes.forEach(node1 => {
        let row = [];
        quat_output_nodes.forEach(node2 => {
            newedge = new Edge(node1, node2, 1, BLACK, GREEN);
            node1.neighbours.push(node2);
            node1.edges.push(newedge);
            node2.neighbours.push(node1);
            node2.edges.push(newedge);
            row.push(newedge);
        });
        quat_edges.push(row);
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

    size = 15 * scale;
    // spacing = 50 * scale

    real_o = [500 * scale, 300 * scale]
    quat_o = [300 * scale, 300 * scale]

    new Matrices(qin, qout, real_o, quat_o, size, real_edges, quat_edges);

    console.log(real_edges);
    console.log(quat_edges);

    // return a list which contains all the elements in real_input_nodes, real_output_nodes, quat_input_nodes and quat_output_nodes
    // all_nodes = real_input_nodes.concat(real_output_nodes, quat_input_nodes, quat_output_nodes);
    // all_edges = real_edges.concat(quat_edges);
    all_nodes = flattenArrays(real_input_nodes, real_output_nodes, quat_input_nodes, quat_output_nodes);
    all_edges = flattenArrays(real_edges, quat_edges);
}

// let [nodes, edges] = prepareNetwork(qin, qout);

function setup() {
    background(220);
    createCanvas(800 * scale, 600 * scale);

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

    all_real_matrix_cells.forEach(element => {
        element.draw();
    });

    all_quat_matrix_cells.forEach(element => {
        element.draw();
    });

    all_edges.forEach(element => {
        if (element.hit({ x: mouseX, y: mouseY })) {
            element.highlight();
        }
    });

    all_nodes.forEach(element => {
        if (element.hit({ x: mouseX, y: mouseY })) {
            element.highlight();
        }
    });

    all_real_matrix_cells.forEach(element => {
        if (element.hit({ x: mouseX, y: mouseY })) {
            element.highlight();
        }
    });

    all_quat_matrix_cells.forEach(element => {
        if (element.hit({ x: mouseX, y: mouseY })) {
            element.highlight();
        }
    });

    frameRate(5);
    console.log(frameRate());

}
