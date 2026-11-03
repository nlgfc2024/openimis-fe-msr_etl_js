// Tracks the latest upload, so a response that comes back after a newer upload or a cancel is ignored
export function createUploadTracker() {
  let current = 0;
  let controller = null;

  const cancel = () => {
    current += 1;
    if (controller) controller.abort();
    controller = null;
  };

  const start = () => {
    cancel();
    controller = new AbortController();
    const id = current;
    return { signal: controller.signal, isCurrent: () => id === current };
  };

  return { start, cancel };
}
