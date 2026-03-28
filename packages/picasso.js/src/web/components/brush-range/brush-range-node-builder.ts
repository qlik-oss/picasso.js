import extend from 'extend';

import { TARGET_SIZE, VERTICAL } from './brush-range-const';

interface VirtualNode {
  [key: string]: unknown;
}

/** Parameters for the buildArea function */
interface AreaConfig {
  h: (...args: unknown[]) => unknown;
  isVertical: boolean;
  top: number;
  height: number;
  color: string;
  on?: Record<string, (e: Event) => void>;
  opacity: number;
}

interface BrushState {
  targetRect?: { x: number; y: number; width: number; height: number };
  targetFillRect?: { x: number; y: number; width: number; height: number };
  settings: { bubbles: { align: string; placement: string; show?: boolean; fontSize?: string; fontFamily?: string; fill?: string } };
  style: { 
    line: { stroke: string }; 
    target: { fill: string; opacity: number }; 
    label?: { fontSize: string; fontFamily: string; color: string };
    bubble: { borderRadius: number; strokeWidth: number; stroke: string; fill: string; color: string; fontFamily: string; fontSize: string };
  };
  size: number;
  rect: { width: number; height: number; x: number; y: number };
  key: string;
  h: (...args: unknown[]) => VirtualNode;
  scale?: { norm: (value: number) => number; domain: () => [number, number] };
  edit?: { rangeIdx: number; bubbleIdx: number };
  onEditConfirmed: (rangeIdx: number, value: number, otherValue: number) => void;
  onEditCanceled: () => void;
  format: (value: number, range?: number[]) => string;
}

interface LineConfig {
  h: (...args: unknown[]) => VirtualNode;
  isVertical: boolean;
  value: number;
  pos: number;
  align: 'start' | 'end';
  borderHit: number;
  state: BrushState;
  idx: number;
}

interface BubbleConfig {
  h: (...args: unknown[]) => VirtualNode;
  isVertical: boolean;
  label: string;
  otherValue: number;
  rangeIdx: number;
  idx: number;
  pos: number;
  align: 'start' | 'end';
  state: BrushState;
  value: number;
  style?: { fontSize: string; fontFamily: string; color: string };
}

interface BuildRangeConfig {
  borderHit: number;
  els: VirtualNode[];
  isVertical: boolean;
  state: BrushState;
  vStart: number;
  vEnd: number;
  idx: number;
}

function buildLine({ h, isVertical, value, pos, align, borderHit, state, idx }: LineConfig): VirtualNode {
  const isAlignStart = align !== 'end';
  const alignStart = { left: '0', top: '0' };
  const alignEnd = { right: '0', bottom: '0' };
  const alignStyle = isAlignStart ? alignStart : alignEnd;
  let start = 0;
  let width = '100%';
  let height = '100%';

  if (state.targetRect && state.settings.bubbles.align === 'start') {
    width = `${state.targetRect.x + state.targetRect.width}px`;
    height = `${state.targetRect.y + state.targetRect.height}px`;
  } else if (state.targetRect && state.settings.bubbles.align === 'end') {
    start = isVertical ? state.targetRect.x : state.targetRect.y;
    width = `${state.rect.width - start}px`;
    height = `${state.rect.height - start}px`;
  }

  if (!isAlignStart) {
    pos -= borderHit;
  }

  // edge
  return h(
    'div',
    {
      onmouseover(e: Event) {
        (e.srcElement as HTMLElement).children[0] as HTMLElement;
        ((e.srcElement as HTMLElement).children[0] as HTMLElement).style.backgroundColor = '#000';
        ((e.srcElement as HTMLElement).children[0] as HTMLElement).style[isVertical ? 'height' : 'width'] = '2px';
      },
      onmouseout(e: Event) {
        ((e.srcElement as HTMLElement).children[0] as HTMLElement).style.backgroundColor = state.style.line.stroke;
        ((e.srcElement as HTMLElement).children[0] as HTMLElement).style[isVertical ? 'height' : 'width'] = '1px';
      },
      'data-value': value,
      'data-key': [state.key, 'edge', idx].join('-'),
      style: {
        cursor: isVertical ? 'ns-resize' : 'ew-resize',
        position: 'absolute',
        left: isVertical ? `${start}px` : `${pos}px`,
        top: isVertical ? `${pos}px` : `${start}px`,
        height: isVertical ? `${borderHit}px` : height,
        width: isVertical ? width : `${borderHit}px`,
        pointerEvents: 'auto',
      },
    },
    [
      // line
      h('div', {
        style: extend(
          {
            backgroundColor: state.style.line.stroke,
            position: 'absolute',
            height: isVertical ? `${1}px` : '100%',
            width: isVertical ? '100%' : `${1}px`,
            pointerEvents: 'none',
          },
          alignStyle
        ),
      }),
    ]
  );
}

function buildBubble({
  h,
  isVertical,
  label,
  otherValue,
  rangeIdx,
  idx,
  pos,
  align,
  state,
  value,
  style: _style = undefined,
}: BubbleConfig): VirtualNode {
  const isAlignStart = align !== 'end';
  const isOutside = state.settings.bubbles.placement === 'outside';
  let outside = 'none';
  let bubbleDock;
  if (isVertical) {
    bubbleDock = isAlignStart ? 'left' : 'right';
    if (isOutside) {
      outside = isAlignStart ? 'translate(-100%,  0px)' : 'translate(100%,  0px)';
    }
  } else {
    bubbleDock = isAlignStart ? 'top' : 'bottom';
    if (isOutside) {
      outside = isAlignStart ? 'translate(0px, -100%)' : 'translate(0px,  100%)';
    }
  }

  let inEdit = state.edit && state.edit.rangeIdx === rangeIdx && state.edit.bubbleIdx === idx;

  const bubbleStyle = {
    position: 'relative',
    borderRadius: `${state.style.bubble.borderRadius}px`,
    border: `${state.style.bubble.strokeWidth}px solid ${state.style.bubble.stroke}`,
    backgroundColor: state.style.bubble.fill,
    color: state.style.bubble.color,
    fontFamily: state.style.bubble.fontFamily,
    fontSize: state.style.bubble.fontSize,
    padding: '4px 8px',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '150px',
    minWidth: '50px',
    minHeight: '1em',
    pointerEvents: 'auto',
    transform: isVertical ? 'translate(0,-50%)' : 'translate(-50%,0)',
    cursor: isVertical ? 'ns-resize' : 'ew-resize',
  };

  let currentBorderColor = state.style.bubble.stroke;

  const bubble = inEdit
    ? h('input', {
        type: 'text',
        value,
        style: {
          ...bubbleStyle,
          textAlign: 'start',
          textOverflow: '',
          fontSize: '13px', // TODO - make it styleable
        },
      onkeyup(e: KeyboardEvent) {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const newValue = parseFloat((e.target as HTMLInputElement).value);
            if (isNaN(newValue)) {
              currentBorderColor = 'rgba(230, 78, 78, 0.6)';
              (e.target as HTMLInputElement).style.border = `${state.style.bubble.strokeWidth}px solid ${currentBorderColor}`;
            } else {
              state.onEditConfirmed(rangeIdx, newValue, otherValue);
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            state.onEditCanceled();
          }
        },
      })
    : h(
        'div',
        {
          'data-key': [state.key, 'bubble', rangeIdx, idx].join('-'),
          'data-other-value': otherValue,
          'data-idx': rangeIdx,
          'data-bidx': idx,
          style: bubbleStyle,
        },
        [label]
      );

  // bubble wrapper
  return h(
    'div',
    {
      style: {
        position: 'absolute',
        [bubbleDock]: '0',
        [isVertical ? 'top' : 'left']: `${pos}px`,
        transform: outside,
      },
    },
    [
      // bubble
      bubble,
    ]
  );
}

function buildArea({ h, isVertical, top, height, color, on, opacity }: AreaConfig): VirtualNode {
  return h(
    'div',
    extend(
      {
        style: {
          backgroundColor: color,
          opacity,
          position: 'absolute',
          left: isVertical ? 0 : `${top}px`,
          top: isVertical ? `${top}px` : 0,
          height: isVertical ? `${height}px` : '100%',
          width: isVertical ? '100%' : `${height}px`,
          pointerEvents: 'auto',
        },
      },
      on || {}
    ),
    []
  ) as VirtualNode;
}

export default function buildRange({ borderHit, els, isVertical, state, vStart, vEnd, idx }: BuildRangeConfig): void {
  let targetOffset = 0;
  if (state.targetRect) {
    targetOffset = isVertical ? state.targetRect.y : state.targetRect.x;
  }
  const hasScale = !!state.scale;
  const start = hasScale ? (state.scale!.norm(vStart) * state.size) : vStart;
  const end = hasScale ? (state.scale!.norm(vEnd) * state.size) : vEnd;
  const height = Math.abs(start - end);
  const top = Math.min(start, end) + targetOffset;
  const bottom = top + height;

  if (state.targetRect) {
    const target = state.targetFillRect || state.targetRect;
    const targetSize = isVertical ? target.height : target.width;
    const targetStart = hasScale ? (state.scale!.norm(vStart) * targetSize) : vStart;
    const targetEnd = hasScale ? (state.scale!.norm(vEnd) * targetSize) : vEnd;
    const targetHeight = Math.abs(targetStart - targetEnd);
    const targetTop = Math.min(targetStart, targetEnd);
    const targetArea: AreaConfig = {
      h: state.h,
      isVertical,
      top: targetTop,
      height: targetHeight,
      color: state.style.target.fill,
      opacity: state.style.target.opacity,
    };
    if (state.style.target.opacity < 0.8) {
      targetArea.on = {
        onmouseover(e) {
          (e.srcElement as HTMLElement).style.opacity = String(state.style.target.opacity + 0.1);
        },
        onmouseout(e) {
          (e.srcElement as HTMLElement).style.opacity = String(state.style.target.opacity);
        },
      };
    }
    els.push(
      state.h(
        'div',
        {
          style: {
            position: 'absolute',
            left: `${target.x}px`,
            top: `${target.y}px`,
            height: `${target.height}px`,
            width: `${target.width}px`,
          },
        },
        [buildArea(targetArea)]
      )
    );
  }

  // active range area
  // els.push(buildArea({
  //   h: state.h,
  //   isVertical,
  //   top,
  //   height,
  //   color: state.settings.fill
  // }));

  const valStart = start < end ? vStart : vEnd;
  const valEnd = start < end ? vEnd : vStart;
  const [min, max] = hasScale ? (state.scale!.domain()) : [Math.min(vStart, vEnd), Math.max(vStart, vEnd)];

  const isStartVisible = valStart + 1e-5 >= min && valStart - 1e-5 <= max; // accept minor floating point difference
  const isEndVisible = valEnd - 1e-5 <= max && valEnd + 1e-5 >= min;

  if (isStartVisible) {
    els.push(
      buildLine({
        h: state.h,
        isVertical,
        borderHit,
        value: valStart,
        pos: top,
        align: 'start',
        state,
        idx,
      })
    );
  }

  if (isEndVisible) {
    els.push(
      buildLine({
        h: state.h,
        isVertical,
        borderHit,
        value: valEnd,
        pos: bottom,
        align: 'end',
        state,
        idx,
      })
    );
  }

  const bubbles = state.settings.bubbles;
  if (bubbles && bubbles.show) {
    const fontSize = bubbles.fontSize || '';
    const fontFamily = bubbles.fontFamily || '';
    const fill = bubbles.fill || '';
    const style: { fontSize: string; fontFamily: string; color: string } = {
      fontSize,
      fontFamily,
      color: fill,
    };

    const range = [vStart, vEnd];

    if (isStartVisible) {
      els.push(
        buildBubble({
          h: state.h,
          isVertical,
          align: (bubbles.align || 'start') as 'start' | 'end',
          style,
          rangeIdx: idx,
          idx: 0,
          otherValue: valEnd,
          value: valStart,
          label: `${state.format(valStart, range)}`,
          pos: top,
          state,
        })
      );
    }

    if (isEndVisible) {
      els.push(
        buildBubble({
          h: state.h,
          isVertical,
          align: (bubbles.align || 'start') as 'start' | 'end',
          style,
          rangeIdx: idx,
          idx: 1,
          otherValue: valStart,
          value: valEnd,
          label: `${state.format(valEnd, range)}`,
          pos: bottom,
          state,
        })
      );
    }
  }
}

export function getMoveDelta(state: BrushState & { active: { limitHigh: number; limitLow: number; start: number; end: number }; current: number; start: number }): number {
  const posDelta = state.active.limitHigh - state.active.end;
  const negDelta = state.active.limitLow - state.active.start;
  let delta = state.current - state.start;
  if (delta < 0) {
    delta = Math.max(delta, negDelta);
  } else {
    delta = Math.min(delta, posDelta);
  }

  return delta;
}

export function nodes(state: BrushState & { ranges?: Array<{ min: number; max: number }>; active?: { idx: number; mode: string; start: number; end: number }; direction: number | string; current: number; start: number; format: (value: number, range: number[]) => string }): VirtualNode[] {
  const els: VirtualNode[] = [];

  const isVertical = state.direction === VERTICAL;

  if (Array.isArray(state.ranges)) {
    // add all other ranges
    state.ranges.forEach((r: { min: number; max: number }, i: number) => {
      if (!state.active || i !== state.active.idx) {
        buildRange({
          borderHit: TARGET_SIZE,
          els,
          isVertical,
          state,
          vStart: Math.min(r.min, r.max),
          vEnd: Math.max(r.min, r.max),
          idx: i,
        });
      }
    });
  }

  if (state.active) {
    // add active range
    let vStart = state.start;
    let vEnd = state.current;
    if (state.active.idx !== -1) {
      if (state.active.mode === 'foo') {
        vStart = Math.min(state.active.start, state.active.end);
        vEnd = Math.max(state.active.start, state.active.end);
      } else if (state.active.mode === 'modify') {
        vStart = Math.min(state.start, state.current);
        vEnd = Math.max(state.start, state.current);
      } else {
        const delta = getMoveDelta(state as any);
        vStart = state.active.start + delta;
        vEnd = state.active.end + delta;
      }
    }

    buildRange({
      borderHit: TARGET_SIZE,
      els,
      isVertical,
      state,
      vStart,
      vEnd,
      idx: state.active.idx,
    });
  }

  return els;
}
