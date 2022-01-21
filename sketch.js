var canvas, ctx, canvasContainer;
var x, y;

var points = [];
var beginPoint = null;

var drawingFlag = false;
var toolMode = 'brush';
var color = 'black';
var markerWidth = 10;

function init() {
    canvas = document.getElementById('canvas');
    canvasContainer = document.getElementById('canvasContainer');
    ctx = canvas.getContext('2d');

    canvas.addEventListener(
        'mousedown',
        function(e) {
            canvas_mouseDown(e);
        }
    );
    canvas.addEventListener(
        'mouseup',
        function(e) {
            canvas_mouseUp(e);
        }
    );
    canvas.addEventListener(
        'mousemove',
        function(e) {
            canvas_mouseMove(e);
        }
    );
    canvas.addEventListener(
        'mouseout',
        function(e) {
            canvas_mouseOut(e);
        }
    );
}

function canvas_mouseDown(e) {
    drawingFlag = true;

    updateCoord(e);

    if(e.shiftKey) {
        beginPoint = points[0];
        endPoint = points[1];
        switch (toolMode) {
            case 'brush':
                drawLine(beginPoint, endPoint);
                break;
            case 'eraser':
                eraseLine(beginPoint, endPoint);
                break;
            default:
                break;
        };
    }
    else {
        points = points.slice(-1);
        beginPoint = points[0];
        switch (toolMode) {
            case 'brush':
                drawDot(beginPoint);
                break;
            case 'eraser':
                eraseDot(beginPoint);
                break;
            default:
                break;
        };
    };
}

function canvas_mouseMove(e) {
    if(drawingFlag){
        updateCoord(e);

        if(drawingFlag){
            switch (toolMode) {
                case 'brush':
                    if(points.length > 3) {
                        let lastTwoPoints = points.slice(-2);
                        let controlPoint = lastTwoPoints[0];
                        x = (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2;
                        y = (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2;
                        let endPoint = {x, y}
                        drawCurve(beginPoint, controlPoint, endPoint);
                        beginPoint = endPoint;
                    }
                    break;
                case 'eraser':
                    if(points.length > 3) {
                        let lastTwoPoints = points.slice(-2);
                        let controlPoint = lastTwoPoints[0];
                        x = (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2;
                        y = (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2;
                        let endPoint = {x, y}
                        eraseCurve(beginPoint, controlPoint, endPoint);
                        beginPoint = endPoint;
                    }
                    break; 
                default:
                    break;
            }
        }
    }
}

function canvas_mouseUp(e) {
    drawingFlag = false;

    updateCoord(e);

    switch (toolMode) {
        case 'brush':
            if(points.length > 3) {
                let lastTwoPoints = points.slice(-2);
                let controlPoint = lastTwoPoints[0];
                let endPoint = lastTwoPoints[1];
                drawCurve(beginPoint, controlPoint, endPoint);
            }
            break;
        case 'eraser':
            if(points.length > 3) {
                let lastTwoPoints = points.slice(-2);
                let controlPoint = lastTwoPoints[0];
                let endPoint = lastTwoPoints[1];
                eraseCurve(beginPoint, controlPoint, endPoint);
            }
            break;
        default:
            break;
    }

    points = points.slice(-1);
    beginPoint = null;
}

function canvas_mouseOut(e) {

    updateCoord(e);

    if(drawingFlag) {
        switch (toolMode) {
            case 'brush':
                if(points.length > 3) {
                    let lastTwoPoints = points.slice(-2);
                    let controlPoint = lastTwoPoints[0];
                    let endPoint = lastTwoPoints[1];
                    drawCurve(beginPoint, controlPoint, endPoint);
                }
                else {
                    let lastTwoPoints = points.slice(-2);
                    drawLine(lastTwoPoints[0], lastTwoPoints[1]);
                }
                break;
            case 'eraser':
                if(points.length > 3) {
                    let lastTwoPoints = points.slice(-2);
                    let controlPoint = lastTwoPoints[0];
                    let endPoint = lastTwoPoints[1];
                    eraseCurve(beginPoint, controlPoint, endPoint);
                }
                else {
                    let lastTwoPoints = points.slice(-2);
                    eraseLine(lastTwoPoints[0], lastTwoPoints[1]);
                }
                break;
            default:
                break;
        }
    }

    drawingFlag = false;
    points = points.slice(-1);
    beginPoint = null;
}

function updateCoord(e) {
    x = e.clientX - canvas.offsetLeft + canvasContainer.scrollLeft + window.scrollX;
    y = e.clientY - canvas.offsetTop + canvasContainer.scrollTop + window.scrollY;

    points.push({x,y});
}

function drawDot(beginPoint) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'source-over'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.lineTo(beginPoint.x, beginPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function eraseDot(beginPoint) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'destination-out'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.lineTo(beginPoint.x, beginPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function drawLine(beginPoint, endPoint) {
    ctx.beginPath;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'source-over'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function eraseLine(beginPoint, endPoint) {
    ctx.beginPath;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'destination-out'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function drawCurve(beginPoint, controlPoint, endPoint) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'source-over'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function eraseCurve(beginPoint, controlPoint, endPoint) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    // Set to actually have colors for pixels
    ctx.globalCompositeOperation = 'destination-out'
    // Line ends will be round
    ctx.lineCap = "round";
    // Line joins (continuously drawn points/edges) will be round
    ctx.lineJoin = 'round';

    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);

    ctx.stroke();

    ctx.closePath();
}

function changeToBrush() {
    toolMode = 'brush';
}

function changeToEraser() {
    toolMode = 'eraser';
}

function changeColor(item) {
    color = document.getElementById(item.id).style.backgroundColor;
}

function changeWidth() {
    let markerWidthSliderVal = document.getElementById('markerWidthSlider').value;
    markerWidth = markerWidthSliderVal;
    document.getElementById('markerWidthDisplay').innerHTML = markerWidthSliderVal;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Reference: https://daily-dev-tips.com/posts/vanilla-javascript-save-canvas-as-an-image/
function exportCanvas() {
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
}