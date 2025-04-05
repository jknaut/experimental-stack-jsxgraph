/** Creates a scatter plot matrix
 * This specific extension will consume the board. (This is unusual for extensions...)
 * Example usage:
 * var board = JXG.JSXGraph.initBoard(divid, {axis: false, grid: false, showCopyright: false, showNavigation: false, boundingbox: [-5, 5, 5, -5], keepaspectratio: false, pan: {enabled: false}, zoom: {wheel: false}});
 * var matrix = board.create("scatterplotmatrix", [dataSets, dataSetLabels], {withDimLabels: true, cellPadding: 0.25});
*/
function createSplom(board, parents, attributes) {
        /* Date of last change: 05/04/2025 */
        /* Created by: Johannes Knaut, OTH Amberg-Weiden */

        var dataSets = parents[0];
        var dataSetLabels = parents[1];

        var numAttributes = dataSets[0].length;
        var withDimLabels = attributes.withDimLabels;
        var cellPadding = attributes.cellPadding;
        var dataLen = dataSets[0][0].length;

        var cellWidth = 1 + 2 * cellPadding;
        var cellHeight = cellWidth;
        var xmin = 0;
        var xmax = numAttributes * cellWidth;
        var ymin = 0;
        var ymax = numAttributes * cellWidth;

        board.setBoundingBox([xmin - cellWidth, ymax + cellHeight, xmax, ymin]);

        var dimLabelStyle = { useMathjax: true, parse: false, fontSize: 15, anchorX: "middle", anchorY: "middle" };
        var pstyle = { withLabel: false, size: 1, strokeColor: "#0072B2", strokeWidth: 1, fillColor: "white", highlight: false, fixed: true, showInfobox: false };

        function genCloud(board, dataSet, x, y, relX, relY, col) {
                x = x - 1;
                y = y - 1;

                var dataX = dataSet[x];
                var dataY = dataSet[y];

                board.suspendUpdate();
                for (let i = 0; i <= dataLen; i++) {
                        board.create("point", [relX + cellPadding + dataX[i], relY + cellPadding + dataY[i]], { ...pstyle, strokeColor: col });
                }
                board.unsuspendUpdate();
        }

        var maxX = numAttributes;
        var maxY = numAttributes;

        /*color set*/
        var cols = [JXG.palette.blue, JXG.palette.red, JXG.palette.green, JXG.palette.purple];

        /*point clouds*/
        for (let d = 0; d < dataSets.length; d++) {
                for (let i = 1; i <= maxX; i++) {
                        for (let j = 1; j <= maxY; j++) {
                                genCloud(board, dataSets[d], i, j, (i - 1) * cellWidth, (maxY - j) * cellHeight, cols[d]);
                        }
                }
        }

        /*inner table segments*/
        for (let i = -1; i < maxX; i++) {
                board.create(
                        "segment",
                        [
                                [i * cellWidth, 0],
                                [i * cellWidth, (maxY + 1) * cellHeight],
                        ],
                        { highlight: false, strokeWidth: 1, color: "grey" }
                );
        }
        for (let j = 1; j < maxY + 1; j++) {
                board.create(
                        "segment",
                        [
                                [-1 * cellWidth, j * cellHeight],
                                [maxX * cellWidth, j * cellHeight],
                        ],
                        { highlight: false, strokeWidth: 1, color: "grey" }
                );
        }

        function createDimLabels(withDim) {
                if (withDim) {
                        /* top labels */
                        for (let i = 1; i <= maxX; i++) {
                                var midX = i * cellWidth - 0.5 * cellWidth;
                                var midY = maxY * cellHeight + 0.5 * cellHeight;
                                board.create("text", [midX, midY, dataSetLabels[i - 1]], { ...dimLabelStyle });
                        }
                        /*side labels*/
                        for (let j = maxY; j >= 1; j--) {
                                var midX = -0.5 * cellWidth;
                                var midY = (j - 0.5) * cellHeight;
                                board.create("text", [midX, midY, dataSetLabels[maxY - j]], { ...dimLabelStyle });
                        }
                } else {
                        board.setBoundingBox([xmin, ymax, xmax, ymin]);
                }
        }
        createDimLabels(withDimLabels);

        const comp = new JXG.Composition({});

        comp.setAttribute = (attributes) => {
                if ("withDimLabels" in attributes) {
                        withDimLabels = attributes.withDimLabels;
                        createDimLabels(withDimLabels);
                }
        };

        return comp;
}

JXG.createSplom = createSplom;
JXG.registerElement("scatterplotmatrix", JXG.createSplom);
