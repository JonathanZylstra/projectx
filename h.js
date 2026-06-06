// Tiny hyperscript helpers. Everything in Wisp's UI is constructed with these
// instead of hand-written HTML, so the whole project stays in one language.
//
//   h("div", { class: "panel" }, "hello", h("span", null, "world"))
//   s("svg", { viewBox: "0 0 24 24" }, s("path", { d: "M3 16c4 0..." }))
//
// `h` creates HTML elements; `s` creates SVG-namespaced elements (so nested
// SVG paths/circles render correctly). Attributes are applied verbatim via
// setAttribute, which covers class, id, data-*, aria-*, viewBox, min/max, etc.

const SVG_NS = "http://www.w3.org/2000/svg";

function setProps(el, props) {
  if (!props) return;
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    el.setAttribute(key, value === true ? "" : String(value));
  }
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.appendChild(
      child instanceof Node ? child : document.createTextNode(String(child))
    );
  }
}

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  setProps(el, props);
  appendChildren(el, children);
  return el;
}

export function s(tag, props, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  setProps(el, props);
  appendChildren(el, children);
  return el;
}
