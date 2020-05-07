import nodeSlug from 'slug';
import storage from './storage';

const localExamples = storage.getLocalStorage('pic.studio.examples', []);

function slugify(text) {
  return nodeSlug(text.toLowerCase());
}

const localRepo = {
  list: () => {
    return localExamples;
  },

  new: (item) => {
    if (!item.title) {
      return 'No item title';
    }

    const defaults = {
      code: '',
      data: '',
    };

    const newItem = { ...defaults, ...item, id: slugify(item.title) };

    if (localRepo.idExists(newItem.id)) {
      return 'Duplicate item';
    }

    localExamples.push(newItem);
    localRepo.save();
    return newItem;
  },

  idExists: (id) => {
    for (let i = 0; i < localExamples.length; i += 1) {
      const cur = localExamples[i];
      if (cur.id === id) {
        return true;
      }
    }
    return false;
  },

  fork: (item, code, data) => {
    let tryName = `${item.title} (forked) `;

    if (!localRepo.idExists(slugify(tryName))) {
      return localRepo.new({ title: tryName, code, data });
    }

    for (let tries = 0; tries < 99; tries += 1) {
      tryName = `${item.title} (fork ${tries + 2}) `;

      if (!localRepo.idExists(slugify(tryName))) {
        return localRepo.new({ title: tryName, code, data });
      }
    }

    return 'Could not find suitable fork name';
  },

  update: (item) => {
    for (let i = 0; i < localExamples.length; i += 1) {
      if (localExamples[i].id === item.id) {
        localExamples[i].code = item.code;
        localExamples[i].data = item.data;
      }
    }
    localRepo.save();
  },

  get: (id) => {
    for (let i = 0; i < localExamples.length; i += 1) {
      const cur = localExamples[i];
      if (cur.id === id) {
        return cur;
      }
    }
    return false;
  },

  delete: (id) => {
    for (let i = 0; i < localExamples.length; i += 1) {
      if (localExamples[i].id === id) {
        localExamples.splice(i, 1);
        localRepo.save();
        return localExamples[i - 1];
      }
    }
    return false;
  },

  save: () => {
    storage.setLocalStorage('pic.studio.examples', localExamples);
  },
};

export default localRepo;
