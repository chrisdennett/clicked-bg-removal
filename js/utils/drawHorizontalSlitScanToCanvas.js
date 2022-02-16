export function drawHorizontalSlitScanToCanvas({
  src,
  target,
  drawSlice,
  params,
}) {
  const { webcamPosition, scanStartPos, isReflected, sliceSize } = params;
  const sliceSizeInt = parseInt(sliceSize.value);

  const ctx = target.getContext("2d");

  const srcSectionW = scanStartPos.value * src.width;
  const scale = target.height / src.height;
  const liveWebcamSectionW = srcSectionW * scale;

  if (webcamPosition.value === "start") {
    drawLiveWebcamSectionAtStart({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionW,
      liveWebcamSectionW,
    });
  } else if (webcamPosition.value === "middle") {
    drawLiveWebcamSectionInMiddle({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionW,
      liveWebcamSectionW,
    });
  } else {
    drawLiveWebcamSectionAtEnd({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionW,
      liveWebcamSectionW,
    });
  }

  if (!drawSlice) return;

  if (webcamPosition.value === "start") {
    drawSliceMovingRight({
      ctx,
      target,
      liveWebcamSectionW,
      sliceSize: sliceSizeInt,
    });
  } else if (webcamPosition.value === "middle") {
    drawSliceMovingAwayFromMiddle({
      ctx,
      target,
      liveWebcamSectionW,
      sliceSize: sliceSizeInt,
    });
  } else {
    drawSliceMovingLeft({
      ctx,
      target,
      liveWebcamSectionW,
      sliceSize: sliceSizeInt,
    });
  }
}

//
// AT LEFT MOVING RIGHT
//
function drawLiveWebcamSectionAtStart({
  target,
  src,
  isReflected,
  srcSectionW,
  liveWebcamSectionW,
}) {
  const ctx = target.getContext("2d");
  //   const h = src.height;

  // draw live webcam portion of screen
  const source = { x: 0, y: 0, w: srcSectionW, h: src.height };
  const dest = { x: 0, y: 0, w: liveWebcamSectionW, h: target.height };
  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    dest.x,
    dest.y,
    dest.w,
    dest.h
  );

  // draw the top to the bottom, but flipped
  if (isReflected) {
    const halfH = dest.h / 2;

    ctx.save();
    ctx.translate(0, halfH * 2);
    ctx.scale(1, -1);
    ctx.drawImage(
      target,
      dest.x,
      dest.y,
      dest.w,
      dest.h / 2,
      dest.x,
      dest.y,
      dest.w,
      halfH
    );
    ctx.restore();
  }
}
function drawSliceMovingRight({ ctx, target, liveWebcamSectionW, sliceSize }) {
  const widthToShiftRight = target.width + liveWebcamSectionW - sliceSize;

  const from = {
    x: liveWebcamSectionW - sliceSize,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };
  const to = {
    x: liveWebcamSectionW,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}

//
// AT RIGHT MOVING LEFT
//
function drawSliceMovingLeft({ ctx, target, liveWebcamSectionW, sliceSize }) {
  const liveWebcamLeft = target.width - liveWebcamSectionW;
  const widthToShiftLeft = liveWebcamLeft + sliceSize;

  const from = {
    x: 0,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };
  const to = {
    x: -sliceSize,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}
function drawLiveWebcamSectionAtEnd({
  target,
  src,
  isReflected,
  srcSectionW,
  liveWebcamSectionW,
}) {
  const ctx = target.getContext("2d");
  //   const h = src.height;

  // draw live webcam portion of screen
  const source = {
    x: src.width - srcSectionW,
    y: 0,
    w: srcSectionW,
    h: src.height,
  };
  const dest = {
    x: target.width - liveWebcamSectionW,
    y: 0,
    w: liveWebcamSectionW,
    h: target.height,
  };
  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    dest.x,
    dest.y,
    dest.w,
    dest.h
  );

  // improve the colours by redrawing it
  // ctx.save();
  // ctx.globalCompositeOperation = "multiply";
  // ctx.globalAlpha = 0.7;
  // ctx.drawImage(
  //   src,
  //   source.x,
  //   source.y,
  //   source.w,
  //   source.h,
  //   dest.x,
  //   dest.y,
  //   dest.w,
  //   dest.h
  // );
  // ctx.restore();

  // draw the top to the bottom, but flipped
  if (isReflected) {
    const halfH = dest.h / 2;

    ctx.save();
    ctx.translate(0, halfH * 2);
    ctx.scale(1, -1);
    ctx.drawImage(
      target,
      dest.x,
      dest.y,
      dest.w,
      dest.h / 2,
      dest.x,
      dest.y,
      dest.w,
      halfH
    );
    ctx.restore();
  }
}

//
// IN MIDDLE MOVING LEFT and RIGHT
//
function drawLiveWebcamSectionInMiddle({
  target,
  src,
  isReflected,
  srcSectionW,
  liveWebcamSectionW,
}) {
  const ctx = target.getContext("2d");
  const targMiddle = target.width / 2;
  const halfSection = liveWebcamSectionW / 2;
  const targX = targMiddle - halfSection;

  // remove from left and right when cropping source
  const srcMiddle = src.width / 2;
  const halfSrcSection = srcSectionW / 2;
  const srcX = srcMiddle - halfSrcSection;

  // draw live webcam portion of screen
  const source = {
    x: srcX,
    y: 0,
    w: srcSectionW,
    h: src.height,
  };
  const dest = {
    x: targX,
    y: 0,
    w: liveWebcamSectionW,
    h: target.height,
  };
  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    dest.x,
    dest.y,
    dest.w,
    dest.h
  );

  // draw the top to the bottom, but flipped
  if (isReflected) {
    const halfH = dest.h / 2;

    ctx.save();
    ctx.translate(0, halfH * 2);
    ctx.scale(1, -1);
    ctx.drawImage(
      target,
      dest.x,
      dest.y,
      dest.w,
      dest.h / 2,
      dest.x,
      dest.y,
      dest.w,
      halfH
    );
    ctx.restore();
  }
}
function drawSliceMovingAwayFromMiddle({
  ctx,
  target,
  liveWebcamSectionW,
  sliceSize,
}) {
  const middleX = target.width / 2;
  const halfSectionW = liveWebcamSectionW / 2;
  const leftOfSection = middleX - halfSectionW;
  const widthToShiftLeft = leftOfSection + sliceSize;

  let from = {
    x: 0,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };
  let to = {
    x: -sliceSize,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);

  // shifting right
  const rightOfSection = middleX + halfSectionW;
  const widthToShiftRight = rightOfSection - sliceSize;

  from = {
    x: rightOfSection - sliceSize,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };
  to = {
    x: rightOfSection,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}

// REMOVED TO SPEED UP ON THE PI
//
// improve the colours by redrawing it
// ctx.save();
// ctx.globalCompositeOperation = "multiply";
// ctx.globalAlpha = 0.7;
// ctx.drawImage(
//   src,
//   source.x,
//   source.y,
//   source.w,
//   source.h,
//   dest.x,
//   dest.y,
//   dest.w,
//   dest.h
// );
// ctx.restore();
