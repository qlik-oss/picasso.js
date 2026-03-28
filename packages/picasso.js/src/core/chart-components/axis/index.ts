import axisComponent from './axis';

const type = 'axis';

export default function axis(picasso) {
  picasso.component(type, axisComponent);
}
