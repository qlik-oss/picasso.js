let instance;

export function setActive(action) {
  instance = action;
}

export function removeActive(action) {
  if (instance === action) {
    instance = null;
    return true;
  }

  return false;
}

export function cancelActive(a) {
  if (instance && instance !== a) {
    instance();
  }
}

export function getActive() {
  return instance;
}

export function remove() {
  instance = null;
}
