<svelte:options runes={true} />

<script lang="ts">
  interface Props {
    open: boolean;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "primary";
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open,
    message,
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    tone = "primary",
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onConfirm();
    }
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if open}
  <div
    class="confirm-backdrop"
    role="button"
    tabindex="-1"
    onclick={onCancel}
    onkeydown={handleKey}
    data-tauri-drag-region="false"
  >
    <div
      class="confirm-dialog"
      role="dialog"
      aria-modal="true"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      tabindex="-1"
      data-tauri-drag-region="false"
    >
      <p class="confirm-message">{message}</p>
      <div class="confirm-actions">
        <button class="confirm-btn ghost" onclick={onCancel}>
          {cancelLabel}
        </button>
        <button
          class="confirm-btn {tone === 'danger' ? 'danger' : 'primary'}"
          onclick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .confirm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 12, 40, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    z-index: 100;
    animation: fade-in 140ms ease;
    cursor: default;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .confirm-dialog {
    background: var(--app-surface-hover, rgba(255, 255, 255, 0.96));
    backdrop-filter: blur(18px);
    color: var(--app-text, #2a2140);
    border-radius: 14px;
    padding: 16px 16px 12px;
    width: 100%;
    max-width: 280px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    animation: scale-in 180ms cubic-bezier(0.2, 0.9, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .confirm-message {
    font-size: 13px;
    line-height: 1.45;
    color: var(--app-text, #2a2140);
    word-wrap: break-word;
    text-align: center;
  }

  .confirm-actions {
    display: flex;
    gap: 8px;
    justify-content: stretch;
  }

  .confirm-btn {
    flex: 1;
    padding: 9px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 100ms ease, box-shadow 140ms ease,
      background 140ms ease;
  }

  .confirm-btn:hover {
    transform: translateY(-1px);
  }

  .confirm-btn.ghost {
    background: var(--app-btn-bg, rgba(43, 32, 64, 0.08));
    color: var(--app-text-secondary, #5c4a7a);
  }

  .confirm-btn.ghost:hover {
    background: var(--app-btn-hover, rgba(43, 32, 64, 0.14));
  }

  .confirm-btn.primary {
    background: var(--app-accent-gradient, linear-gradient(135deg, #ff8a5b, #f06192));
    color: var(--app-accent-text, white);
    box-shadow: 0 4px 12px var(--app-accent-shadow, rgba(240, 97, 146, 0.35));
  }

  .confirm-btn.primary:hover {
    box-shadow: 0 8px 18px var(--app-accent-shadow, rgba(240, 97, 146, 0.45));
  }

  .confirm-btn.danger {
    background: linear-gradient(135deg, #ff6b6b, #d23353);
    color: white;
    box-shadow: 0 4px 12px rgba(210, 51, 83, 0.35);
  }

  .confirm-btn.danger:hover {
    box-shadow: 0 8px 18px rgba(210, 51, 83, 0.45);
  }
</style>
