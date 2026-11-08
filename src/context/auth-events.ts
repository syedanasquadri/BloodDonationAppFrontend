type AuthInvalidationListener = () => void;

const listeners = new Set<AuthInvalidationListener>();

export const subscribeToAuthInvalidation = (
  listener: AuthInvalidationListener,
) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyAuthInvalidated = () => {
  listeners.forEach((listener) => listener());
};
