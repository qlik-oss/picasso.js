import { filterOverlappingLabels } from '../../../../../src/core/chart-components/axis/axis-node-builder';

describe('Axis Node Buidlder', () => {
  describe('filterOverlappingLabels', () => {
    let nodes;

    beforeEach(() => {
      nodes = [];
    });

    it('3 vertical nodes, upper node collide with middle node', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      const middleNode = {
        name: 'middle',
        boundingRect: {
          x: 0, y: 8, width: 10, height: 10
        }
      };
      const lowerNode = {
        name: 'lower',
        boundingRect: {
          x: 0, y: 20, width: 10, height: 10
        }
      };
      nodes.push(...[lowerNode, middleNode, upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['lower', 'upper']);
    });

    it('3 vertical nodes, upper node collide with middle node and lower node', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      const middleNode = {
        name: 'middle',
        boundingRect: {
          x: 0, y: 8, width: 10, height: 10
        }
      };
      const lowerNode = {
        name: 'lower',
        boundingRect: {
          x: 0, y: 9, width: 10, height: 10
        }
      };
      nodes.push(...[lowerNode, middleNode, upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['upper']);
    });

    it('2 vertical nodes, upper node collide with lower node', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      const lowerNode = {
        name: 'lower',
        boundingRect: {
          x: 0, y: 9, width: 10, height: 10
        }
      };
      nodes.push(...[lowerNode, upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['upper']);
    });

    it('1 vertical node', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      nodes.push(...[upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['upper']);
    });

    it('multiple vertical nodes colliding', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      const node5 = {
        name: 'node5',
        boundingRect: {
          x: 0, y: 6, width: 10, height: 10
        }
      }; // filter
      const node4 = {
        name: 'node4',
        boundingRect: {
          x: 0, y: 12, width: 10, height: 10
        }
      };
      const node3 = {
        name: 'node3',
        boundingRect: {
          x: 0, y: 18, width: 10, height: 10
        }
      }; // filter
      const node2 = {
        name: 'node2',
        boundingRect: {
          x: 0, y: 24, width: 10, height: 10
        }
      };
      const node1 = {
        name: 'node1',
        boundingRect: {
          x: 0, y: 30, width: 10, height: 10
        }
      }; // filter
      const lowerNode = {
        name: 'lower',
        boundingRect: {
          x: 0, y: 36, width: 10, height: 10
        }
      };
      nodes.push(...[lowerNode, node1, node2, node3, node4, node5, upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['lower', 'node2', 'node4', 'upper']);
    });

    it('multiple vertical nodes, none colliding', () => {
      const upperNode = {
        name: 'upper',
        boundingRect: {
          x: 0, y: 0, width: 10, height: 10
        }
      };
      const node5 = {
        name: 'node5',
        boundingRect: {
          x: 0, y: 15, width: 10, height: 10
        }
      };
      const node4 = {
        name: 'node4',
        boundingRect: {
          x: 0, y: 30, width: 10, height: 10
        }
      };
      const node3 = {
        name: 'node3',
        boundingRect: {
          x: 0, y: 45, width: 10, height: 10
        }
      };
      const node2 = {
        name: 'node2',
        boundingRect: {
          x: 0, y: 60, width: 10, height: 10
        }
      };
      const node1 = {
        name: 'node1',
        boundingRect: {
          x: 0, y: 75, width: 10, height: 10
        }
      };
      const lowerNode = {
        name: 'lower',
        boundingRect: {
          x: 0, y: 90, width: 10, height: 10
        }
      };
      nodes.push(...[lowerNode, node1, node2, node3, node4, node5, upperNode]);

      filterOverlappingLabels(nodes);

      expect(nodes.map(n => n.name)).to.deep.equal(['lower', 'node1', 'node2', 'node3', 'node4', 'node5', 'upper']);
    });
  });
});
