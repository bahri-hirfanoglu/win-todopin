import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "upToDate" }
  | { kind: "available"; version: string; notes: string | null }
  | { kind: "downloading"; version: string; downloaded: number; total: number | null }
  | { kind: "ready"; version: string }
  | { kind: "error"; message: string };

type Listener = (status: UpdateStatus) => void;

class UpdaterStore {
  private status: UpdateStatus = { kind: "idle" };
  private listeners = new Set<Listener>();
  private pending: Update | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.status);
    return () => this.listeners.delete(fn);
  }

  private set(next: UpdateStatus) {
    this.status = next;
    this.listeners.forEach((fn) => fn(next));
  }

  async check(): Promise<void> {
    if (this.status.kind === "checking" || this.status.kind === "downloading") {
      return;
    }
    this.set({ kind: "checking" });
    try {
      const update = await check();
      if (!update) {
        this.pending = null;
        this.set({ kind: "upToDate" });
        return;
      }
      this.pending = update;
      this.set({
        kind: "available",
        version: update.version,
        notes: update.body ?? null,
      });
    } catch (e) {
      console.error("[updater] check failed", e);
      this.set({ kind: "error", message: String(e) });
    }
  }

  async installAndRestart(): Promise<void> {
    const update = this.pending;
    if (!update) return;

    let total: number | null = null;
    let downloaded = 0;
    this.set({
      kind: "downloading",
      version: update.version,
      downloaded: 0,
      total: null,
    });

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            total = event.data.contentLength ?? null;
            this.set({
              kind: "downloading",
              version: update.version,
              downloaded: 0,
              total,
            });
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            this.set({
              kind: "downloading",
              version: update.version,
              downloaded,
              total,
            });
            break;
          case "Finished":
            this.set({ kind: "ready", version: update.version });
            break;
        }
      });

      // Windows installer in passive mode will relaunch itself after
      // install completes, but call relaunch() as a safety net so other
      // targets restart too.
      await relaunch();
    } catch (e) {
      console.error("[updater] install failed", e);
      this.set({ kind: "error", message: String(e) });
    }
  }

  dismiss(): void {
    if (
      this.status.kind === "upToDate" ||
      this.status.kind === "error" ||
      this.status.kind === "available"
    ) {
      this.set({ kind: "idle" });
    }
  }
}

export const updater = new UpdaterStore();
