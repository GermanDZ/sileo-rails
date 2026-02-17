import { Controller } from "@hotwired/stimulus";
import { store } from "sileo/store";

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
  loading: "↻",
  action: "→"
};
const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];
const MIN_COLLAPSE_DELAY_MS = 600;
const DISMISS_RETRY_DELAY_MS = 350;
const MOBILE_TOUCH_GRACE_MS = 900;

function normalizeOffset(offset) {
  if (typeof offset === "number" || typeof offset === "string") {
    return { all: offset };
  }
  if (!offset || typeof offset !== "object") {
    return { all: 16 };
  }
  return offset;
}

function styleFromOffset(offset) {
  const value = normalizeOffset(offset);
  if (value.all !== undefined) {
    const unit = `${value.all}`.match(/[a-z%]+$/) ? `${value.all}` : `${value.all}px`;
    return `--sileo-offset-top:${unit};--sileo-offset-right:${unit};--sileo-offset-bottom:${unit};--sileo-offset-left:${unit};`;
  }

  const styles = [];
  ["top", "right", "bottom", "left"].forEach((side) => {
    if (value[side] === undefined) return;
    const raw = `${value[side]}`;
    const unit = raw.match(/[a-z%]+$/) ? raw : `${raw}px`;
    styles.push(`--sileo-offset-${side}:${unit};`);
  });
  return styles.join("");
}

export default class extends Controller {
  static values = {
    position: String,
    offset: Object,
    initial: Array,
    options: Object
  };

  connect() {
    this.position = this.positionValue || "top-right";
    this.viewportStyle = styleFromOffset(this.offsetValue);
    this.element.setAttribute("data-sileo-root", "");
    this.setupViewports();
    store.configure({ position: this.position, options: this.optionsValue || {} });

    this.unsubscribe = store.subscribe((toasts) => this.render(toasts));

    if (this.hasInitialValue) {
      this.initialValue.forEach((toast) => store.add(toast));
    }

    window.dispatchEvent(new CustomEvent("sileo:ready"));
  }

  disconnect() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.dismissTimers) {
      this.dismissTimers.forEach((timer) => window.clearTimeout(timer));
      this.dismissTimers.clear();
    }
    this.viewports = null;
  }

  render(toasts) {
    if (!this.viewports) this.setupViewports();
    const activeInstances = new Set();

    POSITIONS.forEach((position) => {
      const viewport = this.viewports[position];
      const bucket = toasts.filter((toast) => toast.position === position);
      const existing = new Map();
      Array.from(viewport.children).forEach((child) => {
        const key = child.getAttribute("data-instance-id");
        if (key) existing.set(key, child);
      });

      bucket.forEach((toast) => {
        const key = `${toast.instanceId}`;
        activeInstances.add(key);
        let node = existing.get(key);
        if (!node) {
          node = this.buildToast(toast);
          node.setAttribute("data-instance-id", key);
          node.setAttribute("data-toast-id", `${toast.id}`);
        } else {
          this.updateToastNode(node, toast);
          existing.delete(key);
        }
        viewport.appendChild(node);
        this.remeasureToast(node, toast);
        this.scheduleDismiss(toast);
      });

      existing.forEach((node) => node.remove());
    });

    this.pruneDismissTimers(activeInstances);
  }

  setupViewports() {
    this.element.innerHTML = "";
    this.viewports = {};
    POSITIONS.forEach((position) => {
      const viewport = document.createElement("div");
      viewport.setAttribute("data-sileo-viewport", "");
      viewport.setAttribute("data-position", position);
      viewport.setAttribute("style", this.viewportStyle);
      this.viewports[position] = viewport;
      this.element.appendChild(viewport);
    });
  }

  updateToastNode(node, toast) {
    node.setAttribute("data-exiting", toast.exiting ? "true" : "false");
    const titleColor = toast.titleColor ?? toast.title_color;
    const iconColor = toast.iconColor ?? toast.icon_color;
    node.style.setProperty("--sileo-title-color", titleColor || "");
    node.style.setProperty("--sileo-icon-color", iconColor || "");
  }

  remeasureToast(node, toast) {
    const header = node.querySelector("[data-sileo-header]");
    const title = node.querySelector("[data-sileo-title]");
    if (!header || !title) return;
    requestAnimationFrame(() => {
      if (!node.isConnected) return;
      this.applyFluidSizing(node, header, title, toast);
    });
  }

  pruneDismissTimers(activeInstances) {
    if (!this.dismissTimers) return;
    this.dismissTimers.forEach((timer, instanceId) => {
      if (activeInstances.has(instanceId)) return;
      window.clearTimeout(timer);
      this.dismissTimers.delete(instanceId);
    });
  }

  buildToast(toast) {
    const el = document.createElement("article");
    el.setAttribute("data-sileo-toast", "");
    const state = toast.state || "default";
    el.setAttribute("data-state", state);
    el.setAttribute("data-exiting", toast.exiting ? "true" : "false");
    const expandEdge = (toast.position || "").startsWith("bottom") ? "top" : "bottom";
    el.setAttribute("data-edge", expandEdge);
    const align = this.resolveAlign(toast.position);
    el.setAttribute("data-align", align);
    const hasDetails = Boolean(toast.description || (toast.button && toast.button.title));
    el.setAttribute("data-simple", hasDetails ? "false" : "true");
    this.applyAnchorStyle(el, align);
    el.style.setProperty("--sileo-fill", toast.fill || "");
    const titleColor = toast.titleColor ?? toast.title_color;
    const iconColor = toast.iconColor ?? toast.icon_color;
    el.style.setProperty("--sileo-title-color", titleColor || "");
    el.style.setProperty("--sileo-icon-color", iconColor || "");
    if (toast.roundness !== undefined) {
      el.style.setProperty("--sileo-roundness", `${toast.roundness}px`);
    }
    if (toast.fill === "black") {
      el.setAttribute("data-theme", "dark");
    }

    const card = document.createElement("div");
    card.setAttribute("data-sileo-card", "");
    const gooId = `sileo-gooey-${toast.id}-${toast.instanceId}`.replace(/[^a-zA-Z0-9_-]/g, "");

    const defsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defsSvg.setAttribute("data-sileo-defs", "");
    defsSvg.setAttribute("width", "0");
    defsSvg.setAttribute("height", "0");
    defsSvg.setAttribute("aria-hidden", "true");
    defsSvg.innerHTML = `
      <defs>
        <filter id="${gooId}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="goo"></feColorMatrix>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite>
        </filter>
      </defs>
    `;

    const goo = document.createElement("div");
    goo.setAttribute("data-sileo-goo", "");
    goo.style.setProperty("--sileo-goo-filter", `url(#${gooId})`);

    const blobPill = document.createElement("div");
    blobPill.setAttribute("data-sileo-goo-pill", "");
    const blobBody = document.createElement("div");
    blobBody.setAttribute("data-sileo-goo-body", "");
    goo.appendChild(blobPill);
    goo.appendChild(blobBody);
    card.appendChild(defsSvg);
    card.appendChild(goo);

    const header = document.createElement("div");
    header.setAttribute("data-sileo-header", "");

    const badge = document.createElement("span");
    badge.setAttribute("data-sileo-badge", "");
    badge.setAttribute("data-state", state);
    if (toast.styles && toast.styles.badge) badge.className = toast.styles.badge;
    if (Object.prototype.hasOwnProperty.call(toast, "icon") && toast.icon === null) {
      badge.setAttribute("hidden", "true");
    } else if (toast.icon !== undefined && toast.icon !== null) {
      badge.textContent = `${toast.icon}`;
    } else if (toast.state && ICONS[toast.state]) {
      badge.textContent = ICONS[toast.state];
    } else {
      badge.setAttribute("hidden", "true");
    }
    el.setAttribute("data-has-badge", badge.hasAttribute("hidden") ? "false" : "true");

    const title = document.createElement("p");
    title.setAttribute("data-sileo-title", "");
    title.setAttribute("data-state", state);
    if (toast.styles && toast.styles.title) title.className = toast.styles.title;
    title.textContent = toast.title || "Notification";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");

    header.appendChild(badge);
    header.appendChild(title);
    card.appendChild(header);

    if (toast.description || (toast.button && toast.button.title)) {
      const body = document.createElement("div");
      body.setAttribute("data-sileo-body", "");
      const bodyInner = document.createElement("div");
      bodyInner.setAttribute("data-sileo-body-inner", "");

      if (toast.description) {
        const description = document.createElement("p");
        description.setAttribute("data-sileo-description", "");
        if (toast.styles && toast.styles.description) description.className = toast.styles.description;
        description.textContent = `${toast.description}`;
        bodyInner.appendChild(description);
      }

      if (toast.button && toast.button.title) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.setAttribute("data-sileo-action", "");
        if (toast.styles && toast.styles.button) actionButton.className = toast.styles.button;
        actionButton.textContent = toast.button.title;
        bodyInner.appendChild(actionButton);
      }

      body.appendChild(bodyInner);
      card.appendChild(body);

      requestAnimationFrame(() => {
        const descriptionEl = bodyInner.querySelector("[data-sileo-description]");
        const hasAction = Boolean(toast.button && toast.button.title);
        let lineCount = 0;

        if (descriptionEl) {
          const descStyles = window.getComputedStyle(descriptionEl);
          const lineHeight = Number.parseFloat(descStyles.lineHeight || "0") || 20;
          lineCount = Math.max(1, Math.round(descriptionEl.scrollHeight / lineHeight));
        }

        let edgeExtra;
        let minContentHeight;
        if (hasAction) {
          edgeExtra = expandEdge === "top" ? 14 : 24;
          minContentHeight = 36;
        } else if (lineCount <= 1) {
          edgeExtra = expandEdge === "top" ? 2 : 6;
          minContentHeight = 24;
        } else {
          edgeExtra = expandEdge === "top" ? 8 : 14;
          minContentHeight = 32;
        }

        const contentHeight = Math.max(minContentHeight, bodyInner.scrollHeight + edgeExtra);
        el.style.setProperty("--sileo-content-height", `${contentHeight}px`);
      });
    }

    el.appendChild(card);
    this.applyFluidSizing(el, header, title, toast);

    const action = el.querySelector("[data-sileo-action]");
    if (action) {
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        window.dispatchEvent(
          new CustomEvent("sileo:action", {
            detail: { id: toast.id, action: toast.button?.action, toast }
          })
        );
        if (toast.button && typeof toast.button.onClick === "function") {
          toast.button.onClick();
        }
      });
    }

    this.attachDismissGestures(el, toast);

    if ((toast.description || toast.button) && toast.state !== "loading") {
      let expandTimer = null;
      let collapseTimer = null;
      const hoverDebounce = typeof toast.autopilot === "object"
        ? (toast.autopilot.expand ?? toast.autopilotExpand ?? 170)
        : (toast.autopilotExpand ?? 170);
      const collapseDebounce = typeof toast.autopilot === "object"
        ? (toast.autopilot.collapse ?? toast.autopilotCollapse ?? 120)
        : (toast.autopilotCollapse ?? 120);
      const collapseDelay = Math.max(MIN_COLLAPSE_DELAY_MS, collapseDebounce);

      const clearTimers = () => {
        if (expandTimer) window.clearTimeout(expandTimer);
        if (collapseTimer) window.clearTimeout(collapseTimer);
        expandTimer = null;
        collapseTimer = null;
      };

      el.addEventListener("mouseenter", () => {
        if (toast.autopilot === false) return;
        if (collapseTimer) {
          window.clearTimeout(collapseTimer);
          collapseTimer = null;
        }
        if (expandTimer) window.clearTimeout(expandTimer);
        expandTimer = window.setTimeout(() => {
          if (el.isConnected) el.setAttribute("data-expanded", "true");
        }, Math.max(0, hoverDebounce));
      });

      el.addEventListener("mouseleave", () => {
        if (expandTimer) {
          window.clearTimeout(expandTimer);
          expandTimer = null;
        }
        if (collapseTimer) window.clearTimeout(collapseTimer);
        collapseTimer = window.setTimeout(() => {
          if (el.isConnected) el.setAttribute("data-expanded", "false");
        }, collapseDelay);
      });

      el.addEventListener("pointerdown", clearTimers);
      el.addEventListener("pointercancel", clearTimers);
      el.addEventListener("pointerup", () => {
        if (el.hasAttribute("data-dragging")) return;
        if (!el.matches(":hover")) {
          if (collapseTimer) window.clearTimeout(collapseTimer);
          collapseTimer = window.setTimeout(() => {
            if (el.isConnected) el.setAttribute("data-expanded", "false");
          }, collapseDelay);
        }
      });

      el.setAttribute("data-expanded", "false");
    } else {
      el.style.setProperty("--sileo-content-height", "0px");
    }

    requestAnimationFrame(() => el.setAttribute("data-ready", "true"));
    return el;
  }

  applyFluidSizing(el, header, title, toast) {
    const hasBadge = el.getAttribute("data-has-badge") !== "false";
    const hasDetails = Boolean(toast.description || (toast.button && toast.button.title));
    const rawTitleWidth = Math.ceil(title.scrollWidth || title.getBoundingClientRect().width || 0);
    const fallbackTitleWidth = Math.max(
      88,
      Math.ceil(`${toast.title || "Notification"}`.length * 10.5)
    );
    const titleWidth = rawTitleWidth > 24 ? rawTitleWidth : fallbackTitleWidth;
    const visualMinTitleWidth = 86;
    const effectiveTitleWidth = Math.max(visualMinTitleWidth, titleWidth);
    const isMobile = window.innerWidth < 768;
    const maxToastByScreen = Math.floor(window.innerWidth * (isMobile ? 0.8 : 0.4));
    const viewportWidth = Math.max(220, Math.min(window.innerWidth - 24, maxToastByScreen));
    const maxCollapsed = Math.max(72, viewportWidth - 12);
    const headerContent = hasBadge ? (24 + 6 + effectiveTitleWidth) : effectiveTitleWidth;
    const basePadding = 24; // left(12) + right(12) from CSS
    const titleFontSize = Number.parseFloat(window.getComputedStyle(title).fontSize || "0") || 16;
    const adaptiveBuffer = Math.max(2, Math.round(titleFontSize * 0.12));
    const collapsedRaw = headerContent + basePadding + adaptiveBuffer;
    const minCollapsed = hasBadge ? 72 : 56;
    const collapsed = Math.max(minCollapsed, Math.min(maxCollapsed, collapsedRaw));
    const expanded = collapsed;
    const titleColWidth = Math.max(32, collapsed - (hasBadge ? 34 : 0) - basePadding - adaptiveBuffer);
    const pillHeight = this.measurePillHeight(title, titleColWidth, hasBadge, hasDetails);

    el.style.setProperty("--sileo-toast-width", `${viewportWidth}px`);
    el.style.setProperty("--sileo-pill-collapsed", `${collapsed}px`);
    el.style.setProperty("--sileo-pill-expanded", `${expanded}px`);
    el.style.setProperty("--sileo-pill-height", `${pillHeight}px`);
    header.style.setProperty("--sileo-pill-collapsed", `${collapsed}px`);
    header.style.setProperty("--sileo-pill-expanded", `${expanded}px`);
    header.style.setProperty("--sileo-pill-height", `${pillHeight}px`);
  }

  measurePillHeight(_titleEl, _width, hasBadge, _hasDetails) {
    // Keep collapsed pills visually consistent across all toast variants.
    return hasBadge ? 40 : 34;
  }

  resolveAlign(position) {
    if ((position || "").endsWith("left")) return "left";
    if ((position || "").endsWith("center")) return "center";
    return "right";
  }

  applyAnchorStyle(el, align) {
    if (align === "center") {
      el.style.setProperty("--sileo-anchor-left", "50%");
      el.style.setProperty("--sileo-anchor-right", "auto");
      el.style.setProperty("--sileo-anchor-shift", "-50%");
      return;
    }

    if (align === "left") {
      el.style.setProperty("--sileo-anchor-left", "0");
      el.style.setProperty("--sileo-anchor-right", "auto");
      el.style.setProperty("--sileo-anchor-shift", "0%");
      return;
    }

    el.style.setProperty("--sileo-anchor-left", "auto");
    el.style.setProperty("--sileo-anchor-right", "0");
    el.style.setProperty("--sileo-anchor-shift", "0%");
  }

  attachDismissGestures(el, toast) {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let deltaX = 0;
    const threshold = 80;

    const reset = () => {
      el.removeAttribute("data-dragging");
      el.style.setProperty("--sileo-drag-x", "0px");
      el.style.setProperty("--sileo-drag-opacity", "1");
      deltaX = 0;
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest("[data-sileo-action]")) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      deltaX = 0;
      el.setAttribute("data-interacting", "true");
      if (event.pointerType === "touch") {
        el.setAttribute("data-last-touch-at", `${Date.now()}`);
      }
      el.setAttribute("data-dragging", "true");
      if (event.pointerId !== undefined) el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!dragging) return;
      deltaX = event.clientX - startX;
      if (Math.abs(deltaX) > 4) moved = true;
      const opacity = Math.max(0.25, 1 - Math.abs(deltaX) / 220);
      el.style.setProperty("--sileo-drag-x", `${deltaX}px`);
      el.style.setProperty("--sileo-drag-opacity", `${opacity}`);
    };

    const onPointerEnd = (event) => {
      if (!dragging) return;
      dragging = false;
      if (event.pointerId !== undefined && el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }

      if (Math.abs(deltaX) >= threshold) {
        store.dismiss(toast.id);
      } else {
        reset();
      }
      el.setAttribute("data-interacting", "false");
      if (event.pointerType === "touch") {
        el.setAttribute("data-last-touch-at", `${Date.now()}`);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);
    el.addEventListener("mouseenter", () => el.setAttribute("data-interacting", "true"));
    el.addEventListener("mouseleave", () => el.setAttribute("data-interacting", "false"));

    el.addEventListener("click", (event) => {
      if (event.target.closest("[data-sileo-action]")) return;
      if (moved) {
        moved = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      store.dismiss(toast.id);
    });

    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        store.dismiss(toast.id);
      }
    });
  }

  scheduleDismiss(toast) {
    if (toast.exiting) return;
    if (toast.duration === null || toast.duration <= 0) return;
    if (this.dismissTimers?.has(toast.instanceId)) return;

    if (!this.dismissTimers) this.dismissTimers = new Map();
    const timer = window.setTimeout(() => {
      this.tryDismissToast(toast);
    }, toast.duration);

    this.dismissTimers.set(toast.instanceId, timer);
  }

  tryDismissToast(toast) {
    if (!this.dismissTimers) return;

    if (!this.canAutoDismiss(toast.id)) {
      const retry = window.setTimeout(() => {
        this.tryDismissToast(toast);
      }, DISMISS_RETRY_DELAY_MS);
      this.dismissTimers.set(toast.instanceId, retry);
      return;
    }

    store.dismiss(toast.id);
    this.dismissTimers.delete(toast.instanceId);
  }

  canAutoDismiss(toastId) {
    const node = this.element.querySelector(`[data-toast-id="${toastId}"]`);
    if (!node) return true;
    if (node.matches(":hover")) return false;
    if (node.getAttribute("data-interacting") === "true") return false;
    const lastTouch = Number(node.getAttribute("data-last-touch-at") || "0");
    if (lastTouch > 0 && Date.now() - lastTouch < MOBILE_TOUCH_GRACE_MS) return false;
    return true;
  }
}
