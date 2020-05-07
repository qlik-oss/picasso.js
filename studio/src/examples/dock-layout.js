const code = `
picasso.component.remove('bg-comp');

picasso.component("bg-comp", {
  defaultSettings: {
    layout: {},
    settings: {
      color: "rgba(123,123,123,0.2)",
      opacity: 1,
      textColor: "black"
    }
  },

  created: function created() {
    this.isVertical =
      this.settings.layout.dock === "left" ||
      this.settings.layout.dock === "right";
    if (this.settings.layout.dock === "left") {
      this.angle = 270;
    } else if (this.settings.layout.dock === "right") {
      this.angle = 90;
    }
  },
  preferredSize: function() {
    return { width: 50, height: 100 };
  },
  render: function render() {
    var rectNode = {
      type: "rect",
      fill: this.settings.settings.color,
      opacity: this.settings.settings.opacity,
      stroke: "black",
      strokeWidth: 1,
      width: this.rect.width,
      height: this.rect.height
    };

    var cx = this.rect.width / 2;
    var cy = this.rect.height / 2;
    var keyTextNode = {
      type: "text",
      text: this.settings.layout.dock,
      fontSize: "16px",
      fontFamily: "Arial",
      x: cx,
      y: cy,
      anchor: "middle",
      baseline: "middle",
      fill: this.settings.settings.textColor,
      transform: this.isVertical
        ? "rotate(" + this.angle + "," + cx + "," + cy + ")"
        : ""
    };

    return [rectNode, keyTextNode];
  }
});

return {
  layout: {
    size: {
      width: 500,
      height: 500
    }
  },
  components: [{
    type: 'bg-comp',
    layout: {
      dock: 'left'
    },
    settings: {
      color: '#03e1a4'
    }
  }, {
    type: 'bg-comp',
    key: 'right',
    layout: {
      dock: 'right'
    },
    settings: {
      color: '#8ad17d'
    }
  }, {
    type: 'bg-comp',
    layout: {
      dock: '@right'
    },
    settings: {
      color: 'rgba(233,100,80,0.3)'
    }
  }, {
    type: 'bg-comp',
    layout: {
      dock: 'top'
    },
    settings: {
      color: '#ffffbf'
    }
  }, {
    type: 'bg-comp',
    layout: {
      dock: 'bottom'
    },
    settings: {
      color: '#abd9e9'
    }
  },{
    type: 'bg-comp',
    layout: {
      dock: 'center'
    },
    settings: {
      color: '#f688f0'
    }
  }]
};



`;

const data = `
return [];
`;

const item = {
  id: 'dock-layout',
  title: 'Dock Layout',
  code,
  data,
};

export default item;
