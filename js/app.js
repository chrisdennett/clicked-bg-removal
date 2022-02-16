import { drawHorizontalSlitScanToCanvas } from "./utils/drawHorizontalSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { globalState, initControls } from "./controls.js";

// app elements
const appElement = document.querySelector("#app");
const controls = document.querySelector("#controls");
const artCanvas = document.querySelector("#artCanvas");
const video = document.querySelector("#videoElement");

// set up controls
const params = initControls(controls);

let bgCanvas;

function onKeyDown(e) {
  if (e.key === "0") {
    bgCanvas = getFlippedVideoCanvas(video);
  }
}

// global defaults

// set up controls, webcam etc
export function setup() {
  // hide controls by default and if app is right clicked
  appElement.addEventListener("contextmenu", onAppRightClick);
  controls.style.display = "none";

  // keyboard controls
  document.addEventListener("keydown", onKeyDown);

  function onAppRightClick(e) {
    e.preventDefault();
    if (controls.style.display === "none") {
      controls.style.display = "inherit";
    } else {
      controls.style.display = "none";
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720 },
      })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("video error: ", error);
      });
  }
}

// draw loop
export function draw() {
  const frame = getFlippedVideoCanvas(video);
  const { width: inputW, height: inputH } = frame;

  artCanvas.width = inputW;
  artCanvas.height = inputH;
  const outCtx = artCanvas.getContext("2d");

  const threshold = parseInt(params.threshold.value);

  if (!bgCanvas) {
    outCtx.drawImage(frame, 0, 0);
  } else {
    const inCtx = frame.getContext("2d");
    const inImgData = inCtx.getImageData(0, 0, inputW, inputH);
    const inPixels = inImgData.data;

    const bgCtx = bgCanvas.getContext("2d");
    const bgImgData = bgCtx.getImageData(0, 0, inputW, inputH);
    const bgPixels = bgImgData.data;

    // outCtx.clearRect(0, 0, inputW, inputH);

    for (let y = 0; y < inputH; y++) {
      for (let x = 0; x < inputW; x++) {
        const i = (y * inputW + x) * 4;

        const r = inPixels[i];
        const g = inPixels[i + 1];
        const b = inPixels[i + 2];

        const bgR = bgPixels[i];
        const bgG = bgPixels[i + 1];
        const bgB = bgPixels[i + 2];

        let colourIsSameAsBg = findIsColourSameAsBg(
          r,
          g,
          b,
          bgR,
          bgG,
          bgB,
          threshold
        );

        if (colourIsSameAsBg) {
          inPixels[i + 3] = 0;
        } else {
          inPixels[i] = r;
          inPixels[i + 1] = g;
          inPixels[i + 2] = b;
        }
      }
    }

    outCtx.putImageData(inImgData, 0, 0);
    // outCtx.drawImage(frame, 0, 0);
  }

  window.requestAnimationFrame(draw);
}

function findIsColourSameAsBg(r, g, b, bgR, bgG, bgB, threshold) {
  if (r < bgR - threshold) return false;
  if (r > bgR + threshold) return false;

  if (g < bgG - threshold) return false;
  if (g > bgG + threshold) return false;

  if (b < bgB - threshold) return false;
  if (b > bgB + threshold) return false;

  return true;
}
