const DEFAULT_TOAST_DURATION = 6000;
const EXIT_DURATION = 250;

class SileoStore {
  constructor() {
    this.toasts = [];
    this.listeners = new Set();
    this.config = {
      position: "top-right",
      options: {}
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  add(toast) {
    const defaults = this.config.options || {};
    const mergedStyles = { ...(defaults.styles || {}), ...((toast && toast.styles) || {}) };
    const mergedAutopilot = this.mergeAutopilot(defaults.autopilot, toast && toast.autopilot);
    const id = (toast && toast.id) || this.generateId();
    const instanceId = this.generateId();
    const next = {
      ...defaults,
      ...(toast || {}),
      styles: mergedStyles,
      autopilot: mergedAutopilot,
      id,
      instanceId,
      position: (toast && toast.position) || this.config.position || "top-right",
      duration: toast && Object.prototype.hasOwnProperty.call(toast, "duration")
        ? toast.duration
        : (defaults.duration === undefined ? DEFAULT_TOAST_DURATION : defaults.duration),
      createdAt: Date.now(),
      exiting: false
    };

    const existing = this.toasts.find((item) => item.id === id && !item.exiting);
    this.toasts = existing
      ? this.toasts.map((item) => (item.id === id ? next : item))
      : [...this.toasts.filter((item) => item.id !== id), next];

    this.emit();
    return next;
  }

  update(id, updates) {
    if (!id) return;
    this.toasts = this.toasts.map((toast) => {
      if (toast.id !== id) return toast;
      const merged = { ...toast, ...(updates || {}) };
      if (toast.styles || (updates && updates.styles)) {
        merged.styles = { ...(toast.styles || {}), ...((updates && updates.styles) || {}) };
      }
      merged.instanceId = this.generateId();
      return merged;
    });
    this.emit();
  }

  dismiss(id) {
    const target = this.toasts.find((toast) => toast.id === id && !toast.exiting);
    if (!target) return;

    this.toasts = this.toasts.map((toast) =>
      toast.id === id ? { ...toast, exiting: true } : toast
    );
    this.emit();

    window.setTimeout(() => {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
      this.emit();
    }, EXIT_DURATION);
  }

  clear(position) {
    if (!position) {
      this.toasts = [];
    } else {
      this.toasts = this.toasts.filter((toast) => toast.position !== position);
    }
    this.emit();
  }

  configure({ position, options } = {}) {
    if (position) this.config.position = position;
    if (options) {
      const prev = this.config.options || {};
      this.config.options = {
        ...prev,
        ...options,
        styles: { ...(prev.styles || {}), ...(options.styles || {}) }
      };
    }
    this.emit();
  }

  emit() {
    for (const listener of this.listeners) listener(this.toasts);
  }

  generateId() {
    return `sileo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  mergeAutopilot(base, override) {
    if (override === false) return false;
    if (override === true) return true;
    if (typeof override === "object" && override !== null) {
      const left = typeof base === "object" && base !== null ? base : {};
      return { ...left, ...override };
    }
    return override === undefined ? base : override;
  }
}

export { DEFAULT_TOAST_DURATION, EXIT_DURATION };
export const store = new SileoStore();
