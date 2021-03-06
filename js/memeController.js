'use strict';

var gCanvas;
var gCtx;
var gIsDeleteKeyDown = false;
var gUserImg;

function onInit() {
    createImgs();
    renderGallery();
    createMeme();
    renderCanvas();
    gCanvas = document.querySelector('canvas');
    gCtx = gCanvas.getContext('2d');
    initWebShareApi();
}

function renderGallery() {
    const elGallery = document.querySelector('.gallery');
    const strHTML = gImgs.map(img => {
        return `<div class="img" onclick="setMemeImg(${img.id})" style="background: url(${img.url}); 
        background-position: center center;
        background-size: cover;"></div>`;
    })
    elGallery.innerHTML = strHTML.join('');
}

function renderCanvas() {
    const elCanvasBox = document.querySelector('.canvas-box');
    elCanvasBox.innerHTML = '<canvas height="400" width="400"></canvas>';
}

function drawMeme() {
    var img = new Image();
    img.src = getImgUrl();

    // Drawing Image:
    if (gUserImg) renderImg(gUserImg);
    else gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);

    // Drawing Texts:
    gMeme.lines.forEach((line, idx) => {
        const x = line.coords.x;
        const y = line.coords.y;
        drawText(line.txt, x, y, idx);
        if (idx === gMeme.selectedLineIdx) {
            drawLineRect(x, y, idx);
        }
    })

    // Drawing Stickers:
    if (gStickers.length) drawExistStickers();
}

function drawText(text, x, y, idx) {
    const align = getTxtAlign(idx)
    gCtx.textAlign = align;

    console.log(align);
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = getStrokeColor(idx);
    gCtx.fillStyle = getfillColor(idx);
    gCtx.font = getFontProps(idx);
    gCtx.fillText(text, x, y);
    gCtx.strokeText(text, x, y);
}

function onSetLineTxt(txtInput) {
    if (!gMeme.selectedLineIdx) gMeme.selectedLineIdx = 0;
    var txt = '';
    if (gIsDeleteKeyDown) {
        txt = txtInput;
        deleteLineTxt(txt);
    } else {
        txt = (txtInput.length === 1) ? txtInput : txtInput.slice(-1);
        setLineTxt(txt);
    }
    drawMeme();
}

function getEventKey(event) {
    gIsDeleteKeyDown = (event.key === 'Backspace');
}

function showEditor() {
    document.querySelector('.gallery').style.display = 'none';
    setTimeout(() => {
        document.querySelector('.home-btn').style.display = 'block';
        document.querySelector('.editor').style.display = 'grid';
        document.querySelector('.navbar h1').innerText = 'EDITOR';
    }, 300);
}

function backHome() {
    document.querySelector('.home-btn').style.display = 'none';
    document.querySelector('.editor').style.display = 'none';
    document.querySelector('.gallery').style.display = 'grid';
    document.querySelector('.navbar h1').innerText = 'GALLERY';
    gMeme.selectedLineIdx = null;
    gUserImg = null;
    clearInputVal();
    resetColorInputs();
    clearCanvas();
    resetMeme();
    updatePlaceHolder(0);
    clearFacebookLogo();
    clearStickers();
    console.clear();
}

function clearCanvas() {
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
}

function onSwitchLine() {
    switchLine();
    const idx = getSelectedLineIdx();
    updatePlaceHolder(idx);
    clearInputVal();
    drawMeme();
}

function onIncreaseFontSize() {
    resizeFont('increase');
    drawMeme();
}

function onDecreaseFontSize() {
    resizeFont('decrease');
    drawMeme();
}

function onSetFontType(fontType) {
    setFontType(fontType);
    drawMeme();
}

function onAlign(side) {
    align(side);
    drawMeme();
}

function onMoveTxtLineUp() {
    moveTxtLine('up');
    drawMeme();
}

function onMoveTxtLineDown() {
    moveTxtLine('down');
    drawMeme();
}

function clearInputVal() {
    document.querySelector('#text-line').value = '';
}

function updatePlaceHolder(lineIdx) {
    document.querySelector('#text-line').placeholder = (lineIdx === 0) ? 'Text 1' : 'Text 2';
}

function drawLineRect(x, y, idx) {
    const txtWidth = gCtx.measureText(gMeme.lines[idx].txt).width;
    const fontSize = gMeme.lines[idx].size;
    gCtx.beginPath();
    gCtx.rect(x - (txtWidth / 2), y - fontSize + (fontSize / 10), txtWidth, fontSize);
    gCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    gCtx.fillRect(x - (txtWidth / 2), y - fontSize + (fontSize / 10), txtWidth, fontSize);
    gCtx.lineWidth = 5;
    gCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    gCtx.stroke();
}

function onFillTxtColor(color) {
    fillTxtColor(color);
    drawMeme();
}

function onStrokeTxtColor(color) {
    strokeTxtColor(color);
    drawMeme();
}

function resetColorInputs() {
    const black = '#000';
    document.querySelector('#txt-color').value = black;
    document.querySelector('#stroke-color').value = black;
}

function clearFacebookLogo() {
    document.querySelector('.facebook-box').innerHTML = '';
}

function cleanLineRect() {
    gMeme.selectedLineIdx = null;
    drawMeme();
}

// Download Method:
function downloadMeme(elLink) {
    cleanLineRect();
    const data = gCanvas.toDataURL();
    elLink.href = data;
    elLink.download = 'my-meme.jpg';
}

// Image Uploading Method:
function onImgInput(ev) {
    loadImageFromInput(ev, renderImg);
}

function loadImageFromInput(ev, onImageReady) {
    var reader = new FileReader();

    reader.onload = function (event) {
        var img = new Image();
        img.onload = onImageReady.bind(null, img);
        img.src = event.target.result;
        gUserImg = img;
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function renderImg(img) {
    gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
}
