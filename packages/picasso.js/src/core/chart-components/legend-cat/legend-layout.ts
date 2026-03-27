import extend from 'extend';
/* eslint no-mixed-operators:0 */

export default function layout(
  rect,
  display,
  orientation,
  { itemRenderer, navigationRenderer, titleRenderer, isPreliminary = false }
) {
  let title;
  let content;
  let navigation;
  let preferredSize = 0;

  const paddedRect = {
    x: display.spacing,
    y: display.spacing,
    width: rect.width - 2 * display.spacing,
    height: rect.height - 2 * display.spacing,
  };

  title = {
    x: paddedRect.x,
    y: paddedRect.y,
    width: paddedRect.width,
    height: titleRenderer.spread(),
  };

  if (orientation === 'horizontal') {
    // const titleAtTop = false;
    // if (titleAtTop) { // this might be a nicer layout sometimes
    //   // |------------------|
    //   // |title             |
    //   // |------------|-----|
    //   // |content     | nav |
    //   // |------------|-----|

    //   // available space for items without navigation UI
    //   const availableExtentForItems = paddedRect.width;
    //   const availableSpreadForItems = paddedRect.height - (title.y + title.height) + 8;
    //   const isRtl = itemRenderer.direction() === 'rtl';
    //   itemRenderer.parallelize(availableExtentForItems, isPreliminary ? undefined : availableSpreadForItems);

    //   const navigationSize = itemRenderer.extent() > availableExtentForItems ? navigationRenderer.extent() : 0;
    //   content = {
    //     x: paddedRect.x,
    //     y: title.y + title.height,
    //     width: paddedRect.width - navigationSize,
    //     height: availableSpreadForItems
    //   };
    //   navigation = {
    //     x: content.x + content.width,
    //     y: title.y + title.height,
    //     width: navigationSize,
    //     height: paddedRect.height - (title.y + title.height) + 8
    //   };

    //   if (isRtl) { // switch navigation and content
    //     navigation.x = content.x;
    //     content.x = navigation.x + navigation.width;
    //     // totalContent.x = navigation.x;
    //   }
    //   preferredSize = title.height + Math.max(navigationRenderer.spread(), itemRenderer.spread());
    // } else {
    // |-----|------------|-----|
    // |title|content     | nav |
    // |-----|------------|-----|

    title = {
      x: paddedRect.x,
      y: paddedRect.y,
      width: titleRenderer.extent(),
      height: titleRenderer.spread(),
    };

    // available space for items without navigation UI
    const availableExtentForItems = paddedRect.width - title.width - (title.width ? display.spacing : 0);
    const availableSpreadForItems = paddedRect.height;
    itemRenderer.parallelize(availableExtentForItems, isPreliminary ? undefined : availableSpreadForItems);

    const navigationSize = itemRenderer.extent() > availableExtentForItems ? navigationRenderer.extent() : 0;
    const spread = itemRenderer.spread();
    const navigationSpread = navigationSize ? navigationRenderer.spread() : 0;
    content = {
      x: title.x + title.width + (title.width ? display.spacing : 0),
      y: paddedRect.y + Math.max(0, (navigationSpread - spread) / 2),
      width:
        paddedRect.width -
        navigationSize -
        title.width -
        (navigationSize ? display.spacing : 0) -
        (title.width ? display.spacing : 0),
      height: availableSpreadForItems,
    };
    navigation = {
      x: content.x + content.width + (navigationSize ? display.spacing : 0),
      y: paddedRect.y,
      width: navigationSize,
      height: paddedRect.height,
    };

    title.y = content.y;

    const isRtl = itemRenderer.direction() === 'rtl';
    if (isRtl) {
      // switch title, content and navigation
      navigation.x = paddedRect.x;
      content.x = navigation.x + navigation.width + (navigation.width ? display.spacing : 0);
      title.x = content.x + content.width + (title.width ? display.spacing : 0);
    }
    preferredSize = Math.max(title.height, navigationSpread, itemRenderer.spread());
    // }
  } else {
    // |------------|
    // |title       |
    // |------------|
    // |content     |
    // |------------|
    // |navigation  |
    // |------------|

    const availableExtentForItems = paddedRect.height - title.height - (title.height ? display.spacing : 0);
    const availableSpreadForItems = paddedRect.width;
    itemRenderer.parallelize(availableExtentForItems, isPreliminary ? undefined : availableSpreadForItems);

    const navigationSize = itemRenderer.extent() > availableExtentForItems ? navigationRenderer.extent() : 0;
    navigation = {
      x: paddedRect.x,
      y: paddedRect.y + paddedRect.height - navigationSize,
      width: paddedRect.width,
      height: navigationSize,
    };

    content = {
      x: paddedRect.x,
      y: title.y + title.height + (title.height ? display.spacing : 0),
      width: paddedRect.width,
      height:
        paddedRect.height -
        title.height -
        (title.height ? display.spacing : 0) -
        navigation.height -
        (navigation.height ? display.spacing : 0),
    };

    preferredSize = Math.max(
      titleRenderer.extent(),
      navigationSize ? navigationRenderer.spread() : 0,
      itemRenderer.spread()
    );
  }

  content = extend({}, rect, {
    x: rect.x + content.x,
    y: rect.y + content.y,
    width: content.width,
    height: content.height,
  });

  navigation.x += rect.x;
  navigation.y += rect.y;

  title.x += rect.x;
  title.y += rect.y;

  return {
    title: extend({}, rect, title),
    content: extend({}, rect, content),
    navigation: extend({}, rect, navigation),
    orientation,
    preferredSize,
  };
}
