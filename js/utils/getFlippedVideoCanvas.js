export function getFlippedVideoCanvas(video, count) {
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = 1280;
  frameCanvas.height = 720;
  const frameCtx = frameCanvas.getContext("2d");
  frameCtx.translate(frameCanvas.width, 0);
  frameCtx.scale(-1, 1);
  frameCtx.drawImage(video, 0, 0);

  return frameCanvas;
}
