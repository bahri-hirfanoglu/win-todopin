<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { api } from "$lib/api";
  import { setLanguage, t } from "$lib/i18n";
  import { applyThemeVars, themes, themeList } from "$lib/themes";
  import { applyAppTheme } from "$lib/appThemes";
  import ConfirmDialog from "$lib/ConfirmDialog.svelte";
  import type { Card, CardTheme } from "$lib/types";

  // Parse ?cid=<id>&theme=<theme>
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("cid") ?? "";
  const initialTheme = (params.get("theme") as CardTheme) || "peach";

  let card = $state<Card | null>(null);
  let newTodo = $state("");
  let menuOpen = $state(false);
  let confirmDeleteOpen = $state(false);
  let titleEl = $state<HTMLInputElement | undefined>();
  let rootEl = $state<HTMLElement | undefined>();
  let listeners: UnlistenFn[] = [];

  async function refresh() {
    console.log("[card] refresh", cardId);
    try {
      const c = await api.getCard(cardId);
      if (c) {
        card = c;
        if (rootEl) applyThemeVars(rootEl, c.theme);
        console.log("[card] refresh ok", { todos: c.todos.length });
      } else {
        console.warn("[card] getCard returned null");
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
    console.log("[card] handleAdd clicked, text:", newTodo);
    const text = newTodo.trim();
    if (!text || !card) {
      console.log("[card] empty or no card, aborting");
      return;
    }
    newTodo = "";
    try {
      const item = await api.addTodo(card.id, text);
      console.log("[card] addTodo ok", item);
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
    await api.deleteTodo(card.id, id);
    await refresh();
  }

  async function handleClearDone() {
    if (!card) return;
    await api.clearCompleted(card.id);
    await refresh();
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

  function handleDeleteCard() {
    if (!card) return;
    menuOpen = false;
    confirmDeleteOpen = true;
  }

  async function confirmDeleteCard() {
    if (!card) return;
    confirmDeleteOpen = false;
    await api.deleteCard(card.id);
    // The window will be closed by the backend.
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

    // Close menu on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menuOpen = false;
    };
    window.addEventListener("keydown", onKey);
    listeners.push(() => window.removeEventListener("keydown", onKey));
  });

  onDestroy(() => {
    listeners.forEach((fn) => fn());
  });

  const remaining = $derived(
    card ? card.todos.filter((t) => !t.done).length : 0
  );
  const totalDone = $derived(
    card ? card.todos.filter((t) => t.done).length : 0
  );
</script>

{#if card}
  <div class="card" bind:this={rootEl} data-tauri-drag-region>
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M5 12h14"/>
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

    <section class="body" data-tauri-drag-region="false">
      {#if card.todos.length === 0}
        <div class="empty">{$t("card.empty")}</div>
      {:else}
        <ul class="todos">
          {#each card.todos as todo (todo.id)}
            <li class="todo" class:done={todo.done}>
              <button
                class="check"
                class:checked={todo.done}
                onclick={() => handleToggle(todo.id)}
                aria-label="toggle"
              >
                {#if todo.done}
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {/if}
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
        {#if totalDone > 0}
          <button class="clear-done" onclick={handleClearDone}>
            {totalDone} ✓
          </button>
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
