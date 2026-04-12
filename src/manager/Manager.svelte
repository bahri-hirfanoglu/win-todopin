<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { api } from "$lib/api";
  import { language, t, setLanguage } from "$lib/i18n";
  import { themes, themeList } from "$lib/themes";
  import { appThemes, appThemeList, applyAppTheme } from "$lib/appThemes";
  import ConfirmDialog from "$lib/ConfirmDialog.svelte";
  import type { AppSettings, AppTheme, Card, CardTheme, Language, ShortcutAction } from "$lib/types";

  let cards = $state<Card[]>([]);
  let settings = $state<AppSettings | null>(null);
  let showSettings = $state(false);
  let pendingDeleteId = $state<string | null>(null);
  let recordingShortcut = $state<ShortcutAction | null>(null);

  const shortcutActions: { key: ShortcutAction; label: string }[] = [
    { key: "showAll", label: "shortcut.showAll" },
    { key: "hideAll", label: "shortcut.hideAll" },
    { key: "newCard", label: "shortcut.newCard" },
    { key: "openManager", label: "shortcut.openManager" },
  ];

  const actionToBackend: Record<ShortcutAction, string> = {
    showAll: "show_all",
    hideAll: "hide_all",
    newCard: "new_card",
    openManager: "open_manager",
  };

  function handleShortcutKeydown(e: KeyboardEvent) {
    if (!recordingShortcut) return;
    e.preventDefault();
    e.stopPropagation();

    // Ignore lone modifier presses
    if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey) parts.push("Super");

    // Normalize key name
    let key = e.key;
    if (key === " ") key = "Space";
    else if (key.length === 1) key = key.toUpperCase();
    else {
      // Map common keys to Tauri accelerator format
      const keyMap: Record<string, string> = {
        ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
        Escape: "Escape", Enter: "Enter", Backspace: "Backspace", Delete: "Delete",
        Tab: "Tab", Home: "Home", End: "End", PageUp: "PageUp", PageDown: "PageDown",
        Insert: "Insert",
      };
      key = keyMap[key] || key;
    }
    parts.push(key);

    const accel = parts.join("+");
    const action = recordingShortcut;
    recordingShortcut = null;
    saveShortcut(action, accel);
  }

  async function saveShortcut(action: ShortcutAction, accel: string) {
    await api.setShortcut(actionToBackend[action], accel);
    await refresh();
  }

  async function clearShortcut(action: ShortcutAction) {
    recordingShortcut = null;
    await api.setShortcut(actionToBackend[action], "");
    await refresh();
  }

  async function refresh() {
    console.log("[manager] refresh()");
    try {
      cards = await api.listCards();
      settings = await api.getSettings();
      setLanguage(settings.language);
      applyAppTheme(settings.appTheme);
      console.log("[manager] refresh ok", { cards: cards.length, settings });
    } catch (e) {
      console.error("[manager] refresh failed", e);
    }
  }

  async function changeAppTheme(theme: AppTheme) {
    applyAppTheme(theme);
    await api.setAppTheme(theme);
    await refresh();
  }

  async function handleNew() {
    console.log("[manager] handleNew clicked");
    try {
      const c = await api.createCard();
      console.log("[manager] createCard ok", c);
      await refresh();
    } catch (e) {
      console.error("[manager] createCard failed", e);
    }
  }

  function requestDelete(id: string) {
    pendingDeleteId = id;
  }

  async function confirmDelete() {
    const id = pendingDeleteId;
    pendingDeleteId = null;
    if (!id) return;
    await api.deleteCard(id);
    await refresh();
  }

  async function toggleVisible(card: Card) {
    await api.setCardVisible(card.id, !card.visible);
    await refresh();
  }

  async function changeLanguage(lang: Language) {
    await api.setLanguage(lang);
    setLanguage(lang);
    await refresh();
  }

  async function toggleAutostart(next: boolean) {
    try {
      await api.setAutostart(next);
    } catch (e) {
      console.error(e);
    }
    await refresh();
  }

  async function setDefaultTheme(theme: CardTheme) {
    await api.setDefaultTheme(theme);
    await refresh();
  }

  $effect(() => {
    if (recordingShortcut) {
      const handler = (e: KeyboardEvent) => handleShortcutKeydown(e);
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  });

  function dismissSplash() {
    const el = document.getElementById("splash");
    if (el) {
      el.classList.add("fade-out");
      setTimeout(() => el.remove(), 350);
    }
  }

  onMount(() => {
    refresh().then(dismissSplash);
    const unlistens: Promise<UnlistenFn>[] = [
      listen("cards-changed", () => refresh()),
      listen("card-changed", () => refresh()),
      listen("settings-changed", () => refresh()),
    ];
    return () => {
      unlistens.forEach((p) => p.then((fn) => fn()));
    };
  });
</script>

<main class="manager">
  <header class="header">
    <div class="title-block">
      <div class="logo-dot">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white" opacity="0.9">
          <path d="M16 9V4l1 0a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1l1 0v5l-3 3v2h6v6l1 2 1-2v-6h6v-2l-3-3z"/>
        </svg>
      </div>
      <div>
        <h1>{$t("manager.title")}</h1>
        <p class="subtitle">{$t("manager.subtitle")}</p>
      </div>
    </div>
    <button
      class="icon-btn"
      onclick={() => (showSettings = !showSettings)}
      title={$t("manager.settings")}
      aria-label={$t("manager.settings")}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </header>

  <div class="actions">
    <button class="primary" onclick={handleNew}>
      <span class="plus">+</span>
      {$t("manager.newCard")}
    </button>
    <div class="row-actions">
      <button class="ghost small" onclick={() => api.showAllCards()}>
        {$t("manager.showAll")}
      </button>
      <button class="ghost small" onclick={() => api.hideAllCards()}>
        {$t("manager.hideAll")}
      </button>
    </div>
  </div>

  {#if showSettings && settings}
    <section class="settings card-frame">
      <div class="setting">
        <span class="setting-label">{$t("manager.language")}</span>
        <div class="lang-switch">
          <button
            class:active={$language === "tr"}
            onclick={() => changeLanguage("tr")}
          >TR</button>
          <button
            class:active={$language === "en"}
            onclick={() => changeLanguage("en")}
          >EN</button>
        </div>
      </div>
      <div class="setting">
        <label for="auto">{$t("manager.autostart")}</label>
        <input
          id="auto"
          type="checkbox"
          checked={settings.autostart}
          onchange={(e) => toggleAutostart((e.currentTarget as HTMLInputElement).checked)}
        />
      </div>
      <div class="setting">
        <span class="setting-label">{$t("manager.defaultTheme")}</span>
        <div class="theme-picker">
          {#each themeList as theme}
            <button
              class="swatch"
              class:active={settings.defaultTheme === theme}
              style:background={`linear-gradient(135deg, ${themes[theme].bgFrom}, ${themes[theme].bgTo})`}
              onclick={() => setDefaultTheme(theme)}
              title={$t(`theme.${theme}`)}
              aria-label={$t(`theme.${theme}`)}
            ></button>
          {/each}
        </div>
      </div>
      <div class="app-theme-section">
        <span class="setting-label">{$t("manager.appTheme")}</span>
        <div class="app-theme-grid">
          {#each appThemeList as at}
            <button
              class="app-theme-btn"
              class:active={settings.appTheme === at}
              onclick={() => changeAppTheme(at)}
            >
              <span
                class="app-theme-dot"
                style:background={appThemes[at].accentGradient}
              ></span>
              {$t(`appTheme.${at}`)}
            </button>
          {/each}
        </div>
      </div>
      <div class="shortcuts-section">
        <span class="setting-label">{$t("manager.shortcuts")}</span>
        <div class="shortcuts-list">
          {#each shortcutActions as { key, label }}
            <div class="shortcut-row">
              <span class="shortcut-label">{$t(label)}</span>
              <div class="shortcut-input-group">
                <button
                  class="shortcut-btn"
                  class:recording={recordingShortcut === key}
                  onclick={() => (recordingShortcut = recordingShortcut === key ? null : key)}
                >
                  {#if recordingShortcut === key}
                    {$t("shortcut.recording")}
                  {:else}
                    {settings.shortcuts[key] || "—"}
                  {/if}
                </button>
                {#if settings.shortcuts[key]}
                  <button
                    class="shortcut-clear"
                    onclick={() => clearShortcut(key)}
                    title={$t("shortcut.clear")}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <section class="cards">
    {#if cards.length === 0}
      <div class="empty">
        <div class="empty-emoji">✨</div>
        <p>{$t("manager.empty")}</p>
      </div>
    {:else}
      {#each cards as card (card.id)}
        <div
          class="card-row"
          style:--swatch-from={themes[card.theme].bgFrom}
          style:--swatch-to={themes[card.theme].bgTo}
          style:--swatch-accent={themes[card.theme].accent}
        >
          <div class="swatch-dot"></div>
          <div class="card-info">
            <div class="card-title">
              {card.title || $t("card.untitled")}
            </div>
            <div class="card-meta">
              {card.todos.filter((t) => !t.done).length}
              &middot;
              {card.mode === "pinned" ? "📌" : "🪟"}
            </div>
          </div>
          <button
            class="icon-btn small"
            onclick={() => toggleVisible(card)}
            title={card.visible ? $t("card.close") : $t("manager.showAll")}
          >
            {#if card.visible}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            {:else}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            {/if}
          </button>
          <button
            class="icon-btn small danger"
            onclick={() => requestDelete(card.id)}
            title={$t("common.delete")}
            aria-label={$t("common.delete")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
          </button>
        </div>
      {/each}
    {/if}
  </section>

  <ConfirmDialog
    open={pendingDeleteId !== null}
    message={$t("card.confirmDelete")}
    confirmLabel={$t("common.delete")}
    cancelLabel={$t("common.cancel")}
    tone="danger"
    onConfirm={confirmDelete}
    onCancel={() => (pendingDeleteId = null)}
  />
</main>
