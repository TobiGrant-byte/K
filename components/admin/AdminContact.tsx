"use client";

import { useMemo, useState } from "react";
import {
  normalizeContactContent,
  useContactContent,
  useSaveContactMutation,
  type ContactContentInput,
  type ContactTopic,
} from "@/lib/domains/contact";
import { createId, formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";

export default function AdminContact() {
  const contactQuery = useContactContent();
  const saveMutation = useSaveContactMutation();
  const [draft, setDraft] = useState<ContactContentInput | null>(null);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!contactQuery.data) return null;
    const normalized = normalizeContactContent(contactQuery.data);
    return {
      eyebrow: normalized.eyebrow,
      title: normalized.title,
      titleAccent: normalized.titleAccent,
      subtitle: normalized.subtitle,
      topics: normalized.topics,
    } satisfies ContactContentInput;
  }, [contactQuery.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const dirty = useMemo(() => {
    if (!draft || !contactQuery.data) return false;
    const current = normalizeContactContent(contactQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        eyebrow: current.eyebrow,
        title: current.title,
        titleAccent: current.titleAccent,
        subtitle: current.subtitle,
        topics: current.topics,
      })
    );
  }, [draft, contactQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {contactQuery.isPending
          ? "Loading contact…"
          : "Could not load contact content."}
      </p>
    );
  }

  const patch = (next: Partial<ContactContentInput>) => {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const updateTopic = (index: number, patchTopic: Partial<ContactTopic>) => {
    const topics = draft.topics.map((item, i) =>
      i === index ? { ...item, ...patchTopic } : item,
    );
    patch({ topics });
  };

  const addTopic = () => {
    patch({
      topics: [
        ...draft.topics,
        { id: createId(), label: "", detail: "" },
      ],
    });
  };

  const moveTopic = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.topics.length) return;
    const topics = [...draft.topics];
    const [item] = topics.splice(index, 1);
    topics.splice(next, 0, item!);
    patch({ topics });
  };

  const confirmRemove = () => {
    if (pendingRemoveIndex === null) return;
    if (draft.topics.length <= 1) {
      setPendingRemoveIndex(null);
      return;
    }
    patch({
      topics: draft.topics.filter((_, i) => i !== pendingRemoveIndex),
    });
    setPendingRemoveIndex(null);
  };

  const onSubmit = async () => {
    if (
      !draft.eyebrow.trim() ||
      !draft.title.trim() ||
      !draft.subtitle.trim()
    ) {
      adminToast.error("Eyebrow, title, and subtitle are required.");
      return;
    }
    if (draft.topics.some((t) => !t.label.trim() || !t.detail.trim())) {
      adminToast.error("Each topic needs a label and detail.");
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Submitted.");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not submit contact.",
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="max-w-2xl">
        <p className="text-sm text-white/50">
          Edit the Contact page copy and topic list. The message form stays the
          same on the public site.
        </p>
        {contactQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Updated {formatPostDate(contactQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Eyebrow
            </span>
            <input
              value={draft.eyebrow}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Accent phrase (italic)
            </span>
            <input
              value={draft.titleAccent}
              onChange={(e) => patch({ titleAccent: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Subtitle
            </span>
            <textarea
              value={draft.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg text-white">Topics</h3>
          <button
            type="button"
            onClick={addTopic}
            className="rounded-lg border border-dashed border-white/20 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
          >
            Add topic
          </button>
        </div>

        {draft.topics.map((topic, index) => (
          <div
            key={topic.id}
            className="space-y-3 rounded-xl border border-white/10 bg-navy-800/40 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                Topic {index + 1}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveTopic(index, -1)}
                  className="rounded-md border border-white/12 px-2.5 py-1.5 text-xs text-white/55 hover:text-white disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === draft.topics.length - 1}
                  onClick={() => moveTopic(index, 1)}
                  className="rounded-md border border-white/12 px-2.5 py-1.5 text-xs text-white/55 hover:text-white disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  disabled={draft.topics.length <= 1}
                  onClick={() => setPendingRemoveIndex(index)}
                  className="rounded-md border border-white/12 px-2.5 py-1.5 text-xs text-white/55 hover:text-white disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              value={topic.label}
              onChange={(e) => updateTopic(index, { label: e.target.value })}
              placeholder="Label"
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
            <input
              value={topic.detail}
              onChange={(e) => updateTopic(index, { detail: e.target.value })}
              placeholder="Detail"
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="max-w-md text-sm text-white/45">
          Submit updates the public Contact page copy.
        </p>
        <button
          type="button"
          disabled={saveMutation.isPending || !dirty}
          onClick={() => void onSubmit()}
          className="rounded-lg bg-accent px-6 py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white hover:bg-accent-light disabled:opacity-50"
        >
          {saveMutation.isPending ? "Submitting…" : "Submit"}
        </button>
      </div>

      <AdminConfirmDialog
        open={pendingRemoveIndex !== null}
        eyebrow="Remove topic"
        title="Remove this topic?"
        description="It will be removed from this draft. Submit to apply on the public site."
        confirmLabel="Remove"
        onCancel={() => setPendingRemoveIndex(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
