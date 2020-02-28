# Documentation

This script utilizes a `json` API specification output and Handlebars to compile documentation into Markdown files. Here's a short description of how to use it and how it works:

> Note: The name "template" is used here for all registered partials in the "templates"-folder. This may be confusing for people that are used to Handlebars, as they call it "partials".

## How to use it

- Modify files in docs/src/input
- Modifiy templates (if you wish) in docs/src/templates
- Run `npm run docs`
- View the specification output in `docs/spec.json`
- View the generated markdown files in `docs/dist`

## Examples

To renderer parts of the API specification, use `{{>magic ctx='<path to json item in spec.json>'}}`, e.g. `{{>magic ctx='definitions.brush'}}`.

The `{{>magic }}` template automatically detects if it's a function, class, structs etc. If you want to manually specify a function, you can use the `{{>function }}` shorthand. All available templates can be found in the `docs/src/templates`-folder. They are also listed with a short description in this file, a bit down.

## How it works

`npm run docs`

- `jsdoc` runs with `jsdoc2spec` as a template and generates `docs/spec.json`
  - [read more about the spec](./spec.md)
- node gen.js is run which:
  - Sets up some helpers with handlebars (check list below)
  - Registers all templates in docs/src/templates as handlebars partials with their respective name
  - Removes `docs/dist`
  - Uses the `docs/src/input` -folder as source, compiles all files
  - Outputs all compiled files to `docs/dist`

## Templates (partials)

**All of these are listed under `docs/src/templates`**

- Bool `{{>bool <path>}}`, will print 'Yes' for a truthy value and 'No' for a falsey value.
- Class `{{>class <path>}}`, shorthand for `function` template, to work with magic template resolution.
- Examples `{{>examples <path>}}`, prints all examples with JavaScript Code tag to enable highlighting on supported markdown compilers.
- Factory `{{>factory <path>}}`, prints a function and all of it's child functions.
- Function `{{>function <path>}}`, prints a function (no child functions).
- Magic `{{>magic ctx='<path>'}}`, magic template resolving tries to figure out what you're trying to print and adapts to that. Prefer using this, but if it does not behave as expected, you can use templates manually.
- Struct `{{>struct <path>}}`, prints an object struct.

## Helpers

- All helpers from `assemble/handlebars-helpers`, list here: https://github.com/assemble/handlebars-helpers
