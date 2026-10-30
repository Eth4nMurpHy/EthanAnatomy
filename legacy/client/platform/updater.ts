import { Channel, invoke } from "@tauri-apps/api/core";
import { NATIVE_UPDATES_ENABLED } from "../release-channel";
import type { UpdateBridge, UpdateProgress } from "../updates/controller";

export const updatesSupported = async (): Promise<boolean> =>
  NATIVE_UPDATES_ENABLED && await invoke<boolean>("updates_supported");

export const nativeUpdateBridge: UpdateBridge = {
  check: () => invoke("check_update"),
  install: async onProgress => {
    const progress = new Channel<UpdateProgress>();
    progress.onmessage = onProgress;
    await invoke("install_update", { progress });
  },
  restart: () => invoke("restart_updated_app"),
};
