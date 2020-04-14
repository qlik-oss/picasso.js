const code = `
return {
  components: [{
    type: 'text',
    text: 'Dock: left, anchor: top',
    layout: {
      dock: 'left'
    },
    settings: {
      // Where in to dock in the layout
      // Where to dock in the local layout, left & Right dock can have top,
      // bottom or center as anchor
      // Top & Bottom dock can have left, right or center as anchor
      anchor: 'top'
    }
  }, {
    type: 'text',
    text: 'Dock: left, anchor: center',
    layout: {
      dock: 'left'
    },
    settings: {
      anchor: 'center'
    }
  }, {
    type: 'text',
    text: 'Dock: left, anchor: bottom',
    layout: {
      dock: 'left'
    },
    settings: {
      anchor: 'bottom'
    }
  }, {
    type: 'text',
    text: 'Dock: right, anchor: top',
    layout: {
      dock: 'right'
    },
    settings: {
      anchor: 'top'
    }
  }, {
    type: 'text',
    text: 'Dock: right, anchor: center',
    layout: {
      dock: 'right'
    },
    settings: {
      anchor: 'center'
    }
  }, {
    type: 'text',
    text: 'Dock: right, anchor: bottom',
    layout: {
      dock: 'right'
    },
    settings: {
      anchor: 'bottom'
    }
  }, {
    type: 'text',
    text: 'Dock: top, anchor: left',
    layout: {
      dock: 'top'
    },
    settings: {
      anchor: 'left'
    }
  }, {
    type: 'text',
    text: 'Dock: top, anchor: center',
    layout: {
      dock: 'top'
    },
    settings: {
      anchor: 'center'
    }
  }, {
    type: 'text',
    text: 'Dock: top, anchor: right',
    layout: {
      dock: 'top'
    },
    settings: {
      anchor: 'right'
    }
  }, {
    type: 'text',
    layout: {
      dock: 'bottom'
    },
    text: 'Dock: bottom, anchor: left',
    settings: {
      anchor: 'left'
    }
  }, {
    type: 'text',
    layout: {
      dock: 'bottom'
    },
    text: 'Dock: bottom, anchor: center',
    settings: {
      anchor: 'center'
    }
  }, {
    type: 'text',
    layout: {
      dock: 'bottom'
    },
    text: 'Dock: bottom, anchor: right',
    settings: {
      anchor: 'right'
    }
  }]
};
`;

const data = '';

const item = {
  id: 'text',
  title: 'Text',
  code,
  data,
};

export default item;
