// Original canvas drawing logic reference: https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
// Smooth line drawing logic reference: https://developpaper.com/canvas-advancement-how-to-draw-a-smooth-curve/

var canvasArea, canvas, ctx, layerList;
var x, y;

var layerArr = [];
var layerIndex = 0;

var points = [];
var beginPoint = null;

var drawingFlag = false;
const brush = Symbol('brush');
const eraser = Symbol('eraser');
const bucket = Symbol('bucket');
var toolArr = [
    {
        Id: 1,
        Mode: brush,
        Color: 'black',
        Width: 10
    },
    {
        Id: 2,
        Mode: eraser,
        Color: null,
        Width: 10
    },
    {
        Id: 3,
        Mode: bucket,
        Color: 'black',
        Width: null
    }
];
var selTool = toolArr[0];

$(document).ready(
    function () {
        canvasArea = $('#canvasArea');
        layerList = $('#layerList');

        addLayer();
    }
);

$('#canvasArea')
    .on('mousedown',
        'canvas',
        function(e) {
            //console.log('Mouse down');
            canvas_mouseDown(e);
        }
    )
    .on('mouseup',
        'canvas',
        function(e) {
            //console.log('Mouse up');
            canvas_mouseUp(e);
        }
    )
    .on('mousemove',
        'canvas',
        function(e) {
            //console.log('Mouse is moving!!');
            canvas_mouseMove(e);
        }
    )
    .on('mouseout',
        'canvas',
        function(e) {
            //console.log('Mouse is out!');
            canvas_mouseOut(e);
        }
    );

$('#newFileButton').on('click',
    function() {
        newFile();
    }
);

$('#exportButton').on('click', 
    function() {
        exportImage();
    }
);

$('#clearLayerButton').on('click',
    function() {
        clearLayer();
    }
);

$('#brushToolButton').on('click',
    function() {
        changeToBrush();
    }
);

$('#eraserToolButton').on('click',
    function() {
        changeToEraser();
    }
);

$('#addLayerButton').on('click',
    function() {
        addLayer();
    }
);

$('#deleteLayerButton').on('click',
    function() {
        deleteLayer();
    }
);

$('#layerList').on('click',
    '.layerLabel',
    function() {
        canvas = $('#' + this.innerHTML)[0];
        ctx = canvas.getContext('2d');
        console.log(canvas.id);
    }
);

$('#toolWidthInput').on('change',
    function() {
        console.log('changed to: ' + this.value);
        changeWidth(this.value);
    }
);

$('#toolWidthSlider').on('change',
    function() {
        console.log('changed to: ' + this.value);
        changeWidth(this.value);
    }
);

$('.colorSwatch').on('click',
    function() {
        changeColor($(this));
    }
);

function canvas_mouseDown(e) {
    drawingFlag = true;

    updateCoord(e);

    if(e.shiftKey) {
        beginPoint = points[0];
        endPoint = points[1];
        switch (selTool.Mode) {
            case brush:
                drawLine(beginPoint, endPoint);
                break;
            case eraser:
                eraseLine(beginPoint, endPoint);
                break;
            default:
                break;
        };
    }
    else {
        points = points.slice(-1);
        beginPoint = points[0];
        switch (selTool.Mode) {
            case brush:
                drawDot(beginPoint);
                break;
            case eraser:
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
            switch (selTool.Mode) {
                case brush:
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
                case eraser:
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

    switch (selTool.Mode) {
        case brush:
            if(points.length > 3) {
                let lastTwoPoints = points.slice(-2);
                let controlPoint = lastTwoPoints[0];
                let endPoint = lastTwoPoints[1];
                drawCurve(beginPoint, controlPoint, endPoint);
            }
            break;
        case eraser:
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
        switch (selTool.Mode) {
            case brush:
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
            case eraser:
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
    x = e.clientX - canvasArea.offset().left  + window.scrollX;
    y = e.clientY - canvasArea.offset().top + window.scrollY;

    points.push({x,y});
}

function drawDot(beginPoint) {
    ctx.beginPath();

    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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

    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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
    
    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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
    
    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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

    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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

    ctx.strokeStyle = selTool.Color;
    ctx.lineWidth = selTool.Width;
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
    selTool = toolArr.find(a => a.Mode == brush);
    console.table(selTool);
    changeWidth(selTool.Width);
    $('.toolIcon').css('fill', 'whitesmoke');
    $('#brushToolButton').css('fill', 'lightcoral');
}

function changeToEraser() {
    selTool = toolArr.find(a => a.Mode == eraser);
    console.table(selTool);
    changeWidth(selTool.Width);
    $('.toolIcon').css('fill', 'whitesmoke');
    $('#eraserToolButton').css('fill', 'lightcoral');
}

function changeColor(item) {
    let index = toolArr.findIndex(a => a.Mode == brush);
    toolArr[index].Color = item.css('background-color');
    changeToBrush();
}

function changeWidth(newWidth) {
    let selToolIndex = toolArr.findIndex(a => a.Mode == selTool.Mode);
    toolArr[selToolIndex].Width = newWidth;
    selTool.Width = newWidth;
    console.table(toolArr);
    $('#toolWidthInput').val(newWidth);
    $('#toolWidthSlider').val(newWidth);
}

function newFile() {
    canvasArea.empty();
    layerArr = [];
    layerIndex = 0;

    addLayer();
}

// Reference: https://daily-dev-tips.com/posts/vanilla-javascript-save-canvas-as-an-image/
function exportImage() {
    let exCanvas = document.createElement('canvas');
    exCanvas.width = canvasArea.innerWidth();
    exCanvas.height = canvasArea.innerHeight();
    exCanvas.offsetLeft = 0;
    exCanvas.offsetTop = 0;

    let exCtx = exCanvas.getContext('2d');
    exCtx.fillStyle = 'white';
    exCtx.fillRect(0, 0, exCanvas.width, exCanvas.height);
    layerArr.forEach(layer => {
        exCtx.drawImage($('#' + layer.elementId)[0], 0, 0);
    });

    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = exCanvas.toDataURL();
    link.click();
    link.delete;
    exCanvas.remove();
}

function addLayer() {
    let newLayerObj = {
        Id: layerIndex,
        elementId: 'Layer' + layerIndex
    };

    if (layerArr.length == 0) {
        layerArr.push(newLayerObj);
    }
    else {
        let selLayerPos = layerArr.findIndex(a => a.elementId == canvas.id);
        console.log(selLayerPos);
        if (selLayerPos == (layerArr.length - 1)) {
            layerArr.push(newLayerObj);
        }
        else {
            console.log('Layer added in middle');
            let layerArrBefore = layerArr.slice(0, selLayerPos + 1);
            let layerArrAfter = layerArr.slice(selLayerPos + 1);
            console.table(layerArrBefore);
            console.table(layerArrAfter);

            layerArr = [].concat(layerArrBefore, newLayerObj, layerArrAfter);

            console.table(layerArr);
        }
    }

    layerIndex ++;

    canvas = document.createElement('canvas');
    canvas.id = newLayerObj.elementId;
    canvas.classList.add('layer');
    canvas.width = canvasArea.innerWidth();
    canvas.height = canvasArea.innerHeight();
    canvas.offsetLeft = 0;
    canvas.offsetTop = 0;

    canvasArea.append(canvas);

    ctx = canvas.getContext('2d');

    updateLayerOrder();
    updateLayerListDisplay();
}

function deleteLayer() {
    console.table(layerArr);

    const canvasLayerIndex = layerArr.findIndex(a => a.elementId == canvas.id);
    layerArr.splice(canvasLayerIndex, 1);
    canvas.remove();

    console.table(layerArr);

    if(canvasLayerIndex - 1 < 0) {
        canvas = $('#' + layerArr[0].elementId)[0];
    }
    else {
        let newIndex = canvasLayerIndex - 1;
        console.log(newIndex);
        canvas = $('#' + layerArr[newIndex].elementId)[0];
    }
    console.log(canvas.id);
    ctx = canvas.getContext('2d');

    updateLayerOrder();
    updateLayerListDisplay();
}

function clearLayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateLayerOrder() {
    for (let i = 0; i < layerArr.length; i++) {
        let element = layerArr[i];
        let canvasLayer = $('#' + element.elementId);
        canvasLayer.css('z-index', 3 + i);
    }
}

function updateLayerListDisplay() {
    layerList.empty();
    for (let i = (layerArr.length - 1); i > -1; i--) {
        let element = layerArr[i];
        let layerLabel = document.createElement('option');
        layerLabel.classList.add('layerLabel');
        layerLabel.innerHTML = element.elementId;
        layerList.append(layerLabel);
    }

    layerList.children('option:selected').removeAttr('selected');
    layerList.find(`:contains('${canvas.id}')`).attr('selected', 'selected');
}