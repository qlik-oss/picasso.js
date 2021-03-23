/* eslint-disable func-names */
function Observable(api) {
  this.getLayout = function (napi) {
    this.requestPromise = napi.getLayout().then((layout) => {
      this.requestPromise = null;
      if (api.isCancelled) {
        return;
      }
      this.fn(layout);
    });
  }.bind(this, api);

  this.onInvalidated = function () {
    this.getLayout();
  }.bind(this);

  this.api = api;
  this.fn = null;
}

Observable.prototype.subscribe = function (fn) {
  if (typeof fn !== 'function') {
    throw new Error('Observer must be a function');
  }
  if (typeof this.fn === 'function') {
    return;
  }
  this.fn = fn;
  this.api.on('changed', this.onInvalidated);
  this.getLayout();
};

Observable.prototype.dispose = function () {
  this.api.removeListener('changed', this.onInvalidated);
};

Observable.prototype.cancel = function () {
  if (this.requestPromise) {
    this.api.app.global.cancelRequest(this.requestPromise.requestId);
    this.api.markAsCancelled();
    this.requestPromise = null;
    return true;
  }
  return false;
};

Observable.prototype.retry = function () {
  if (this.api.isCancelled) {
    this.getLayout();
  }
};

export default {
  types: ['Doc', 'GenericObject', 'GenericDimension', 'GenericMeasure', 'GenericBookmark', 'GenericVariable'],
  extend: {
    layoutSubscribe(fn) {
      const observable = new Observable(this);
      observable.subscribe(fn);
      return observable;
    },
  },
};
