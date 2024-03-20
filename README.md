# Quaternion Network Weight Visualization

## About
This project provides an interactive visual tool to explore the weights of Quaternion Neural Networks. While quaternions are conceptually elegant, they are implemented in real-valued computation as a system of four interacting real matrices. This tool bridges that gap, allowing you to visualize how a single quaternion connection between neurons is decomposed into the real-valued weight matrices that actually perform the Hamilton product.

## Technical Details
The visualization is built using HTML5, CSS3, and the p5.js library. 

At its core, the project demonstrates the mathematical mapping of a quaternion weight $W$ to a real-valued representation. A quaternion is defined as:
$$q = r + i\mathbf{i} + j\mathbf{j} + k\mathbf{k}$$
where $r, i, j, k$ are the real components. 

In a Quaternion Linear Layer, the weight matrix is not a single matrix of quaternions but is represented by four real matrices. The tool visualizes this by color-coding the different components:
- $r$ (Real): Pink/Red
- $i$ (Imaginary $\mathbf{i}$): Orange
- $j$ (Imaginary $\mathbf{j}$): Blue
- $k$ (Imaginary $\mathbf{k}$): Teal/Green

The interface allows you to dynamically adjust the number of input and output quaternion neurons, updating the graph and the corresponding weight matrices in real-time.

## Execution
Because this is a client-side web application, there are no complex installation steps:

1. Clone the repository to your local machine.
2. Open the `index.html` file in any modern web browser.
3. Use the sliders at the top of the page to adjust the number of input and output neurons to see how the matrix complexity scales.