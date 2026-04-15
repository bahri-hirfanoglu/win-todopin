<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { api } from "$lib/api";
  import { setLanguage, t } from "$lib/i18n";
  import { applyThemeVars, themes, themeList } from "$lib/themes";
  import { applyAppTheme } from "$lib/appThemes";
  import ConfirmDialog from "$lib/ConfirmDialog.svelte";
  import type { Card, CardTheme, TodoItem } from "$lib/types";

  // Parse ?cid=<id>&theme=<theme>
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("cid") ?? "";
  const initialTheme = (params.get("theme") as CardTheme) || "peach";

  let card = $state<Card | null>(null);
  let newTodo = $state("");
  let menuOpen = $state(false);
  let doneOpen = $state(false);
  let confirmDeleteOpen = $state(false);
  let titleEl = $state<HTMLInputElement | undefined>();
  let rootEl = $state<HTMLElement | undefined>();
  let listeners: UnlistenFn[] = [];

  // Inline edit state
  let editingId = $state<string | null>(null);
  let editText = $state("");
  let editEl = $state<HTMLInputElement | undefined>();

  // Drag-to-reorder state (active todos only) — pointer-based to avoid
  // WebView2 HTML5 drag quirks in Tauri.
  let dragId = $state<string | null>(null);
  let overId = $state<string | null>(null);
  let overPos = $state<"before" | "after">("before");
  let dragStartY = 0;
  let dragActive = $state(false);

  // Undo toast state
  type Undo = { items: TodoItem[]; labelKey: string };
  let undo = $state<Undo | null>(null);
  let undoTimer: ReturnType<typeof setTimeout> | null = null;

  async function refresh() {
    try {
      const c = await api.getCard(cardId);
      if (c) {
        card = c;
        if (rootEl) applyThemeVars(rootEl, c.theme);
      }
    } catch (e) {
      console.error("[card] refresh failed", e);
    }
  }

  async function loadSettings() {
    const s = await api.getSettings();
    setLanguage(s.language);
    applyAppTheme(s.appTheme);
  }

  async function handleAdd() {
    const raw = newTodo;
    const trimmed = raw.trim();
    if (!trimmed || !card) return;
    newTodo = "";
    try {
      // Paste-multi-line support: one line per task
      const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      for (const line of lines) {
        await api.addTodo(card.id, line);
      }
      await refresh();
    } catch (e) {
      console.error("[card] addTodo failed", e);
    }
  }

  async function handleToggle(id: string) {
    if (!card) return;
    await api.toggleTodo(card.id, id);
    await refresh();
  }

  async function handleDeleteTodo(id: string) {
    if (!card) return;
    const snapshot = card.todos.find((t) => t.id === id);
    await api.deleteTodo(card.id, id);
    await refresh();
    if (snapshot) queueUndo({ items: [snapshot], labelKey: "undo.deleted" });
  }

  async function handleClearDone() {
    if (!card) return;
    const snapshot = card.todos.filter((t) => t.done);
    await api.clearCompleted(card.id);
    await refresh();
    if (snapshot.length > 0)
      queueUndo({ items: snapshot, labelKey: "undo.cleared" });
  }

  async function handleTitleBlur() {
    if (!card || !titleEl) return;
    await api.setCardTitle(card.id, titleEl.value);
  }

  async function handleThemeChange(theme: CardTheme) {
    if (!card) return;
    await api.setCardTheme(card.id, theme);
    await refresh();
    menuOpen = false;
  }

  async function handleTogglePin() {
    if (!card) return;
    const next = card.mode === "pinned" ? "widget" : "pinned";
    await api.setCardMode(card.id, next);
    await refresh();
  }

  async function handleHide() {
    if (!card) return;
    await api.setCardVisible(card.id, false);
  }

  async function handleToggleMinimize() {
    if (!card) return;
    menuOpen = false;
    await api.setCardMinimized(card.id, !card.minimized);
    await refresh();
  }

  function handleDeleteCard() {
    if (!card) return;
    menuOpen = false;
    confirmDeleteOpen = true;
  }

  async function confirmDeleteCard() {
    if (!card) return;
    confirmDeleteOpen = false;
    await api.deleteCard(card.id);
  }

  // ---------- Inline edit ----------

  async function beginEdit(todo: TodoItem) {
    editingId = todo.id;
    editText = todo.text;
    await tick();
    editEl?.focus();
    editEl?.select();
  }

  async function commitEdit() {
    if (!card || !editingId) return;
    const id = editingId;
    const text = editText.trim();
    editingId = null;
    if (!text) return;
    await api.updateTodoText(card.id, id, text);
    await refresh();
  }

  function cancelEdit() {
    editingId = null;
  }

  function onEditKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  // ---------- Drag & drop (pointer-based) ----------

  function onHandlePointerDown(id: string, e: PointerEvent) {
    if (e.button !== 0) return;
    if (editingId) return;
    e.preventDefault();
    e.stopPropagation();
    dragId = id;
    dragStartY = e.clientY;
    dragActive = false;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    window.addEventListener("pointercancel", onPointerUp, { once: true });
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragId) return;
    if (!dragActive) {
      if (Math.abs(e.clientY - dragStartY) < 3) return;
      dragActive = true;
      document.body.classList.add("drag-active");
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el?.closest("li.todo") as HTMLElement | null;
    const id = li?.dataset?.id;
    if (!li || !id || id === dragId) {
      // Still allow overshoot past first/last item
      if (li && id === dragId) return;
      return;
    }
    const r = li.getBoundingClientRect();
    overId = id;
    overPos = e.clientY - r.top < r.height / 2 ? "before" : "after";
  }

  async function onPointerUp() {
    window.removeEventListener("pointermove", onPointerMove);
    document.body.classList.remove("drag-active");
    const dId = dragId;
    const oId = overId;
    const oPos = overPos;
    const wasActive = dragActive;
    dragId = null;
    overId = null;
    dragActive = false;
    if (!card || !dId || !wasActive) return;
    if (!oId || oId === dId) return;

    const activeIds = activeTodos.map((t) => t.id);
    const order = activeIds.filter((x) => x !== dId);
    const targetIdx = order.indexOf(oId);
    if (targetIdx < 0) return;
    const insertAt = oPos === "after" ? targetIdx + 1 : targetIdx;
    order.splice(insertAt, 0, dId);
    const doneIds = doneTodos.map((t) => t.id);
    await api.reorderTodos(card.id, [...order, ...doneIds]);
    await refresh();
  }

  // ---------- Undo ----------

  function queueUndo(u: Undo) {
    if (undoTimer) clearTimeout(undoTimer);
    undo = u;
    undoTimer = setTimeout(() => {
      undo = null;
      undoTimer = null;
    }, 5000);
  }

  async function performUndo() {
    if (!card || !undo) return;
    const toRestore = undo.items;
    undo = null;
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = null;
    }
    await api.restoreTodos(card.id, toRestore);
    await refresh();
  }

  function dismissUndo() {
    undo = null;
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = null;
    }
  }

  // Apply theme vars to document immediately so card isn't white while loading
  applyThemeVars(document.documentElement, initialTheme);

  function dismissSplash() {
    const el = document.getElementById("splash");
    if (el) {
      el.classList.add("fade-out");
      setTimeout(() => el.remove(), 350);
    }
  }

  onMount(async () => {
    await loadSettings();
    await refresh();
    await tick();
    dismissSplash();

    listeners.push(
      await listen<string>("card-changed", (e) => {
        if (e.payload === cardId) refresh();
      })
    );
    listeners.push(
      await listen("settings-changed", () => loadSettings())
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menuOpen = false;
    };
    window.addEventListener("keydown", onKey);
    listeners.push(() => window.removeEventListener("keydown", onKey));
  });

  onDestroy(() => {
    listeners.forEach((fn) => fn());
    if (undoTimer) clearTimeout(undoTimer);
  });

  const activeTodos = $derived(
    card ? card.todos.filter((t) => !t.done) : []
  );
  const doneTodos = $derived(
    card ? card.todos.filter((t) => t.done) : []
  );
  const remaining = $derived(activeTodos.length);
  const totalDone = $derived(doneTodos.length);
  const isMinimized = $derived(!!card?.minimized);
</script>

{#if card}
  <div
    class="card"
    class:minimized={isMinimized}
    bind:this={rootEl}
    data-tauri-drag-region
  >
    <div class="card-glow"></div>

    <header class="head">
      <div class="head-left">
        <input
          bind:this={titleEl}
          class="title-input"
          data-tauri-drag-region="false"
          value={card.title}
          placeholder={$t("card.untitled")}
          onblur={handleTitleBlur}
          onkeydown={(e) => {
            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          }}
        />
        {#if isMinimized}
          <span class="mini-count" data-tauri-drag-region="false">{remaining}</span>
        {/if}
      </div>
      <div class="head-right" data-tauri-drag-region="false">
        <button
          class="head-btn"
          onclick={handleTogglePin}
          title={card.mode === "pinned" ? $t("card.pin") : $t("card.widget")}
          aria-label={$t("card.pin")}
        >
          {#if card.mode === "pinned"}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 9V4l1 0a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1l1 0v5l-3 3v2h6v6l1 2 1-2v-6h6v-2l-3-3z"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            </svg>
          {/if}
        </button>
        <button
          class="head-btn"
          onclick={handleToggleMinimize}
          title={isMinimized ? $t("card.restore") : $t("card.minimize")}
          aria-label={isMinimized ? $t("card.restore") : $t("card.minimize")}
        >
          {#if isMinimized}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <line x1="6" y1="19" x2="18" y2="19"/>
            </svg>
          {/if}
        </button>
        <button
          class="head-btn"
          onclick={() => (menuOpen = !menuOpen)}
          title={$t("card.menu")}
          aria-label={$t("card.menu")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>
          </svg>
        </button>
        <button
          class="head-btn"
          onclick={handleHide}
          title={$t("card.close")}
          aria-label={$t("card.close")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
    </header>

    {#if menuOpen}
      <div class="menu" data-tauri-drag-region="false">
        <div class="menu-label">{$t("card.changeTheme")}</div>
        <div class="theme-row">
          {#each themeList as th}
            <button
              class="swatch"
              class:active={card.theme === th}
              style:background={`linear-gradient(135deg, ${themes[th].bgFrom}, ${themes[th].bgTo})`}
              onclick={() => handleThemeChange(th)}
              aria-label={$t(`theme.${th}`)}
            ></button>
          {/each}
        </div>
        <button class="menu-item danger" onclick={handleDeleteCard}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
          {$t("card.delete")}
        </button>
      </div>
    {/if}

    {#if !isMinimized}
      <section class="body" data-tauri-drag-region="false">
        {#if card.todos.length === 0}
          <div class="empty">{$t("card.empty")}</div>
        {:else}
          {#if activeTodos.length > 0}
            <ul class="todos">
              {#each activeTodos as todo (todo.id)}
                <li
                  class="todo"
                  class:dragging={dragId === todo.id && dragActive}
                  class:drop-before={overId === todo.id && overPos === "before" && dragActive}
                  class:drop-after={overId === todo.id && overPos === "after" && dragActive}
                  data-id={todo.id}
                >
                  <span
                    class="drag-handle"
                    aria-hidden="true"
                    onpointerdown={(e) => onHandlePointerDown(todo.id, e)}
                  >
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                      <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                  </span>
                  <button
                    class="check"
                    onclick={() => handleToggle(todo.id)}
                    aria-label="toggle"
                  ></button>
                  {#if editingId === todo.id}
                    <input
                      bind:this={editEl}
                      class="todo-edit"
                      bind:value={editText}
                      onkeydown={onEditKey}
                      onblur={commitEdit}
                    />
                  {:else}
                    <span
                      class="todo-text"
                      ondblclick={() => beginEdit(todo)}
                      role="button"
                      tabindex="0"
                    >{todo.text}</span>
                    <button
                      class="todo-edit-btn"
                      onclick={() => beginEdit(todo)}
                      title={$t("card.edit")}
                      aria-label={$t("card.edit")}
                    >
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                      </svg>
                    </button>
                  {/if}
                  <button
                    class="todo-del"
                    onclick={() => handleDeleteTodo(todo.id)}
                    aria-label="delete"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}

          {#if totalDone > 0}
            <div class="done-section" class:open={doneOpen}>
              <div class="done-header">
                <button
                  class="done-toggle"
                  onclick={() => (doneOpen = !doneOpen)}
                  aria-expanded={doneOpen}
                >
                  <svg class="chev" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 6 15 12 9 18"></polyline>
                  </svg>
                  <span>{$t("card.completed")} · {totalDone}</span>
                </button>
                <button
                  class="done-clear"
                  onclick={handleClearDone}
                  title={$t("card.clearCompleted")}
                  aria-label={$t("card.clearCompleted")}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
                </button>
              </div>
              {#if doneOpen}
                <ul class="todos done-list">
                  {#each doneTodos as todo (todo.id)}
                    <li class="todo done">
                      <button
                        class="check checked"
                        onclick={() => handleToggle(todo.id)}
                        aria-label="toggle"
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <span class="todo-text">{todo.text}</span>
                      <button
                        class="todo-del"
                        onclick={() => handleDeleteTodo(todo.id)}
                        aria-label="delete"
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}
        {/if}
      </section>

      <footer class="foot" data-tauri-drag-region="false">
        <input
          class="add-input"
          bind:value={newTodo}
          placeholder={$t("card.placeholder")}
          onkeydown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button class="add-btn" onclick={handleAdd} disabled={!newTodo.trim()} aria-label={$t("card.add")}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </footer>

      <div class="count">{remaining}</div>

      {#if undo}
        <div class="undo-bar" data-tauri-drag-region="false">
          <span class="undo-text">{$t(undo.labelKey)}</span>
          <button class="undo-btn" onclick={performUndo}>{$t("undo.action")}</button>
          <button class="undo-close" onclick={dismissUndo} aria-label="dismiss">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
          </button>
        </div>
      {/if}
    {/if}

    <ConfirmDialog
      open={confirmDeleteOpen}
      message={$t("card.confirmDelete")}
      confirmLabel={$t("common.delete")}
      cancelLabel={$t("common.cancel")}
      tone="danger"
      onConfirm={confirmDeleteCard}
      onCancel={() => (confirmDeleteOpen = false)}
    />
  </div>
{/if}
