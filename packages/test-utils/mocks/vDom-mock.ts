export default function vDomMock(sel, data, children) {
  const vNode = {
    sel,
    data,
    children: children || [],
  };

  return vNode;
}
