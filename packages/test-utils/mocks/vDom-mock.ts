interface VNode {
  sel: string;
  data: Record<string, unknown>;
  children: VNode[];
}

export default function vDomMock(sel: string, data: Record<string, unknown>, children?: VNode[]): VNode {
  const vNode: VNode = {
    sel,
    data,
    children: children || [],
  };

  return vNode;
}
