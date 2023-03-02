// getValue({ person: { name: 'John Doe' } }, 'person.name');
// => 'John Doe'
//  getValue({ person: { name: undefined } }, 'person.name', 'John Doe');
// => 'John Doe'

function getValue(object, path, fallback) {
  if (object === undefined || path === undefined) {
    return fallback;
  }

  const steps = path.split('.');

  let scoped = object;

  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i];

    if (scoped[step] === undefined) {
      return fallback;
    }

    scoped = scoped[step];
  }

  return scoped;
}

export default getValue;
