import Container from './container';

export default class Stage extends Container {
  constructor(dpi) {
    super('stage');
    this._stage = this;
    this._dpiRatio = dpi || 1;
  }

  get dpi() {
    return this._dpiRatio;
  }
}

export function create(...a) {
  return new Stage(...a);
}
