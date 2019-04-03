import extend from 'extend';

function roundRect(rect) {
  rect.x = Math.floor(rect.x);
  rect.y = Math.floor(rect.y);
  rect.width = Math.floor(rect.width);
  rect.height = Math.floor(rect.height);
}

export function resolveContainerRects(rect, settings) {
  const containerRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const logicalContainerRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  // Check input object for size
  containerRect.width = rect.width || 0;
  containerRect.height = rect.height || 0;
  if (typeof settings.size !== 'undefined') {
    containerRect.width = isNaN(settings.size.width)
      ? containerRect.width
      : settings.size.width;
    containerRect.height = isNaN(settings.size.height)
      ? containerRect.height
      : settings.size.height;
  }

  if (typeof settings.logicalSize !== 'undefined') {
    logicalContainerRect.width = isNaN(settings.logicalSize.width)
      ? containerRect.width
      : settings.logicalSize.width;
    logicalContainerRect.height = isNaN(settings.logicalSize.height)
      ? containerRect.height
      : settings.logicalSize.height;
    logicalContainerRect.align = isNaN(settings.logicalSize.align)
      ? 0.5
      : Math.min(Math.max(settings.logicalSize.align, 0), 1);
    logicalContainerRect.preserveAspectRatio = settings.logicalSize.preserveAspectRatio;
  } else {
    logicalContainerRect.width = containerRect.width;
    logicalContainerRect.height = containerRect.height;
    logicalContainerRect.preserveAspectRatio = false;
  }

  roundRect(logicalContainerRect);
  roundRect(containerRect);

  return { logicalContainerRect, containerRect };
}

export function resolveSettings(s) {
  const settings = {
    center: {
      minWidthRatio: 0.5,
      minHeightRatio: 0.5,
      minWidth: 0,
      minHeight: 0
    }
  };

  extend(true, settings, s);

  settings.center.minWidthRatio = Math.min(
    Math.max(settings.center.minWidthRatio, 0),
    1
  ); // Only accept value between 0-1
  settings.center.minHeightRatio = Math.min(
    Math.max(settings.center.minHeightRatio, 0),
    1
  ); // Only accept value between 0-1
  settings.center.minWidth = Math.max(settings.center.minWidth, 0); // Consider <= 0 to be falsy and fallback to ratio
  settings.center.minHeight = Math.max(settings.center.minHeight, 0); // Consider <= 0 to be falsy and fallback to ratio

  return settings;
}
