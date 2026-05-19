const compareStorageKey = "techmarket.compare.productIds";
const compareChangedEvent = "techmarket:compare-changed";
const maxCompareProducts = 3;

function readStoredIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(compareStorageKey) ?? "[]");

    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredIds(productIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const uniqueIds = Array.from(new Set(productIds)).slice(0, maxCompareProducts);
  window.localStorage.setItem(compareStorageKey, JSON.stringify(uniqueIds));
  window.dispatchEvent(new CustomEvent(compareChangedEvent, { detail: uniqueIds }));
}

export function getCompareProductIds() {
  return readStoredIds();
}

export function setCompareProductIds(productIds: string[]) {
  writeStoredIds(productIds);
}

export function addCompareProductId(productId: string) {
  const currentIds = readStoredIds();

  if (currentIds.includes(productId)) {
    return currentIds;
  }

  const nextIds = [...currentIds, productId].slice(-maxCompareProducts);
  writeStoredIds(nextIds);

  return nextIds;
}

export function removeCompareProductId(productId: string) {
  const nextIds = readStoredIds().filter((id) => id !== productId);
  writeStoredIds(nextIds);

  return nextIds;
}

export function subscribeCompareProducts(listener: (productIds: string[]) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === compareStorageKey) {
      listener(readStoredIds());
    }
  };
  const handleCustomEvent = (event: Event) => {
    listener((event as CustomEvent<string[]>).detail ?? readStoredIds());
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(compareChangedEvent, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(compareChangedEvent, handleCustomEvent);
  };
}
