export default function valueCollection() {
  let values = [];
  function vc() {}

  vc.add = value => {
    if (values.indexOf(value) === -1) {
      values.push(value);
      return true;
    }
    return false;
  };

  vc.remove = value => {
    const idx = values.indexOf(value);
    if (idx !== -1) {
      values.splice(idx, 1);
      return true;
    }
    return false;
  };

  vc.contains = value => values.indexOf(value) !== -1;

  vc.values = () => values.slice();

  vc.clear = () => (values = []);

  vc.toString = () => values.join(';');

  return vc;
}
