// Initialize the JSXGraph board
const board = JXG.JSXGraph.initBoard('jsxgraph-even-odd', {
    boundingbox: [-7, 7, 7, -7],
    axis: true,
    showNavigation: false,
    showCopyright: false
});

// State variables for the current function
let currentFuncIndex = 0;

// Define the functions we will explore
const functions = [
    { f: x => 0.5 * x * x, name: 'f(x) = 0.5x^2', type: 'even' },
    { f: x => 0.25 * x * x * x, name: 'f(x) = 0.25x^3', type: 'odd' },
    { f: x => 4 * Math.cos(x), name: 'f(x) = 4cos(x)', type: 'even' },
    { f: x => 4 * Math.sin(x), name: 'f(x) = 4sin(x)', type: 'odd' }
];

// 1. Plot the dynamic function graph
let graph = board.create('functiongraph', [
    function(x) { return functions[currentFuncIndex].f(x); },
    -7, 7
], { strokeWidth: 3, strokeColor: '#1f77b4' }); // Blue curve

// 2. Add the interactive point P (Glider on the curve)
let p = board.create('glider', [2, 2, graph], { 
    name: 'P', 
    size: 5, 
    color: '#1f77b4', 
    label: { offset: [10, 10], fontSize: 14 }
});

// 3. Add the symmetrical point Q based on P's x-coordinate
let q = board.create('point', [
    function() { return -p.X(); },
    function() { return functions[currentFuncIndex].f(-p.X()); }
], { 
    name: 'Q', 
    size: 5, 
    color: '#d62728', // Red point
    label: { offset: [10, 10], fontSize: 14 }
});

// 4. Create visual lines to show the geometric symmetry
// Horizontal dashed line for even functions
let evenLine = board.create('segment', [p, q], {
    dash: 2,
    strokeColor: 'gray',
    visible: function() { return functions[currentFuncIndex].type === 'even'; }
});

// Line through origin for odd functions
let oddLine = board.create('segment', [p, q], {
    dash: 2,
    strokeColor: 'gray',
    visible: function() { return functions[currentFuncIndex].type === 'odd'; }
});

// Add a distinct point at the origin for rotational symmetry reference
let origin = board.create('point', [0, 0], {
    name: 'Origin', size: 3, color: 'black', fixed: true
});

// 5. Dynamic text to show real-time algebraic calculations
let calcText = board.create('text', [-6.5, 6, function() {
    let x = p.X().toFixed(2);
    let fx = p.Y().toFixed(2);
    let neg_x = (-p.X()).toFixed(2);
    let f_neg_x = q.Y().toFixed(2);
    let type = functions[currentFuncIndex].type;
    
    let str = `<div style="background: rgba(255,255,255,0.8); padding: 5px; border-radius: 5px;">`;
    str += `<strong>${type.toUpperCase()} FUNCTION: ${functions[currentFuncIndex].name}</strong><br>`;
    str += `Let x = ${x}<br>`;
    str += `f(x) = ${fx}<br>`;
    str += `f(-x) = f(${neg_x}) = ${f_neg_x}<br><br>`;
    
    if (type === 'even') {
        str += `<strong>Notice: f(-x) = f(x)</strong><br>`;
        str += `${f_neg_x} = ${fx}`;
    } else {
        str += `<strong>Notice: f(-x) = -f(x)</strong><br>`;
        str += `${f_neg_x} = -(${fx})`;
    }
    str += `</div>`;
    return str;
}], {fontSize: 15, parse: false});

// 6. Interactive buttons to switch functions
board.create('button', [-5.5, -5.5, 'Even: 0.5x^2', function() { 
    currentFuncIndex = 0; board.update(); 
}], {fixed: true});

board.create('button', [-2.5, -5.5, 'Odd: 0.25x^3', function() { 
    currentFuncIndex = 1; board.update(); 
}], {fixed: true});

board.create('button', [0.5, -5.5, 'Even: 4cos(x)', function() { 
    currentFuncIndex = 2; board.update(); 
}], {fixed: true});

board.create('button', [3.5, -5.5, 'Odd: 4sin(x)', function() { 
    currentFuncIndex = 3; board.update(); 
}], {fixed: true});