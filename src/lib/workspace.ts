export type WorkspaceStatus = {
  ready: boolean;
  lastAt: number | null;
  note: string;
};

export const WORKSPACE_OFF: WorkspaceStatus = { ready: false, lastAt: null, note: "off" };
