/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
export default {
  types: 'Doc',

  override: {
    getContentLibraries(_getContentLibraries) {
      return _getContentLibraries().then((list) => list.qItems);
    },

    getLibraryContent(_getLibraryContent, name) {
      return _getLibraryContent(name).then((list) => list.qItems);
    },
  },

  extend: {
    getOrCreateSessionObject(props) {
      const app = this;
      const id = props.qInfo.qId;
      if (!app._listCache[id]) {
        app._listCache[id] = app.createSessionObject(props);
      }
      return app._listCache[id];
    },

    /**
     * Help method to fetch app object data from Engine through a session object
     * @param {Object} listDef - specifications of which type of list to fetch
     * @param {Object} listDef.qInfo - qInfo object specifying a type and id for the session object
     * @returns {Promise.<Array>} A Promise that when resolved holds a list of data objects of the specified type
     */
    getListData(listDef) {
      return this.getListObject(listDef).then((list) => list.getLayout());
    },

    /**
     * Help method to fetch list objects from Engine through as session objects
     * @param {Object} listDef - specifications of which type of list to fetch
     * @param {Object} listDef.qInfo - qInfo object specifying a type and id for the session object
     * @returns {Promise<Object>} Promise containing the list handling object if resolved or Error if rejected
     */
    getListObject(listDef) {
      const app = this;
      let outKey = Object.keys(listDef).filter((key) => key.indexOf('ListDef') !== -1)[0];
      if (!outKey) {
        throw new Error('Invalid list definition');
      }
      if (outKey) {
        outKey = outKey.replace(/Def$/g, '');
      }

      const id = listDef.qInfo.qId;

      if (!app._listCache[id]) {
        app.getOrCreateSessionObject(listDef).then((obj) => {
          const getLayout = obj.getLayout.bind(obj);
          obj.getLayout = () => getLayout().then((layout) => layout[outKey].qItems);
          return obj;
        });
      }

      return app._listCache[id];
    },
  },

  init(args) {
    args.api._listCache = {};
  },
};
