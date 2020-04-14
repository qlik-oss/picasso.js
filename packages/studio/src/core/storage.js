const storage = {
  getLocalStorage(key, initialValue) {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  },
  setLocalStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
};

export default storage;
