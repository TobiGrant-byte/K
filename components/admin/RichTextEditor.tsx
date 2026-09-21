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
  img.style.background = "rgba(5, 13, 26, 0.65)";
  img.style.border = "1px solid rgba(255, 255, 255, 0.12)";
  img.style.borderRadius = "8px";
  img.style.margin = "12px 0";
  img.style.cursor = "grab";
}

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

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
  const [bulletOn, setBulletOn] = useState(false);
  const [numberOn, setNumberOn] = useState(false);
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
  const stickyTopRef = useRef(128);
  const fieldId = useId();

  const imageCount = countHtmlImages(value);
  const canAddImage = imageCount < maxImages && !uploading;

  /** Sticky toolbar is desktop-only — mobile keyboard + sticky caused tab crashes. */
  const [stickyEnabled, setStickyEnabled] = useState(false);
  const [stickyTop, setStickyTop] = useState(128);
  const [isStuck, setIsStuck] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const syncFromEditorRef = useRef<(sanitize?: boolean) => void>(() => {});
  const interimSpeechRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (pointer: fine)");
    const syncMq = () => setStickyEnabled(mq.matches);
    syncMq();
    mq.addEventListener("change", syncMq);
    return () => mq.removeEventListener("change", syncMq);
  }, []);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    const clearInterim = () => {
      const node = interimSpeechRef.current;
      if (node?.isConnected) {
        const parent = node.parentNode;
        node.remove();
        if (
          parent &&
          parent !== internalEditorRef.current &&
          parent.childNodes.length === 0
        ) {
          (parent as HTMLElement).appendChild(document.createElement("br"));
        }
      }
      interimSpeechRef.current = null;
    };

    const placeInterimAtCaret = () => {
      clearInterim();
      const span = document.createElement("span");
      span.setAttribute("data-speech-interim", "1");
      span.style.opacity = "0.55";
      span.appendChild(document.createTextNode("\u200b"));

      const sel = window.getSelection();
      const editor = internalEditorRef.current;
      if (sel && sel.rangeCount > 0 && editor?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
      } else if (editor) {
        editor.appendChild(span);
      }

      const next = document.createRange();
      next.setStartAfter(span);
      next.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(next);
      interimSpeechRef.current = span;
      return span;
    };

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const piece = result[0]?.transcript || "";
        if (result.isFinal) finalChunk += piece;
        else interim += piece;
      }

      const editor = internalEditorRef.current;
      editor?.focus();

      if (finalChunk) {
        clearInterim();
        const inserted = document.execCommand(
          "insertText",
          false,
          finalChunk.endsWith(" ") ? finalChunk : `${finalChunk} `,
        );
        if (!inserted) {
          editor?.append(document.createTextNode(`${finalChunk} `));
        }
      }

      if (interim) {
        const node =
          interimSpeechRef.current?.isConnected
            ? interimSpeechRef.current
            : placeInterimAtCaret();
        node.textContent = interim;
        const sel = window.getSelection();
        const after = document.createRange();
        after.setStartAfter(node);
        after.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(after);
      } else if (!finalChunk) {
        // keep empty interim marker while still listening
      } else {
        clearInterim();
      }

      syncFromEditorRef.current(false);
    };

    recognition.onerror = (event) => {
      const code = event.error || "speech error";
      if (code === "aborted" || code === "no-speech") return;
      setSpeechError(
        code === "not-allowed"
          ? "Microphone permission blocked."
          : "Voice input stopped.",
      );
      clearInterim();
      setListening(false);
    };

    recognition.onend = () => {
      const node = interimSpeechRef.current;
      if (node?.isConnected && (node.textContent || "").replace(/\u200b/g, "").trim()) {
        const text = (node.textContent || "").replace(/\u200b/g, "");
        clearInterim();
        document.execCommand("insertText", false, `${text} `);
        syncFromEditorRef.current(false);
      } else {
        clearInterim();
      }
      setListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort?.();
        recognition.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      interimSpeechRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!stickyEnabled) {
      setIsStuck(false);
      return;
    }

    const measure = () => {
      const header = document.querySelector<HTMLElement>("[data-admin-header]");
      const next = header
        ? Math.ceil(header.getBoundingClientRect().bottom)
        : 72;
      if (next === stickyTopRef.current) return;
      stickyTopRef.current = next;
      setStickyTop(next);
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [stickyEnabled]);

  useEffect(() => {
    if (!stickyEnabled || !focused) {
      setIsStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = !entry.isIntersecting;
        setIsStuck((prev) => (prev === stuck ? prev : stuck));
      },
      {
        threshold: 0,
        rootMargin: `-${stickyTop}px 0px 0px 0px`,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyEnabled, focused, stickyTop]);

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
        // Rewriting innerHTML during mobile keyboard dismiss crashes WebKit/Chrome.
        const coarse =
          typeof window !== "undefined" &&
          window.matchMedia("(pointer: coarse)").matches;
        if (!coarse && el.innerHTML !== next) {
          el.innerHTML = next;
          enhanceAllImages();
        }
      }
    },
    [enhanceAllImages, onChange],
  );
  syncFromEditorRef.current = syncFromEditor;

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
      setBulletOn(document.queryCommandState("insertUnorderedList"));
      setNumberOn(document.queryCommandState("insertOrderedList"));
    } catch {
      /* ignore */
    }
  };

  const runCommand = (
    command: "bold" | "italic" | "insertUnorderedList" | "insertOrderedList",
  ) => {
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

  const toggleVoice = () => {
    if (disabled || !speechSupported) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setSpeechError("");
    if (listening) {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      return;
    }
    internalEditorRef.current?.focus();
    try {
      recognition.start();
      setListening(true);
    } catch {
      setSpeechError("Could not start microphone.");
      setListening(false);
    }
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
    const el = internalEditorRef.current;
    if (el?.querySelector("img")) enhanceAllImages();
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

  const iconBtn = (active: boolean) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 transition-colors ${
      active
        ? "border-accent/50 bg-accent/10 text-accent"
        : "border-white/12 text-white/60 hover:border-white/20 hover:text-white"
    } disabled:opacity-40`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="font-title text-[9px] uppercase tracking-[2px] text-white/50"
        >
          {label}
        </label>
        <span className="font-title text-[9px] uppercase tracking-[2px] text-accent">
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
          const shell = e.currentTarget;
          const next = e.relatedTarget as Node | null;
          if (shell.contains(next)) return;
          window.setTimeout(() => {
            if (uploadingRef.current) return;
            const active = document.activeElement;
            const root = shellRef.current ?? shell;
            if (
              (active && root.contains(active)) ||
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
          className={`flex flex-wrap items-center gap-1.5 border-b border-white/12 px-2 py-2 ${
            stickyEnabled && focused ? "sticky z-30" : "relative"
          } ${
            stickyEnabled && focused && isStuck
              ? "bg-navy-900 shadow-sm"
              : "bg-white/5"
          }`}
          style={
            stickyEnabled && focused ? { top: stickyTop } : undefined
          }
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <button
              type="button"
              className={iconBtn(boldOn)}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("bold")}
              title="Bold"
              aria-label="Bold"
            >
              <span className="font-serif text-[15px] font-bold leading-none">B</span>
            </button>
            <button
              type="button"
              className={iconBtn(italicOn)}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("italic")}
              title="Italic"
              aria-label="Italic"
            >
              <span className="font-serif text-[15px] italic leading-none">I</span>
            </button>
            <button
              type="button"
              className={iconBtn(bulletOn)}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("insertUnorderedList")}
              title="Bullet list"
              aria-label="Bullet list"
            >
              <span
                className="flex items-center gap-1 text-[11px] leading-none"
                aria-hidden
              >
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </span>
            </button>
            <button
              type="button"
              className={iconBtn(numberOn)}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("insertOrderedList")}
              title="Numbered list"
              aria-label="Numbered list"
            >
              <span
                className="flex items-center gap-1 font-title text-[10px] leading-none tracking-wide"
                aria-hidden
              >
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </span>
            </button>
            <button
              type="button"
              className={iconBtn(false)}
              disabled={disabled || !canAddImage}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAddImageClick}
              title={
                uploading
                  ? "Uploading…"
                  : canAddImage
                    ? "Insert image below current paragraph"
                    : `Max ${maxImages} image${maxImages === 1 ? "" : "s"}`
              }
              aria-label={uploading ? "Uploading image" : "Add image"}
            >
              {uploading ? (
                <span className="h-3.5 w-3.5 animate-pulse rounded-sm border border-current opacity-70" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden
                >
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                  <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m7.5 16.5 3.2-3.6 2.3 2.2 2.4-2.8 3.1 4.2"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="button"
            className={`ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
              listening
                ? "border-rose-400/50 bg-rose-500/15 text-rose-400"
                : "border-white/12 text-white/50 hover:border-white/20 hover:text-white"
            } disabled:opacity-40`}
            disabled={disabled || !speechSupported}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleVoice}
            title={
              speechSupported
                ? listening
                  ? "Stop voice input"
                  : "Dictate with microphone"
                : "Voice input not supported in this browser"
            }
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
            </svg>
          </button>
        </div>
        {speechError ? (
          <p className="mt-1 px-2 text-[11px] text-amber-400" role="status">
            {speechError}
          </p>
        ) : null}

        <div className="relative" ref={wrapRef}>
          <div
            id={fieldId}
            ref={setEditorElement}
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            contentEditable={!disabled}
            suppressContentEditableWarning
            className={`${minHeightClass} px-4 py-3 text-sm leading-relaxed text-white outline-none [&_a]:text-accent [&_em]:italic [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6`}
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
