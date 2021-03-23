export default {
  types: 'Doc',
  extend: {
    getLiveObject(id, fn) {
      return this.getObject(id).then((obj) => {
        const observed = obj.layoutSubscribe((layout) => {
          fn(layout);
        });
        return {
          observed,
          obj,
        };
      });
    },
  },
  init(args) {
    const { api } = args;
    api.Promise = args.Promise;
    api.session.app = api; // Expose app on `session` so we can mixin the app on child `apis`
  },
};
