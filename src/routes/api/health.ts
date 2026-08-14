import { createFileRoute } from "@tanstack/react-router";
import { storageHealth } from "@/lib/vault.server";
import { dbSource } from "@/lib/db";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const store = await storageHealth();
        return Response.json({
          ok: true,
          purpose: "literature witness — not a cure",
          lock: "95% stays shut until gates close",
          db: dbSource,
          storage: store,
        });
      },
    },
  },
});
