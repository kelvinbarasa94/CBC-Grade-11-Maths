(function () {

    let currentGraph = null;
    let currentShading = [];
    let currentObjects = [];

    const board = JXG.JSXGraph.initBoard('jsxgraph-domain-explorer-board', {
        boundingbox: [-8, 10, 10, -5],
        axis: true,
        showCopyright: false,
        showNavigation: true,
        zoom: { wheel: true },
        pan: { enabled: true },
        grid: true
    });

    // ================= TITLE =================
    board.create('text', [-7.5, 9.2, 'Random Domain Explorer'], {
        fontSize: 24,
        fixed: true,
        strokeColor: '#1e3a8a'
    });

    // ================= INFO PANEL =================
    const infoText = board.create('text', [3.5, 8.5, ''], {
        fontSize: 16,
        fixed: true,
        useHTML: true,
        anchorX: 'left'
    });

    // ================= CLEAR FUNCTION =================
    function clearPrevious() {

        if (currentGraph) {
            board.removeObject(currentGraph);
            currentGraph = null;
        }

        currentShading.forEach(obj => board.removeObject(obj));
        currentShading = [];

        currentObjects.forEach(obj => board.removeObject(obj));
        currentObjects = [];

    }

    // ================= RANDOM FUNCTION GENERATOR =================
    function generateRandomFunction() {

        clearPrevious();

        const type = Math.floor(Math.random() * 4);

        let func;
        let domainStart;
        let domainEnd;
        let color;
        let name;
        let explanation;

        switch (type) {

            // =========================================
            // Square Root Function
            // =========================================
            case 0: {

                const shift = Math.floor(Math.random() * 6) - 3;

                func = x => Math.sqrt(x - shift);

                domainStart = shift;
                domainEnd = 10;

                name = `f(x) = √(x ${shift >= 0 ? '-' : '+'} ${Math.abs(shift)})`;

                explanation = `Domain: [${shift}, ∞)`;

                color = '#2563eb';

                currentShading.push(
                    board.create('polygon', [
                        [domainStart, -5],
                        [domainStart, 10],
                        [10, 10],
                        [10, -5]
                    ], {
                        fillColor: '#86efac',
                        fillOpacity: 0.18,
                        strokeOpacity: 0
                    })
                );

                break;
            }

            // =========================================
            // Logarithmic Function
            // =========================================
            case 1: {

                const shift = Math.floor(Math.random() * 6) - 3;

                func = x => Math.log(x - shift);

                domainStart = shift + 0.01;
                domainEnd = 10;

                name = `f(x) = log(x ${shift >= 0 ? '-' : '+'} ${Math.abs(shift)})`;

                explanation = `Domain: (${shift}, ∞)`;

                color = '#7c3aed';

                currentShading.push(
                    board.create('polygon', [
                        [shift, -5],
                        [shift, 10],
                        [10, 10],
                        [10, -5]
                    ], {
                        fillColor: '#c4b5fd',
                        fillOpacity: 0.18,
                        strokeOpacity: 0
                    })
                );

                currentObjects.push(
                    board.create('line', [[shift, -10], [shift, 10]], {
                        dash: 2,
                        strokeColor: '#7c3aed'
                    })
                );

                break;
            }

            // =========================================
            // Rational Function
            // =========================================
            case 2: {

                const k = Math.floor(Math.random() * 7) - 3;

                func = x => 1 / (x - k);

                domainStart = -8;
                domainEnd = 10;

                name = `f(x) = 1 / (x ${k >= 0 ? '-' : '+'} ${Math.abs(k)})`;

                explanation = `Domain: ℝ \\ {${k}}`;

                color = '#db2777';

                currentObjects.push(
                    board.create('line', [[k, -10], [k, 10]], {
                        dash: 2,
                        strokeColor: '#f59e0b',
                        strokeWidth: 2
                    })
                );

                currentObjects.push(
                    board.create('point', [k, 0], {
                        fixed: true,
                        size: 4,
                        color: '#f59e0b',
                        name: 'Excluded'
                    })
                );

                break;
            }

            // =========================================
            // Square Root of Quadratic
            // =========================================
            case 3: {

                const a = Math.floor(Math.random() * 3) + 2;

                func = x => Math.sqrt(x * x - a * a);

                domainStart = -8;
                domainEnd = 10;

                name = `f(x) = √(x² - ${a}²)`;

                explanation = `Domain: (-∞, -${a}] ∪ [${a}, ∞)`;

                color = '#16a34a';

                currentShading.push(
                    board.create('polygon', [
                        [-8, -5],
                        [-8, 10],
                        [-a, 10],
                        [-a, -5]
                    ], {
                        fillColor: '#86efac',
                        fillOpacity: 0.18,
                        strokeOpacity: 0
                    })
                );

                currentShading.push(
                    board.create('polygon', [
                        [a, -5],
                        [a, 10],
                        [10, 10],
                        [10, -5]
                    ], {
                        fillColor: '#86efac',
                        fillOpacity: 0.18,
                        strokeOpacity: 0
                    })
                );

                currentObjects.push(
                    board.create('point', [-a, 0], {
                        fixed: true,
                        size: 4,
                        color: '#15803d',
                        name: ''
                    })
                );

                currentObjects.push(
                    board.create('point', [a, 0], {
                        fixed: true,
                        size: 4,
                        color: '#15803d',
                        name: ''
                    })
                );

                break;
            }

        }

        // ================= CREATE GRAPH =================
        currentGraph = board.create('functiongraph', [
            func,
            domainStart,
            domainEnd
        ], {
            strokeWidth: 4,
            strokeColor: color
        });

        // ================= UPDATE INFO =================
        infoText.setText(
            `<b>${name}</b><br><span style="color:#166534">${explanation}</span>`
        );

    }

    // ================= INITIAL FUNCTION =================
    generateRandomFunction();

    // ================= BUTTONS =================
    board.create('button',
        [-7, -3.8,
        'New Random Function',
        generateRandomFunction
        ],
        {
            fontSize: 15,
            fixed: true
        }
    );

    // board.create('button',
    //     [-2.5, -3.8,
    //     'Show Domain',
    //     function () {
    //         alert('The shaded region represents the domain of the function.');
    //     }
    //     ],
    //     {
    //         fontSize: 15,
    //         fixed: true
    //     }
    // );

    // ================= FOOTER =================
    board.create('text',
        [-7.5, -2.5,
        'Click "New Random Function" to explore different domains.'
        ],
        {
            fontSize: 13,
            fixed: true,
            strokeColor: '#64748b'
        }
    );

})();