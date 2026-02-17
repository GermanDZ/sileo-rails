import { store } from "sileo/store";

function withState(state, payload, options = {}) {
  if (typeof payload === "string") {
    return { title: payload, ...options, state };
  }
  return { ...(payload || {}), state };
}

const sileo = {
  configure(options = {}) {
    store.configure(options);
  },

  show(options) {
    return store.add(options).id;
  },

  success(payload, options) {
    return this.show(withState("success", payload, options));
  },

  error(payload, options) {
    return this.show(withState("error", payload, options));
  },

  warning(payload, options) {
    return this.show(withState("warning", payload, options));
  },

  info(payload, options) {
    return this.show(withState("info", payload, options));
  },

  action(payload, options) {
    return this.show(withState("action", payload, options));
  },

  loading(payload, options) {
    return this.show(withState("loading", payload, { ...(options || {}), duration: null }));
  },

  promise(promise, opts = {}) {
    const source = typeof promise === "function" ? promise() : promise;
    const loading = typeof opts.loading === "function" ? opts.loading() : (opts.loading || { title: "Loading..." });
    const id = this.loading(loading, { position: opts.position });

    source
      .then((result) => {
        const resolved = opts.action
          ? (typeof opts.action === "function" ? opts.action(result) : opts.action)
          : (typeof opts.success === "function" ? opts.success(result) : opts.success);
        if (resolved) {
          store.update(id, {
            ...resolved,
            state: opts.action ? "action" : "success",
            id,
            duration: resolved.duration === undefined ? 4000 : resolved.duration,
            exiting: false
          });
        } else {
          store.dismiss(id);
        }
      })
      .catch((error) => {
        const fallback = { title: "Something went wrong" };
        const resolved = opts.error
          ? typeof opts.error === "function" ? opts.error(error) : opts.error
          : fallback;
        store.update(id, {
          ...resolved,
          state: "error",
          id,
          duration: resolved.duration === undefined ? 5000 : resolved.duration,
          exiting: false
        });
      });

    return source;
  },

  dismiss(id) {
    store.dismiss(id);
  },

  clear(position) {
    store.clear(position);
  }
};

if (typeof window !== "undefined") {
  window.Sileo = sileo;

  window.addEventListener("sileo:show", (event) => {
    sileo.show(event.detail || {});
  });

  window.addEventListener("sileo:dismiss", (event) => {
    if (!event.detail || !event.detail.id) return;
    sileo.dismiss(event.detail.id);
  });
}

export default sileo;
