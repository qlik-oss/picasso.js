import component from './line';

/**
 * @typedef {object} ComponentLine
 * @extends ComponentSettings
 * @property {'line'} type component type
 * @example
{
  type: "line",
  data: {
    extract: {
      field: "Year",
      props: {
        sales: { field: "Sales" },
      },
    },
  },
  settings: {
    coordinates: {
      major: { scale: "t" },
      minor: { scale: "y", ref: "sales" },
    },
  },
}
 */

const type = 'line';

export default function line(picasso) {
  picasso.component(type, component);
}
