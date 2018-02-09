# API specification file

The `spec.json` file is generated using [`jsdoc2spec`](https://github.com/miralemd/jsdoc2spec) as a template to `jsdoc`.

## Guidelines

Following are some guidelines on how to document code to ensure proper output.

### Entry vs definition

The spec file's two main fields are `entries` and `definitions`.

`entries` is meant to hold entities that are _directly_ accessible for a consumer of the API, while `definitions` holds entities that are reached _indirectly_, e.g. as a returned value from a function.

By default, all entities will end up in `entries`, to move an entity to `definitions` add a `@definition` tag to the jsdoc:

```js
/**
 * A person
 */
class Person {
  /**
   * Returns the name of this person
   * @returns {Person~name}
   */
  name() {
    return {
      first: 'John',
      last: 'Doe'
    };
  }
}

/**
 * @definition
 * @typedef {object} Person~name
 * @property {string} first - First name
 * @property {string} last - Last name
 */
```

The annotations above will result in `Person` being in `entries` while `Person~name` will be in `definitions`.

### Exporting entities

Annotations on exported entities is sometimes problematic and may cause the wrong name to be used for the entity, this can be solved by separating the annotation and the `export` statement.

Instead of:

```js
/**
 * Do stuff
 */
export default function foo() {}
```

split the entity and `export`:

```js
/**
 * Do stuff
 */
function foo() {}

export {
  foo as default
}
```

### Structs

Properties of a struct can be annotated inline as part of the real object

```js
/**
 * @definition
 * @typedef {object}
 */
const DEFAULTS = {
  /** Fill color
   * @type {string=} */
  fill: 'red',
  /**
   * @typedef {object} */
  stroke: {
    /** Stroke color
      * @type {string=} */
    color: 'green',
    /** Stroke width
     * @type {number=} */
    width: 1
  }
}
```