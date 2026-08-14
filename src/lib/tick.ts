import { createServerFn } from "@tanstack/react-start";
import type { EngineSnapshot } from "./engine";

let live: EngineSnapshot | null = null;

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    work.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function runPulse(): Promise<EngineSnapshot> {
  const { readVault, writeVault, toPayload } = await import("./vault.server");
  const { runTrustedCycle, snapshotFromVault } = await import("./engine.server");
  const disk = await readVault();
  const fromLive = live && live.cycle >= (disk?.cycle ?? 0) ? live : snapshotFromVault(disk);
  const next = await withTimeout(runTrustedCycle(fromLive), 28_000);
  live = next;
  const { dbSource } = await import("./db");
  const shouldPersist =
    dbSource === "neon" ||
    (next.loop?.ingested ?? 0) > 0 ||
    next.cycle % 3 === 0;
  if (shouldPersist) {
    try {
      await writeVault(toPayload(next));
    } catch {
      /* campaign floor remains */
    }
  }
  return next;
}

export const tickEngine = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true; snapshot: EngineSnapshot } | { ok: false; error: string }> => {
    const { clientIp, rateLimit } = await import("./security.server");
    if (!rateLimit(`tick:${clientIp()}`, 40, 60_000)) {
      return { ok: false, error: "Rate limit." };
    }
    try {
      const next = await runPulse();
      return { ok: true, snapshot: next };
    } catch {
      return { ok: false, error: "timeout" };
    }
  },
);
