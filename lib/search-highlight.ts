/** Build an internal href that carries the search highlight query. */
export function withHighlightQuery(href: string, query: string): string {
  const q = query.trim();
  if (!q || href.startsWith("http")) return href;

  const hashIndex = href.indexOf("#");
  const pathWithQuery = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";

  const [pathname, existing = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(existing);
  params.set("q", q);

  const search = params.toString();
  return `${pathname || "/"}?${search}${hash}`;
}

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "MARK",
]);

function shouldSkip(node: Node): boolean {
  let el: Element | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  while (el) {
    if (el instanceof HTMLElement) {
      if (el.dataset.searchHit !== undefined) return true;
      if (el.dataset.searchUi !== undefined) return true;
      if (el.closest("nav, footer, [data-search-ui]")) return true;
    }
    if (SKIP_TAGS.has(el.tagName)) return true;
    el = el.parentElement;
  }
  return false;
}

/** Remove previous search highlight marks created by this feature. */
export function clearSearchHighlights(root: ParentNode = document.body): void {
  root.querySelectorAll("mark[data-search-hit]").forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

/**
 * Walk text nodes under `root` and wrap case-insensitive matches of `query`
 * in <mark data-search-hit>. Returns the created mark elements in document order.
 */
export function applySearchHighlights(
  root: ParentNode,
  query: string,
): HTMLElement[] {
  clearSearchHighlights(root);

  const q = query.trim();
  if (!q || q.length < 2) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  const marks: HTMLElement[] = [];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? "";
    regex.lastIndex = 0;
    if (!regex.test(text)) continue;
    regex.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const mark = document.createElement("mark");
      mark.dataset.searchHit = "";
      mark.textContent = match[0];
      frag.appendChild(mark);
      marks.push(mark);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(frag, textNode);
  }

  return marks;
}
