import { AsyncLocalStorage } from 'async_hooks';

export interface RequestErrorSummary {
  errorName: string;
  errorMessage: string;
  errorCode?: string;
  errorCause?: string;
}

export interface RequestContextStore {
  requestId: string;
  userId?: number;
  error?: RequestErrorSummary;
}

const storage = new AsyncLocalStorage<RequestContextStore>();

export const RequestContext = {
  run<T>(store: RequestContextStore, callback: () => T): T {
    return storage.run(store, callback);
  },

  get(): RequestContextStore | undefined {
    return storage.getStore();
  },

  setUserId(userId: number) {
    const store = storage.getStore();
    if (store) {
      store.userId = userId;
    }
  },

  setError(error: RequestErrorSummary) {
    const store = storage.getStore();
    if (store) {
      store.error = error;
    }
  },
};
