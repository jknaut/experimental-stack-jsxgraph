/* Date of last change: 05/04/2025 */

/* Creates a JSXGraph board to construct circle diagrams or phasor diagrams */
/* Example of how to use the function: */
/* 1) Copy this function inside a working and empty JSXGraph environment. */
/* 2) Define the options you need (you can look at the defaultOptions to find the correct format): */
/* var options = { ... }; */
/* 3) Call the function with these options: */
/* createConstructionBoard(options);*/
var createConstructionBoard = (userOptions = {}) => {

    const defaultOptions = {

        checkSOK: true,
        checkBP: true,
        withVectorButton: true,
        tapePrecision: 1,

        withPhasorDiagram: false,
        taZD: [[0.0, 0.0], [5.22961956521, 0.0], [0.0, 0.0], [-3.22144715417, 3.28653346969], [0.0, 0.0], [10.6519116472, 5.31490932857], [0.0, 0.0], [0.609665977407, -4.39161794651], [-3.22144715417, 3.28653346969], [0.609665977407, -4.39161794651], [0.0, 0.0], [6.09249854801, 0.84579057818], [5.22961956521, 0.0], [6.09249854801, 0.84579057818], [6.09249854801, 0.84579057818], [10.6519116472, 5.31490932857]],
        vecLabels: ["\\(\\underline{U}_1\\)", "\\(\\underline{I}_1\\)", "\\(\\underline{U}_P\\)", "\\(\\underline{I}_{\\mu}\\)", "\\(\\underline{I}'_E\\)", "\\(\\underline{U}_r\\)", "\\(-j X_{1\\sigma} \\cdot \\underline{I}_1\\)", "\\(-j X_h \\cdot \\underline{I}_1\\)"],
        useMathJax: false,

    };
    const options = { ...defaultOptions, ...userOptions };

    function stringifyMap(map) {
        const mapArray = Array.from(map);
        const jsonStr = JSON.stringify(mapArray);
        return jsonStr;
    }

    function parseMap(jsonString) {
        const mapArray = JSON.parse(jsonString);
        const map = new Map(mapArray);
        return map;
    }

    var changeValue = (ansRef, newValue) => {
        const elem = document.getElementById(ansRef);
        const changeEvent = new Event('change');
        elem.value = newValue;
        elem.dispatchEvent(changeEvent);
    };

    var changeDropdownChoice = (ansRef, newIndex) => {
        const elem = document.getElementById(ansRef);
        const changeEvent = new Event('change');
        elem.selectedIndex = newIndex;
        elem.dispatchEvent(changeEvent);
    };

    function convert2Cart(polarBag) {
        var polarAbs = polarBag.abs;
        var polarAngle = polarBag.angle;
        var real = Math.cos(polarAngle * Math.PI / 180) * polarAbs;
        var imag = Math.sin(polarAngle * Math.PI / 180) * polarAbs;
        var rectNumber = { 'real': real, 'imag': imag };
        return rectNumber;
    }

    function convert2Polar(cartBag) {
        var rectReal = cartBag.real;
        var rectImag = cartBag.imag;
        var abs = Math.sqrt(rectReal * rectReal + rectImag * rectImag);
        var angle = rectReal >= 0 ? JXG.Math.mod(360.0 + Math.atan(rectImag / rectReal) * (180 / Math.PI), 360) : (rectReal < 0 ? 180.0 + Math.atan(rectImag / rectReal) * (180 / Math.PI) : 0.0);
        var polarNumber = { 'abs': abs, 'angle': angle };
        return polarNumber;
    }

    var state = {
        objMap: new Map(), /* maps id to object */
        selectedID: null,
        sokID: "-1",
        bpID: "-1",
    }
    var sokCheckbox = null;
    var bpCheckbox = null;

    const generateId = () => {
        return "id" + Math.random().toString(16).slice(2);
    };

    /* Set global options */
    {
        JXG.Options.axis = JXG.merge(JXG.Options.axis, {
            highlight: false,
            label: { highlight: false },
            ticks: { label: { highlight: false } }
        });
        JXG.Options.line = JXG.merge(JXG.Options.line, {
            highlight: false,
        });
        JXG.Options.curve = JXG.merge(JXG.Options.curve, {
            highlight: false,
        });
        JXG.Options.text = JXG.merge(JXG.Options.text, {
            highlight: false,
            fixed: true,
            useMathJax: options.useMathJax,
        });
        JXG.Options.point = JXG.merge(JXG.Options.point, {
            withLabel: false,
            showInfobox: true,
            infoboxDigits: 2,
        });
        JXG.Options.infobox.anchorY = 'bottom';
        JXG.Options.infobox.anchorX = 'left';
        JXG.Options.infobox.distanceX = -45;
        JXG.Options.infobox.distanceY = 10;
        JXG.Options.infobox.strokeColor = 'black';
    }

    /* Define colors */
    const Colors = {
        isabelline: '#f4f0ec',

        /* colorblind-friendly colors */
        orange: '#E69F00',
        blue: '#0072B2',
        red: '#D55E00',
        green: '#009E73',
        purple: '#CC79A7',
    }

    const selectHandler = (id) => {
        state.selectedID = id;
        if (sokCheckbox) sokCheckbox.rendNodeCheckbox.checked = state.selectedID == state.sokID;
        if (bpCheckbox) bpCheckbox.rendNodeCheckbox.checked = state.selectedID == state.bpID;
    }

    /*board.create('flexvector', [], {});*/
    /* creates a vector from [0,0] to [2, 1] */
    function createFlexVector(board, parents, attributes) {

        var vecState = parents[0];

        const id = vecState.id;
        const is_selected = () => state.selectedID == id;
        const dep_col = () => is_selected() ? Colors.blue : Colors.purple;

        const coordsFirst = vecState.coordsFirst;
        const pFirstStyle = { withLabel: false, color: dep_col, showInfobox: true, infoboxDigits: 2, };
        const pSecondStyle = pFirstStyle;
        const vecStyle = { withLabel: false, strokeColor: dep_col, strokeWidth: 1, opacity: 0.75, lastArrow: { type: 2, size: 14 } };
        var pFirst = board.create('point', coordsFirst, { ...pFirstStyle });
        const coordsSecond = vecState.coordsSecond;
        var pSecond = board.create('point', coordsSecond, { ...pSecondStyle });
        var vec = board.create('segment', [pFirst, pSecond], { ...vecStyle });

        const comp = new JXG.Composition({});

        comp.type = vecState.type;
        comp.id = vecState.id;
        comp.pFirst = pFirst;
        comp.pSecond = pSecond;
        pFirst.on('down', () => selectHandler(id));
        pSecond.on('down', () => selectHandler(id));
        vec.on('down', () => selectHandler(id));

        comp.setAttribute = (attributes) => {
            pFirst.setAttribute(attributes);
            pSecond.setAttribute(attributes);
            vec.setAttribute(attributes);
        }
        comp.removeFromBoard = () => {
            board.removeObject(vec);
            board.removeObject(pFirst);
            board.removeObject(pSecond);
        };

        comp.getState = () => {
            return { type: comp.type, id: comp.id, coordsFirst: [pFirst.X(), pFirst.Y()], coordsSecond: [pSecond.X(), pSecond.Y()] };
        };

        comp.createOriginCopy = (board) => {
            var data = comp.getState();
            data.id = generateId();
            data.coordsFirst = [0, 0];
            data.coordsSecond = [pSecond.X() - pFirst.X(), pSecond.Y() - pFirst.Y()];
            return board.create(data.type, [data], {});
        }

        return comp;
    }

    JXG.createFlexVector = createFlexVector;
    JXG.registerElement('flexvector', JXG.createFlexVector);

    const createOriginVector = (board) => {
        return board.create("flexvector", [{ type: 'flexvector', id: generateId(), coordsFirst: [0, 0], coordsSecond: [2, 1] }], {});
    };

    /*board.create('flexline', [], {});*/
    /* creates a line through origin and [1, 1] */
    function createFlexLine(board, parents, attributes) {

        var lineState = parents[0];

        var id = lineState.id;
        const is_selected = () => state.selectedID == id;
        const dep_col = () => is_selected() ? Colors.blue : Colors.red;

        const coordsFirst = lineState.coordsFirst;
        const pFirstStyle = { withLabel: false, color: dep_col, showInfobox: true, infoboxDigits: 2, };
        const pSecondStyle = pFirstStyle;
        const lineStyle = { withLabel: false, strokeColor: dep_col, strokeWidth: 1, opacity: 0.75 };
        var pFirst = board.create('point', coordsFirst, { ...pFirstStyle });
        const coordsSecond = lineState.coordsSecond;
        var pSecond = board.create('point', coordsSecond, { ...pSecondStyle });
        var line = board.create('line', [pFirst, pSecond], { ...lineStyle });

        const comp = new JXG.Composition({});

        comp.type = lineState.type;
        comp.id = lineState.id;
        pFirst.on('down', () => selectHandler(id));
        pSecond.on('down', () => selectHandler(id));
        line.on('down', () => selectHandler(id));

        comp.setAttribute = (attributes) => {
            pFirst.setAttribute(attributes);
            pSecond.setAttribute(attributes);
            line.setAttribute(attributes);
        }
        comp.removeFromBoard = () => {
            board.removeObject(line);
            board.removeObject(pFirst);
            board.removeObject(pSecond);
        }

        comp.getState = () => {
            return { type: comp.type, id: comp.id, coordsFirst: [pFirst.X(), pFirst.Y()], coordsSecond: [pSecond.X(), pSecond.Y()] };
        };

        /* TODO: Probably always use left lower point of line for new origin... */
        comp.createOriginCopy = (board) => {
            var data = comp.getState();
            data.id = generateId();
            data.coordsFirst = [0, 0];
            data.coordsSecond = [pSecond.X() - pFirst.X(), pSecond.Y() - pFirst.Y()];
            return board.create(data.type, [data], {});
        }

        return comp;
    }

    JXG.createFlexLine = createFlexLine;
    JXG.registerElement('flexline', JXG.createFlexLine);

    const createOriginLine = (board) => {
        return board.create("flexline", [{ type: 'flexline', id: generateId(), coordsFirst: [0, 0], coordsSecond: [1, 1] }], {});
    };

    /*board.create('flexcircle', [radius], {});*/
    /* creates a circle with center in the origin and some radius */
    function createFlexCircle(board, parents, attributes) {

        const cState = parents[0];

        const id = cState.id;
        const radius = cState.radius;
        /*console.log('radius: ' + radius);*/

        const is_selected = () => state.selectedID == id;
        const dep_col = () => is_selected() ? Colors.blue : Colors.orange;
        const coordsOrigin = [0, 0];
        const pCenterStyle = { withLabel: false, fillColor: dep_col, strokeColor: dep_col, showInfobox: true, infoboxDigits: 2, };
        const pRadiusStyle = { withLabel: false, fillColor: dep_col, strokeColor: 'red', strokeWidth: 1, showInfobox: true, infoboxDigits: 2, };
        const circleStyle = { withLabel: false, strokeColor: dep_col, strokeWidth: 1, opacity: 0.75 };
        var pCenter = board.create('point', coordsOrigin, { ...pCenterStyle });
        const coordsRadius = [coordsOrigin[0] + Math.cos(Math.PI / 4) * radius, coordsOrigin[1] + Math.sin(Math.PI / 4) * radius];
        var pRadius = board.create('point', coordsRadius, { ...pRadiusStyle });
        var circle = board.create('circle', [pCenter, pRadius], { ...circleStyle });

        var group = board.create('group', [pCenter, pRadius]);
        group.removeTranslationPoint(pRadius);
        pCenter.moveTo(cState.coordsCenter);
        /*console.log('group id: ' + group.id);*/

        const comp = new JXG.Composition({});

        comp.type = cState.type;
        comp.id = cState.id;
        comp.pCenter = pCenter;
        comp.pRadius = pRadius;
        pCenter.on('down', () => selectHandler(id));
        pRadius.on('down', () => selectHandler(id));
        circle.on('down', () => selectHandler(id));

        pRadius.on('over', () => {
            board.highlightInfobox = function (x, y, el) {
                var nCart = { 'real': x, 'imag': y };
                var nPolar = convert2Polar(nCart);
                /*multiply with i, if y-axis has Re */
                if (pAxisLabelsData.Y() == 4) {
                    nPolar = { 'abs': nPolar.abs, 'angle': JXG.Math.mod(nPolar.angle - 90.0, 360) };
                }
                var r = nPolar.abs.toFixed(2);
                var phi = nPolar.angle.toFixed(2);
                var radius = JXG.Math.Geometry.distance([pCenter.X(), pCenter.Y()], [x, y], 2).toFixed(2);
                this.infobox.setText('<div style="font-size: 12px; color: grey; background-color: white; border-radius: 4px; border: 1px solid grey; text-align: center;"><span style="color: darkred; padding: 6px; white-space:nowrap;">Radius: ' + radius + '</span></div>');
            };
        });

        pRadius.on('out', () => {
            board.highlightInfobox = function (x, y, el) {
                var nCart = { 'real': x, 'imag': y };
                var nPolar = convert2Polar(nCart);
                /*multiply with i, if y-axis has Re */
                if (pAxisLabelsData.Y() == 4) {
                    nPolar = { 'abs': nPolar.abs, 'angle': JXG.Math.mod(nPolar.angle - 90.0, 360) };
                }
                var r = nPolar.abs.toFixed(2);
                var phi = nPolar.angle.toFixed(2);
                this.infobox.setText('<div style="font-size: 12px; color: grey; background-color: white; border-radius: 4px; border: 1px solid grey"><span style="color: black; padding: 2px; white-space:nowrap;">(x= ' + x + ', y= ' + y + ')</span><hr style="margin: 2px 0px; border-width: 1px;"><span style="color: blue; padding: 2px; white-space:nowrap;">(r= ' + r + ', &phi;= ' + phi + '&deg;)</span></div>');
            };
        });

        comp.computeRadius = () => {
            return JXG.Math.Geometry.distance([pCenter.X(), pCenter.Y()], [pRadius.X(), pRadius.Y()], 2);
        }
        comp.setAttribute = (attributes) => {
            pCenter.setAttribute(attributes);
            pRadius.setAttribute(attributes);
            circle.setAttribute(attributes);
        }
        comp.removeFromBoard = () => {
            board.removeObject(circle);
            board.removeObject(pCenter);
            board.removeObject(pRadius);

            /* TODO: the next 2 lines have no effect... */
            group.ungroup();
            board.removeObject(group);
        }

        comp.getState = () => {
            const pCenterCoords = [pCenter.X(), pCenter.Y()];
            const pRadiusCoords = [pRadius.X(), pRadius.Y()];
            return { type: comp.type, id: comp.id, coordsCenter: pCenterCoords, radius: JXG.Math.Geometry.distance(pCenterCoords, pRadiusCoords, 2) };
        };

        comp.createOriginCopy = (board) => {
            var data = comp.getState();
            data.id = generateId();
            data.coordsCenter = [0, 0];
            return board.create(data.type, [data], {});
        }

        return comp;
    }

    JXG.createFlexCircle = createFlexCircle;
    JXG.registerElement('flexcircle', JXG.createFlexCircle);

    const createOriginCircle = (board, radius) => {
        return board.create("flexcircle", [{ type: 'flexcircle', id: generateId(), coordsCenter: [0, 0], radius: radius }], {});
    };

    const createGeoObjectFromState = (board, gState) => {
        return board.create(gState.type, [gState], {});
    }

    const optionsText = '<option value="nochoice"></option><option value="-Im">-Im/cm</option><option value="-Re">-Re/cm</option><option value="Im">Im/cm</option><option value="Re">Re/cm</option>';
    const xmin = -10;
    const xmax = 11;
    const ymin = -8.5;
    const ymax = 12.5;
    const board = JXG.JSXGraph.initBoard(divid, {
        boundingbox: [xmin, ymax, xmax, ymin],
        axis: true,
        showCopyright: false,
        keepAspectRatio: true,
        defaultAxes: {
            x: {
                name: '<select name="xAxisChoice" id="xAxisChoice">' + optionsText + '</select>',
                withLabel: true,
                label: {
                    position: 'rt',
                    offset: [-65, -30],
                    cssStyle: 'font-weight: bold;'
                },
                ticks: {
                    insertTicks: false, // Turn off automatic tick placing
                    minorTicks: 1,      // One minor tick between two major ticks
                    minorHeight: -1,    // Minor ticks are finitely long, too
                    ticksDistance: 1,    // Major ticks are positioned at multiples of one
                    //label: { fontSize: 12, display: 'html', cssClass: 'tickLabels' }
                }
            },
            y: {
                name: '<select name="yAxisChoice" id="yAxisChoice">' + optionsText + '</select>',
                withLabel: true,
                label: {
                    position: 'rt',
                    offset: [-92, -5],
                    cssStyle: 'font-weight: bold;'
                },
                ticks: {
                    insertTicks: false, // Turn off automatic tick placing
                    minorTicks: 1,      // No minor ticks between major ticks
                    minorHeight: -1,
                    ticksDistance: 1,    // Major ticks are positioned at multiples of two
                    //label: { fontSize: 12, display: 'html', cssClass: 'tickLabels' }
                }
            }
        },
        zoom: {
            min: 1,
            max: 8
        },
    });

    /* Daten von STACK holen oder verbinden */
    var initialChoices = document.getElementById(ansAxisLabelsRef).value;
    var pAxisLabelsData = board.create('point', [0, 0], { visible: false, highlight: false, size: 0 });
    stack_jxg.bind_point(ansAxisLabelsRef, pAxisLabelsData);
    changeDropdownChoice('xAxisChoice', Math.round(pAxisLabelsData.X()));
    changeDropdownChoice('yAxisChoice', Math.round(pAxisLabelsData.Y()));

    document.addEventListener('change', (e) => {
        pAxisLabelsData.moveTo([document.getElementById('xAxisChoice').selectedIndex, document.getElementById('yAxisChoice').selectedIndex]);
    });
    var pstyle = { name: '', snapToGrid: false, snapSizeX: 0.1, snapSizeY: 0.1, size: 4, showInfobox: false };

    board.highlightInfobox = function (x, y, el) {
        var nCart = { 'real': x, 'imag': y };
        var nPolar = convert2Polar(nCart);
        /*multiply with i, if y-axis has Re */
        if (pAxisLabelsData.Y() == 4) {
            nPolar = { 'abs': nPolar.abs, 'angle': JXG.Math.mod(nPolar.angle - 90.0, 360) };
        }
        var r = nPolar.abs.toFixed(2);
        var phi = nPolar.angle.toFixed(2);
        this.infobox.setText('<div style="font-size: 12px; color: grey; background-color: white; border-radius: 4px; border: 1px solid grey"><span style="color: black; padding: 2px; white-space:nowrap;">(x= ' + x + ', y= ' + y + ')</span><hr style="margin: 2px 0px; border-width: 1px;"><span style="color: blue; padding: 2px; white-space:nowrap;">(r= ' + r + ', &phi;= ' + phi + '&deg;)</span></div>');
    };



    const buttonStyle = { frozen: true };

    var addCircleButton = board.create('button', [xmin + 1, ymin + 1, 'Kreis', () => {
        const fCirc1 = createOriginCircle(board, 1);
        state.objMap.set(fCirc1.id, fCirc1);
    }], { ...buttonStyle });
    var addLineButton = board.create('button', [xmin + 3, ymin + 1, 'Gerade', () => {
        const fLine1 = createOriginLine(board);
        state.objMap.set(fLine1.id, fLine1);
    }], { ...buttonStyle });


    var addVectorButton = null;
    if (options.withVectorButton) {
        addVectorButton = board.create('button', [xmin + 5.6, ymin + 1, 'Vektor', () => {
            const fVec1 = createOriginVector(board);
            state.objMap.set(fVec1.id, fVec1);
        }], { ...buttonStyle });
    }




    var yBtnPos = ymax - 1;

    if (options.checkSOK) {
        sokCheckbox = board.create('checkbox', [xmax - 4, yBtnPos, "Stromortskurve"], { fixed: true, frozen: true });
        JXG.addEvent(sokCheckbox.rendNodeCheckbox, 'change', function () {
            if (this.Value()) {
                state.sokID = state.selectedID;
            }
        }, sokCheckbox);
        yBtnPos -= 1;
    }

    if (options.checkBP) {
        bpCheckbox = board.create('checkbox', [xmax - 4, yBtnPos, "Betriebspunkt"], { fixed: true, frozen: true });
        JXG.addEvent(bpCheckbox.rendNodeCheckbox, 'change', function () {
            if (this.Value()) {
                state.bpID = state.selectedID;
            }
        }, bpCheckbox);
        yBtnPos -= 1;
    }


    var copySelectedObjectButton = board.create('button', [xmax - 4, yBtnPos, 'Objekt kopieren', () => {
        if (state.selectedID) {

            const selectedObj = state.objMap.get(state.selectedID);
            const newObj = selectedObj.createOriginCopy(board);
            state.objMap.set(newObj.id, newObj);
        }
    }], { ...buttonStyle });
    yBtnPos -= 1;

    var removeSelectedObjectButton = board.create('button', [xmax - 4, yBtnPos, 'Objekt löschen', () => {
        if (state.selectedID) {
            state.objMap.get(state.selectedID).removeFromBoard();
            state.objMap.delete(state.selectedID);
            state.selectedID = null;
        }
    }], { ...buttonStyle });
    yBtnPos -= 1;



    /***************************************/
    /* Tape measure and angle measure */
    const col5 = 'black';

    var angleStyle = { radius: 0.8, orthoType: 'sector', strokeColor: 'none', withLabel: false };
    var angleLabelStyle = { fontSize: 15, cssStyle: 'font-family: MJXZERO, MJXTEX', fixed: true };

    var myAttractors = [];
    /*
    for(var i = -6; i < 7; i++) {
      if(i==0) continue;
      myAttractors.push(board.create('point', [i, 0], {size: 6, showInfobox: false, color: 'transparent', highlightColor: 'transparent', withLabel: false, fixed: true, highlight: false}));
      myAttractors.push(board.create('point', [0, i], {size: 6, showInfobox: false, color: 'transparent', highlightColor: 'transparent', withLabel: false, fixed: true, highlight: false}));
    }
    */
    var tape = board.create('tapemeasure', [[5, -6.5], [10, -6.5]], { name: 'L', precision: options.tapePrecision });
    tape.point1.setAttribute({ ignoredSnapToPoints: [], attractorDistance: 5 });
    tape.point2.setAttribute({ ignoredSnapToPoints: [], attractorDistance: 5 });
    tape.label.setAttribute({ fontWeight: 'bold', strokeColor: 'white', cssStyle: 'backgroundColor: rgba(0, 0, 0, 0.7); padding: 3px' });

    const amPStyle = { showInfobox: false, withLabel: false, size: 6, strokeColor: col5, fillColor: 'transparent', highlightFillColor: 'transparent', attractors: myAttractors, attractorDistance: 0.7, snatchDistance: 0.7 };
    var amStart = board.create('point', [8, -5], { ...amPStyle });
    var amEnd = board.create('point', [5, -5], { ...amPStyle });
    var amCenter = board.create('point', [6.5, -5], { ...amPStyle });
    var amRightSeg = board.create('segment', [amStart, amCenter], { strokeColor: col5 });
    var amLeftSeg = board.create('segment', [amCenter, amEnd], { strokeColor: col5 });
    var angleMeasure = board.create('angle', [amStart, amCenter, amEnd], { label: { cssStyle: 'backgroundColor: rgba(0, 0, 0, 0.7); padding: 3px', strokeColor: 'white' }, fillColor: col5, strokeColor: col5, name: () => '&phi; = ' + JXG.Math.Geometry.trueAngle(amStart, amCenter, amEnd).toFixed(0) + '°' });
    var amGroup = board.create('group', [amStart, amCenter, amEnd]);
    amGroup.setTranslationPoints([amCenter]);
    /*Zeigerdiagramm*/
    if (options.withPhasorDiagram) {
        var col1 = JXG.paletteWong.blue;
        var col2 = JXG.paletteWong.red;
        var col3 = JXG.paletteWong.green;
        var collight1 = "rgba(0, 72, 178, 0.5)";
        var collight2 = "rgba(213, 94, 0, 0.5)";
        var collight3 = "rgba(0, 158, 115, 0.5)";
        const attDist = 0.3;
        const vecPointStyle = { color: "grey", size: 1, fixed: false, highlight: false, showInfobox: false, snapToGrid: false, snapToPoints: true, attractorDistance: attDist };
        const vecStyle = { withLabel: true, strokeWidth: 1, opacity: 0.75, lastArrow: { type: 2, size: 14 } };
        var pCoords = options.taZD;
        var ps = [];
        var vecs = [];
        var vecLabels = options.vecLabels;
        for (let i = 0, j = 0; i < pCoords.length; i++) {
            ps[i] = board.create("point", pCoords[i], { ...vecPointStyle, withLabel: false });
            if (i % 2 == 1) {
                vecs[j] = board.create("arrow", [ps[i - 1], ps[i]], { ...vecStyle, name: vecLabels[j], color: col1, label: { position: () => ps[i].X() <= 0 ? "lft" : "rt", color: "white", cssStyle: `background-color: ${collight1}; padding: 2px 4px; border-radius: 4px;` } });
                j = j + 1;
            }
        }
        var midpoints = [];
        var texts = [];
        for (let j = 0; j < vecs.length; j++) {
            midpoints[j] = board.create("midpoint", [vecs[j]], { size: 0, highlight: false, visible: false, withLabel: false });
            texts[j] = board.create("text", [() => midpoints[j].X(), () => midpoints[j].Y(), () => {
                var nCart = { 'real': vecs[j].point2.X() - vecs[j].point1.X(), 'imag': vecs[j].point2.Y() - vecs[j].point1.Y() };
                var nPolar = convert2Polar(nCart);
                /*multiply with i, if y-axis has Re */
                if (pAxisLabelsData.Y() == 4) {
                    nPolar = { 'abs': nPolar.abs, 'angle': JXG.Math.mod(nPolar.angle - 90.0, 360) };
                }
                var r = nPolar.abs.toFixed(1);
                var phi = nPolar.angle.toFixed(1);
                return r + " cm, " + phi + "&deg;";
            }], { visible: false, fontSize: 10, anchorX: 'middle', anchorY: 'middle', fontWeight: 'bold', strokeColor: 'white', cssStyle: 'backgroundColor: rgba(0, 0, 0, 0.7); padding: 3px' });
            ps[2 * j + 1].on("mouseover", () => { texts[j].setAttribute({ visible: true }); });
            ps[2 * j + 1].on("mouseout", () => { texts[j].setAttribute({ visible: false }); });
        }
        stack_jxg.bind_list_of(ansZDRef, ps);
    }


    const storedState = JSON.parse(document.getElementById(ansStateStorageRef).value);
    if (storedState != "" || (storedState && storedState.objMap == [])) {
        state.selectedID = storedState.selectedID;
        state.sokID = storedState.sokID;
        state.bpID = storedState.bpID;
        var createObjects = (value, key, map) => {
            map.set(key, createGeoObjectFromState(board, value));
        };
        var preparedState = new Map(storedState.objMap);
        preparedState.forEach(createObjects);
        state.objMap = preparedState;
        if ((state.sokID != "-1" || state.bpID != "-1") && state.selectedID) {
            if (sokCheckbox) sokCheckbox.rendNodeCheckbox.checked = state.selectedID == state.sokID;
            if (bpCheckbox) bpCheckbox.rendNodeCheckbox.checked = state.selectedID == state.bpID;
        }
    } else {
        /* do nothing */
    }


    const interpreteCoords = (coords, csystem) => {
        var m0 = -9999;
        var m1 = -9999;
        var c0 = csystem[0];
        var c1 = csystem[1];
        if (c0 == '-Im') {
            m0 = -coords[1];
        } else if (c0 == 'Im') {
            m0 = coords[1];
        } else if (c0 == '-Re') {
            m0 = -coords[0];
        } else if (c0 == 'Re') {
            m0 = coords[0];
        } else {
            /* do nothing */
        }

        if (c1 == '-Im') {
            m1 = -coords[1];
        } else if (c1 == 'Im') {
            m1 = coords[1];
        } else if (c1 == '-Re') {
            m1 = -coords[0];
        } else if (c1 == 'Re') {
            m1 = coords[0];
        } else {
            /* do nothing */
        }
        var mapped = [m0, m1];
        return mapped;
    };


    /* Muster-SOK anzeigen für x:=(-Im) und y:=Re */

    /*
    const solPStyle = {color: 'darkred'};
    const solVecStyle = {strokeColor: Colors.purple, strokeWidth: 2};
    const solHelperCircStyle = {strokeColor: Colors.orange, strokeWidth: 1};
    const solSOKStyle = {strokeColor: Colors.blue, strokeWidth: 3};
    const solLineStyle = {strokeColor: 'black', strokeWidth: 2};
    var p_Inenn_coords = interpreteCoords([{#xInenncm#}, {#yInenncm#}], ['-Im', 'Re']);
    var vec_Inenn = board.create("arrow", [[0, 0], p_Inenn_coords], {...solVecStyle});
    var p_Istill_coords = interpreteCoords([{#xIstillcm#}, {#yIstillcm#}], ['-Im', 'Re']);
    var vec_Istill = board.create("arrow", [[0, 0], p_Istill_coords], {...solVecStyle});
    const helper_circ_radius = Math.max(Math.abs(p_Istill_coords[0]), Math.abs(p_Inenn_coords[0]));
    var helper_circ_Istill = board.create('circle', [p_Istill_coords, helper_circ_radius], {...solHelperCircStyle});
    var helper_circ_Inenn = board.create('circle', [p_Inenn_coords, helper_circ_radius], {...solHelperCircStyle});
    var p_Istill = board.create('point', p_Istill_coords, {...solPStyle});
    var p_Inenn = board.create('point', p_Inenn_coords, {...solPStyle});
    var line_Inenn_Istill = board.create('line', [p_Istill, p_Inenn], {...solLineStyle, strokeWidth: 1});
    var midp_Inenn_Istill = board.create('midpoint', [p_Istill, p_Inenn], {...solPStyle});
    var line_perp = board.create('perpendicular', [line_Inenn_Istill, midp_Inenn_Istill], {...solLineStyle});
    var center_SOK = board.create('intersection', [board.defaultAxes.x, line_perp], {...solPStyle});
    var radius_SOK = JXG.Math.Geometry.distance(p_Istill_coords, [center_SOK.X(), center_SOK.Y()], 2);
    var circ_SOK = board.create('circle', [center_SOK, radius_SOK], {...solSOKStyle}); 
    
    var musterElements = [vec_Inenn, vec_Istill, helper_circ_Istill, helper_circ_Inenn, p_Istill, p_Inenn, line_Inenn_Istill, midp_Inenn_Istill, line_perp, center_SOK, circ_SOK];
    
    const showSolutionCB = board.create("checkbox", [xmax-8.5, ymin+1.5, "Lösung anzeigen (x= - Im, y= Re)"], {fixed: true, frozen: true});
    showSolutionCB.rendNodeCheckbox.checked = false;
    for(let i = 0; i < musterElements.length; i++) {
      musterElements[i].setAttribute({visible: false, fixed: true, strokeOpacity: 0.7, fillOpacity: 0.7, highlight: false});
    }
    JXG.addEvent(showSolutionCB.rendNodeCheckbox, 'change', function() {
      for(let i = 0; i < musterElements.length; i++) {
        musterElements[i].setAttribute({visible: this.Value()});
      }
    }, showSolutionCB);
    */

    function storeState() {
        /*console.log("storeState");*/
        if (state.sokID !== "-1") {
            /*console.log("sokID is not -1");*/
            var currentSOK = state.objMap.get(state.sokID);
            if (currentSOK) {
                const type = currentSOK.type;
                var coordsCenter = null;
                var radius = -1;
                if (type === "flexcircle") {
                    coordsCenter = [currentSOK.pCenter.X(), currentSOK.pCenter.Y()];
                    radius = currentSOK.computeRadius();
                }
                changeValue(ansSOKRef, JSON.stringify([type, coordsCenter, radius]));
            }
        } else if (options.checkSOK) {
            changeValue(ansSOKRef, JSON.stringify(["-1", [], -1]));
        }

        if (state.bpID !== "-1") {
            /*console.log("bpID is not -1");*/
            var currentBP = state.objMap.get(state.bpID);
            if (currentBP) {
                const type = currentBP.type;
                var coordsStart = null;
                var coordsEnd = null;
                /*console.log("type: " + type);*/
                if (type === "flexvector") {
                    coordsStart = [currentBP.pFirst.X(), currentBP.pFirst.Y()];
                    coordsEnd = [currentBP.pSecond.X(), currentBP.pSecond.Y()];
                    /*console.log(currentBP);*/
                }
                changeValue(ansBPRef, JSON.stringify([type, coordsStart, coordsEnd]));
            }
        } else if (options.checkBP) {
            changeValue(ansBPRef, JSON.stringify(["-1", [], []]));
        }


        var preparedStateMap = new Map(state.objMap);
        var processElements = (value, key, map) => {
            map.set(key, value.getState());
        }
        preparedStateMap.forEach(processElements);
        var preparedStateMapAsArray = Array.from(preparedStateMap);
        var prepState = {
            objMap: preparedStateMapAsArray,
            selectedID: state.selectedID,
            sokID: state.sokID,
            bpID: state.bpID,
        }
        changeValue(ansStateStorageRef, JSON.stringify(prepState));
    }

    board.on('update', storeState);


}; /* end of createConstructionBoard body */
/*********************************************/