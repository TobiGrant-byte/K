"use client";

import { ADMIN_NAV } from "@/lib/admin/nav";
import {
  useAdminUiStore,
  type AdminSection,
} from "@/lib/admin/ui-store";

export default function AdminSidebar() {
  const section = useAdminUiStore((s) => s.section);
  const setSection = useAdminUiStore((s) => s.setSection);
  const sidebarOpen = useAdminUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminUiStore((s) => s.setSidebarOpen);

  const groups = (() => {
    const map = new Map<string | null, typeof ADMIN_NAV>();
    for (const item of ADMIN_NAV) {
      const key = item.group ?? null;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  })();

  const navButton = (id: AdminSection, label: string, enabled: boolean) => {
    const active = section === id;
    return (
      <button
        key={id}
        type="button"
        disabled={!enabled}
        onClick={() => enabled && setSection(id)}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
          !enabled
            ? "cursor-not-allowed text-white/35"
            : active
              ? "bg-accent/20 text-accent-light"
              : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="font-medium">{label}</span>
        {!enabled ? (
          <span className="font-title text-[8px] uppercase tracking-[1.5px] text-white/30">
            Soon
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-white/10 bg-navy-800 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="shrink-0 border-b border-white/10 px-5 py-5">
          <div className="font-title text-[10px] uppercase tracking-[2.5px] text-accent-light">
            CMS
          </div>
          <div className="mt-1 font-display text-xl font-medium text-white">
            Content Admin
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {(groups.get(null) ?? [])
            .filter((item) => item.enabled)
            .map((item) => navButton(item.id, item.label, item.enabled))}

          {[...groups.entries()]
            .filter(([key]) => key !== null)
            .map(([group, items]) => {
              const visible = items.filter((item) => item.enabled);
              if (!visible.length) return null;
              return (
                <div key={group!}>
                  <div className="mb-1.5 px-3 font-title text-[9px] uppercase tracking-[2px] text-white/35">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {visible.map((item) =>
                      navButton(item.id, item.label, item.enabled),
                    )}
                  </div>
                </div>
              );
            })}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-5 py-4">
          <div className="h-px w-10 bg-accent/50" />
          <p className="mt-3 font-display text-xs italic text-white/40">
            Dr. Sunday Okafor
          </p>
        </div>
      </aside>
    </>
  );
}
