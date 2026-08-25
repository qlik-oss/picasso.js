// const object = { person: { name: undefined };
// setValue(object, 'person.name', 'John Doe');
// console.log(object.person.name);
// => 'John Doe'
const FORBIDDEN = ["__proto__", "constructor", "prototype"];

function setValue(object, path, value) {
  if (object === undefined || path === undefined) {
    return;
  }

  const steps = path.split(".");
  const propertyName = steps[steps.length - 1];

  let scoped = object;

  for (let i = 0; i < steps.length - 1; ++i) {
    const step = steps[i];

    if (FORBIDDEN.includes(step)) {
      throw new Error(`Unsafe key in path: ${step}`);
    }

    if (scoped[step] === undefined) {
      scoped[step] = Number.isNaN(+steps[i + 1]) ? {} : [];
    }
    scoped = scoped[step];
  }

  if (value === undefined) {
    delete scoped[propertyName];
    return;
  }

  scoped[propertyName] = value;
}

export default setValue;
