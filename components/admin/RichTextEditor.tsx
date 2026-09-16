"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";
import { countHtmlImages, sanitizeBlogHtml } from "@/lib/blog";

type Props = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  maxImages: number;
  onRequestImage: () => void;
  uploading?: boolean;
  disabled?: boolean;
  minHeightClass?: string;
  hint?: string;
  editorRef?: RefObject<HTMLDivElement | null>;
};

function isElement(node: Node | null): node is HTMLElement {
  return Boolean(node && node.nodeType === Node.ELEMENT_NODE);
}

function closestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (isElement(current)) {
      const tag = current.tagName;
      if (
        tag === "P" ||
        tag === "DIV" ||
        tag === "IMG" ||
        tag === "H1" ||
        tag === "H2" ||
        tag === "H3"
      ) {
        return current;
      }
    }
    current = current.parentNode;
  }
  return null;
}

function enhanceImage(img: HTMLImageElement) {
  img.contentEditable = "false";
  img.draggable = true;
  img.setAttribute("data-rte-img", "1");
  if (!img.style.width) img.style.width = "100%";
  if (!img.style.height) img.style.height = "auto";
  img.style.maxWidth = "100%";
  img.style.display = "block";
  img.style.objectFit = "contain";
  img.style.background = "rgba(5,13,26,0.65)";
  img.style.borderRadius = "8px";
  img.style.margin = "12px 0";
  img.style.cursor = "grab";
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  maxImages,
  onRequestImage,
  uploading = false,
  disabled = false,
  minHeightClass = "min-h-[160px]",
  hint,
  editorRef,
}: Props) {
  const internalEditorRef = useRef<HTMLDivElement | null>(null);
  const skipValueSync = useRef(false);
  const insertAfterBlockIndex = useRef<number | null>(null);
  const draggedImg = useRef<HTMLImageElement | null>(null);
  const resizeState = useRef<{
    img: HTMLImageElement;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const [boldOn, setBoldOn] = useState(false);
  const [italicOn, setItalicOn] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeImg, setActiveImg] = useState<HTMLImageElement | null>(null);
  const [handlePos, setHandlePos] = useState<{ left: number; top: number } | null>(
    null,
  );
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const uploadingRef = useRef(uploading);
  uploadingRef.current = uploading;
  const fieldId = useId();

  const imageCount = countHtmlImages(value);
  const canAddImage = imageCount < maxImages && !uploading;

  /** Pixels below the admin header — toolbar sticks under it. */
  const [stickyTop, setStickyTop] = useState(128);
  /** True only while sticky has engaged (toolbar would have scrolled away). */
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector<HTMLElement>("[data-admin-header]");
      setStickyTop(
        header ? Math.ceil(header.getBoundingClientRect().bottom) : 72,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  useEffect(() => {
    if (!focused) {
      setIsStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sentinel sits at the toolbar’s natural place. When it scrolls
        // out above the sticky offset, the bar is stuck.
        setIsStuck(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: `-${stickyTop}px 0px 0px 0px`,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [focused, stickyTop]);

  const leaveEditor = useCallback(() => {
    setFocused(false);
    setIsStuck(false);
    setActiveImg(null);
  }, []);

  const updateHandlePos = useCallback((img: HTMLImageElement | null) => {
    const wrap = wrapRef.current;
    if (!img || !wrap) {
      setHandlePos(null);
      return;
    }
    const imgRect = img.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    setHandlePos({
      left: imgRect.right - wrapRect.left - 10,
      top: imgRect.bottom - wrapRect.top - 10,
    });
  }, []);

  useEffect(() => {
    if (!activeImg) {
      setHandlePos(null);
      return;
    }
    updateHandlePos(activeImg);
    const onScrollOrResize = () => updateHandlePos(activeImg);
    window.addEventListener("resize", onScrollOrResize);
    return () => window.removeEventListener("resize", onScrollOrResize);
  }, [activeImg, updateHandlePos]);

  useEffect(() => {
    if (uploading) setFocused(true);
  }, [uploading]);

  const enhanceAllImages = useCallback(() => {
    const el = internalEditorRef.current;
    if (!el) return;
    el.querySelectorAll("img").forEach((node) => {
      enhanceImage(node as HTMLImageElement);
    });
  }, []);

  const setEditorElement = useCallback(
    (element: HTMLDivElement | null) => {
      internalEditorRef.current = element;
      if (editorRef) editorRef.current = element;
      if (element) {
        element.querySelectorAll("img").forEach((node) => {
          enhanceImage(node as HTMLImageElement);
        });
      }
    },
    [editorRef],
  );

  const syncFromEditor = useCallback(
    (sanitize = false) => {
      const el = internalEditorRef.current;
      if (!el) return;
      enhanceAllImages();
      const html = sanitize ? sanitizeBlogHtml(el.innerHTML) : el.innerHTML;
      skipValueSync.current = true;
      onChange(html);
      if (sanitize) {
        const next = html || "<p><br></p>";
        if (el.innerHTML !== next) {
          el.innerHTML = next;
          enhanceAllImages();
        }
      }
    },
    [enhanceAllImages, onChange],
  );

  useEffect(() => {
    const el = internalEditorRef.current;
    if (!el) return;
    if (skipValueSync.current) {
      skipValueSync.current = false;
      return;
    }
    const next = value || "<p><br></p>";
    if (el.innerHTML !== next) {
      el.innerHTML = next;
      enhanceAllImages();
    }
  }, [value, enhanceAllImages]);

  const blockIndexForNode = (node: Node | null) => {
    const el = internalEditorRef.current;
    if (!el || !node) return null;
    const block = closestBlock(node, el);
    if (!block || block === el) return el.childNodes.length - 1;
    return Array.from(el.childNodes).indexOf(block);
  };

  const rememberInsertPoint = () => {
    const el = internalEditorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) {
      insertAfterBlockIndex.current = el ? el.childNodes.length - 1 : null;
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      insertAfterBlockIndex.current = el.childNodes.length - 1;
      return;
    }
    insertAfterBlockIndex.current = blockIndexForNode(
      range.endContainer,
    );
  };

  const updateToolbarState = () => {
    try {
      setBoldOn(document.queryCommandState("bold"));
      setItalicOn(document.queryCommandState("italic"));
    } catch {
      /* ignore */
    }
  };

  const runCommand = (command: "bold" | "italic") => {
    if (disabled) return;
    const el = internalEditorRef.current;
    el?.focus();
    document.execCommand(command, false);
    syncFromEditor(false);
    updateToolbarState();
  };

  const handleAddImageClick = () => {
    if (!canAddImage || disabled) return;
    rememberInsertPoint();
    onRequestImage();
  };

  const placeCaretIn = (node: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  /** Insert image as its own block BELOW the paragraph the user was in. */
  const insertImageAtCursor = useCallback(
    (url: string) => {
      const el = internalEditorRef.current;
      if (!el) return;
      if (countHtmlImages(el.innerHTML) >= maxImages) return;

      el.focus();

      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      enhanceImage(img);

      const afterIndex = insertAfterBlockIndex.current;
      const children = Array.from(el.childNodes);
      const anchor =
        afterIndex != null && afterIndex >= 0 && afterIndex < children.length
          ? (children[afterIndex] as ChildNode)
          : el.lastChild;

      if (anchor) {
        // If caret was on an image, put the new one after it; otherwise after the text block.
        anchor.after(img);
      } else {
        el.appendChild(img);
      }

      const nextPara = document.createElement("p");
      nextPara.innerHTML = "<br>";
      img.after(nextPara);
      placeCaretIn(nextPara);

      insertAfterBlockIndex.current = null;
      setActiveImg(img);
      syncFromEditor(false);
    },
    [maxImages, syncFromEditor],
  );

  useEffect(() => {
    const el = internalEditorRef.current as
      | (HTMLDivElement & { __insertImage?: (url: string) => void })
      | null;
    if (!el) return;
    el.__insertImage = insertImageAtCursor;
    return () => {
      delete el.__insertImage;
    };
  }, [insertImageAtCursor]);

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncFromEditor(false);
  };

  const onInput = () => {
    enhanceAllImages();
    syncFromEditor(false);
    updateToolbarState();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Backspace") return;
    const el = internalEditorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || !sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // Caret directly after an image among siblings
    const container = range.startContainer;
    if (container.nodeType === Node.ELEMENT_NODE && range.startOffset > 0) {
      const prev = container.childNodes[range.startOffset - 1];
      if (isElement(prev) && prev.tagName === "IMG") {
        e.preventDefault();
        if (activeImg === prev) setActiveImg(null);
        prev.remove();
        syncFromEditor(false);
        return;
      }
    }

    // Backspace at start of a block — remove previous image sibling
    if (range.startOffset === 0) {
      const block = closestBlock(range.startContainer, el);
      const prev = block?.previousSibling;
      if (prev && isElement(prev) && prev.tagName === "IMG") {
        e.preventDefault();
        if (activeImg === prev) setActiveImg(null);
        prev.remove();
        syncFromEditor(false);
        return;
      }
    }

    // Empty paragraph after an image
    const block = closestBlock(range.startContainer, el);
    if (
      block &&
      block.tagName === "P" &&
      !(block.textContent || "").replace(/\u00a0/g, "").trim()
    ) {
      const prev = block.previousSibling;
      if (prev && isElement(prev) && prev.tagName === "IMG") {
        e.preventDefault();
        if (activeImg === prev) setActiveImg(null);
        prev.remove();
        syncFromEditor(false);
      }
    }
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "IMG") return;
    draggedImg.current = target as HTMLImageElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "rte-image");
    target.style.opacity = "0.45";
  };

  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") target.style.opacity = "1";
    draggedImg.current = null;
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggedImg.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    const el = internalEditorRef.current;
    const img = draggedImg.current;
    if (!el || !img) return;
    e.preventDefault();

    const point =
      typeof document.caretRangeFromPoint === "function"
        ? document.caretRangeFromPoint(e.clientX, e.clientY)
        : null;
    const dropNode = point?.startContainer || (e.target as Node);
    let block = closestBlock(dropNode, el);

    // Dropping onto itself — ignore
    if (block === img) {
      img.style.opacity = "1";
      draggedImg.current = null;
      return;
    }

    if (!block) {
      el.appendChild(img);
    } else if (block.tagName === "IMG") {
      const rect = block.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        block.before(img);
      } else {
        block.after(img);
      }
    } else {
      const rect = block.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        block.before(img);
      } else {
        block.after(img);
      }
    }

    img.style.opacity = "1";
    draggedImg.current = null;
    setActiveImg(img);
    syncFromEditor(false);
  };

  const onEditorMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setActiveImg(img);
      requestAnimationFrame(() => updateHandlePos(img));
      return;
    }
    if (!(e.target as HTMLElement).closest("[data-rte-resize]")) {
      setActiveImg(null);
    }
  };

  const startResize = (e: ReactMouseEvent, img: HTMLImageElement) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = img.getBoundingClientRect();
    resizeState.current = {
      img,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };

    const onMove = (ev: globalThis.MouseEvent) => {
      const state = resizeState.current;
      const editor = internalEditorRef.current;
      if (!state || !editor) return;
      const maxW = editor.clientWidth;
      const nextW = Math.min(
        maxW,
        Math.max(80, state.startW + (ev.clientX - state.startX)),
      );
      const nextH = Math.max(60, state.startH + (ev.clientY - state.startY));
      state.img.style.width = `${Math.round(nextW)}px`;
      state.img.style.height = `${Math.round(nextH)}px`;
      updateHandlePos(state.img);
    };

    const onUp = () => {
      const img = resizeState.current?.img || null;
      resizeState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (img) updateHandlePos(img);
      syncFromEditor(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const toolBtn = (active: boolean) =>
    `rounded-md border px-3 py-1.5 font-title text-[9px] uppercase tracking-[1.5px] transition-colors ${
      active
        ? "border-accent/50 bg-accent/20 text-accent-light"
        : "border-white/15 text-white/65 hover:border-white/30 hover:text-white"
    } disabled:opacity-40`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="font-title text-[9px] uppercase tracking-[2px] text-white/40"
        >
          {label}
        </label>
        <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Images {imageCount} / {maxImages}
        </span>
      </div>

      <div
        ref={shellRef}
        className={`relative rounded-lg border border-white/12 bg-white/5 ${
          disabled ? "opacity-60" : ""
        }`}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (e.currentTarget.contains(next)) return;
          window.setTimeout(() => {
            if (uploadingRef.current) return;
            const active = document.activeElement;
            if (
              e.currentTarget.contains(active) ||
              (active as HTMLElement | null)?.closest?.("[data-rte-resize]")
            ) {
              return;
            }
            leaveEditor();
            syncFromEditor(true);
          }, 0);
        }}
      >
        <div ref={sentinelRef} className="pointer-events-none h-0 w-full" aria-hidden />
        <div
          ref={toolbarRef}
          className={`flex flex-wrap items-center gap-1.5 border-b border-white/10 px-2 py-2 ${
            focused ? "sticky z-30" : "relative"
          } ${focused && isStuck ? "bg-navy-900" : "bg-transparent"}`}
          style={focused ? { top: stickyTop } : undefined}
        >
          <button
            type="button"
            className={toolBtn(boldOn)}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("bold")}
          >
            Bold
          </button>
          <button
            type="button"
            className={toolBtn(italicOn)}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand("italic")}
          >
            Italic
          </button>
          <button
            type="button"
            className={toolBtn(false)}
            disabled={disabled || !canAddImage}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddImageClick}
            title={
              canAddImage
                ? "Insert image below current paragraph"
                : `Max ${maxImages} image${maxImages === 1 ? "" : "s"}`
            }
          >
            {uploading ? "Uploading…" : "Add image"}
          </button>
        </div>

        <div className="relative" ref={wrapRef}>
          <div
            id={fieldId}
            ref={setEditorElement}
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            contentEditable={!disabled}
            suppressContentEditableWarning
            className={`${minHeightClass} px-4 py-3 text-sm leading-relaxed text-white outline-none [&_em]:italic [&_strong]:font-semibold`}
            onInput={onInput}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            onKeyUp={updateToolbarState}
            onMouseDown={onEditorMouseDown}
            onMouseUp={updateToolbarState}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onBlur={() => {
              window.setTimeout(() => {
                if (
                  !shellRef.current?.contains(document.activeElement) &&
                  !(document.activeElement as HTMLElement | null)?.closest?.(
                    "[data-rte-resize]",
                  ) &&
                  !uploadingRef.current
                ) {
                  setActiveImg(null);
                  syncFromEditor(true);
                }
              }, 120);
            }}
          />

          {handlePos && activeImg && !disabled ? (
            <button
              type="button"
              data-rte-resize
              aria-label="Resize image"
              className="absolute z-10 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-accent bg-accent-light shadow"
              style={{ left: handlePos.left, top: handlePos.top }}
              onMouseDown={(e) => startResize(e, activeImg)}
            />
          ) : null}
        </div>
      </div>

      {hint ? (
        <p className="text-[12px] leading-relaxed text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}

export function insertImageIntoEditor(
  editorEl: HTMLDivElement | null,
  url: string,
) {
  const el = editorEl as
    | (HTMLDivElement & { __insertImage?: (url: string) => void })
    | null;
  el?.__insertImage?.(url);
}
