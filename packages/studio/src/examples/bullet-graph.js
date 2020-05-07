const code = `
const box = function({
  start,
  end,
  width,
  fill,
  minHeightPx
}) {
  const b = {
    key: 'bars',
    type: 'box',
    data: {
      extract: {
        field: 'Dim',
        props: {
          start,
          end
        }
      }
    },
    settings: {
      orientation: 'horizontal',
      major: { scale: 'y' },
      minor: { scale: 'v' },
      box: {
        width,
        fill,
        minHeightPx
      }
    }
  };
  
  return b;
}

return {
    collections: [{
	    key: 'd',
      	data: {
          extract: {
            field: 'Dim',
            props: {
              start: { field: 'Measure' },
              end: { field: 'Target' }
            }
          }
        }
    }],
    scales: {
      y: {
        data: { extract: { field: 'Dim' } },
        padding: 0.2
      },
      v: {
        data: { fields: ['Measure', 'Target'] },
        expand: 0.1,
        min: 0,
        max: 100
      }
    },
    components: [{
      type: 'axis',
      dock: 'left',
      scale: 'y'
    },{
      type: 'axis',
      dock: 'bottom',
      scale: 'v'
    },
      box({ start: 0, end: 1000, width: 0.8, fill: '#eee' }),
      box({ start: 0, end: { field: 'Target', value: v => v * 0.8 }, width: 0.8, fill: '#ccc' }),
      box({ start: 0, end: { field: 'Target', value: v => v * 0.6 }, width: 0.8, fill: '#aaa' }),
      box({ start: 0, end: { field: 'Measure' }, width: 0.4, fill: '#111' }),
      box({ start: { field: 'Target' }, end: { field: 'Target' }, width: 0.7, fill: '#111', minHeightPx: 3 })
	]
};
`;

const data = `
return [{
  type: 'matrix',
  data: [
    ["Dim", "Measure", "Target"],
    ["A", 70.45477078586889, 79.52555500081539],
    ["B", 64.05241577169275, 60.81904256381248],
    ["C", 88.42748155090077, 81.23199811027098],
    ["D", 84.70738902999071, 80.08712479316934],
    ["E", 70.9540229459231, 72.95870919941181],
    ["F", 78.85598493960407, 70.2670347809754],
    ["G", 50.87209074224095, 53.76924769004316],
    ["H", 89.71864399870495, 83.46577214275902],
  ]
}];

`;

const item = {
  id: 'bullet-graph',
  title: 'Bullet Graph',
  code,
  data,
};

export default item;
