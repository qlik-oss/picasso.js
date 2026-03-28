import Container from './container';

export default class Stage extends Container {
  declare _dpiRatio: number;
  constructor(dpi?: number) {
    super({ type: 'stage' });
    this._stage = this;
    this._dpiRatio = dpi || 1;
  }

  get dpi() {
    return this._dpiRatio;
  }
}

export function create(dpi?: number) {
  return new Stage(dpi);
}
