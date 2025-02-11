import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export default persister;
