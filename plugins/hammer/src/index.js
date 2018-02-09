import hammer from './hammer';

export default function initialize(picasso) {
  picasso.interaction('hammer', hammer);
}
