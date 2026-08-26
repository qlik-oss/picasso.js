import render from '../render';

describe('render', () => {
  let context;
  let placement;

  beforeEach(() => {
    placement = {
      computedTooltipStyle: {
        left: 1,
        top: 2,
      },
    };
    context = {
      renderer: {
        render: vi.fn(),
        element: vi.fn().mockReturnValue({ children: [0] }),
      },
      h: vi.fn().mockReturnValue('CALLED'),
      style: {
        content: {
          testStyle: 'testing',
        },
        arrow: {
          arrowTestStyle: 'test2',
        },
      },
      props: {
        content: vi.fn(),
        contentClass: {
          testClass: true,
        },
        arrowClass: {
          class: true,
        },
      },
    };
  });

  it('should render content', () => {
    const data = [0, 1, 2];
    render(data, placement, context);

    // Content call
    expect(context.h.mock.calls[0][0]).to.equal('div');
    expect(context.h.mock.calls[0][1]).toMatchObject({
      style: {
        testStyle: 'testing',
      },
      class: 'pic-tooltip-content testClass',
    });

    // Arrow call
    expect(context.h.mock.calls[1][1]).toMatchObject({
      class: 'pic-tooltip-arrow class',
      style: {
        arrowTestStyle: 'test2',
      },
    });

    // Container call
    expect(context.h.mock.calls[2][1]).toMatchObject({
      style: {
        display: 'inline-block',
        position: 'relative',
        left: 1,
        top: 2,
      },
    });

    expect(context.props.content).toHaveBeenCalledWith({
      h: context.h,
      style: context.style,
      data,
    });

    expect(context.renderer.render).toHaveBeenCalledWith('CALLED');
  });
});
