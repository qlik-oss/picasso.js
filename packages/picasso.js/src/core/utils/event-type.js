/* global navigator */

export function detectPointerSupport(e) {
  if ('onpointerdown' in e && 'onpointerup' in e) {
    return true;
  }
  return false;
}

export function detectTouchSupport(e) {
  if (('ontouchstart' in e && 'ontouchend' in e) || navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}

export function isTouchEvent(e) {
  return !!e.changedTouches;
}

export function isValidTapEvent(e, eventInfo) {
  const isTouch = isTouchEvent(e);
  const ee = isTouch ? e.changedTouches[0] : e;
  const dt = Date.now() - eventInfo.time;
  const dx = isNaN(eventInfo.x) ? 0 : Math.abs(ee.clientX - eventInfo.x);
  const dy = isNaN(eventInfo.y) ? 0 : Math.abs(ee.clientY - eventInfo.y);

  return (e.button === 0 || isTouch) && !eventInfo.multiTouch && dx <= 12 && dy <= 12 && dt <= 300;
}
