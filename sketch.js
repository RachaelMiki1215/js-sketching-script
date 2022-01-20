/*var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}*/

var canvas, ctx;
var prevX, prevY, currX, currY;

var drawingFlag = false;
var toolMode = 'brush';
var color = 'black';
var markerWidth = 10;

function init() {
    canvas = document.getElementById('canvas');
    canvasContainer = document.getElementById('canvasContainer')
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;
    ctx = canvas.getContext('2d');

    // TODO: Fixed jagged line when pivoting cursor.
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

    // TODO: Figure out how to resize canvas based on window size
    /*canvasContainer.addEventListener(
        'resize',
        function() {
            canvas.width = canvasContainer.offsetWidth;
            canvas.height = canvasContainer.offsetHeight;
        }
    )*/
}

function canvas_mouseDown(e) {
    //console.log('Mouse has been pressed at: (' + e.clientX + ',' + e.clientY + ')');
    
    drawingFlag = true;

    updateCoord(e);
}

function canvas_mouseUp(e) {
    //console.log('Mouse has been released at: (' + e.clientX + ',' + e.clientY + ')');
    
    drawingFlag = false;
    isDot = false;

    updateCoord(e);

    drawPath();
}

function canvas_mouseMove(e) {
    if(drawingFlag){
        //console.log('Mouse drag at: (' + e.clientX + ',' + e.clientY + ')');

        updateCoord(e);

        if(drawingFlag){
            drawPath();
        }
    }
}

function updateCoord(e) {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

}

function drawPath(toolMode) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = markerWidth;
    ctx.lineCap = "round";
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.closePath();
    ctx.stroke();
}

function changeColor(item) {
    color = document.getElementById(item.id).style.backgroundColor;
    //console.log(item.id);
}


// TODO: Figure out how to go back to original color when going back to brush mode.
function changeToEraser(){
    color = 'white';
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// TODO: Make this work
function saveCanvas() {
    var image = canvas.toDataURL("image/png").replace("image/png");
    window.location.href=image;
}