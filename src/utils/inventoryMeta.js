const INVENTORY_META_KEY = 'INVENTORY_META_MAP_WEB_V1';

const safeParse = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getInventoryMetaMap = () => {
  if (typeof window === 'undefined') return {};
  const stored = window.localStorage.getItem(INVENTORY_META_KEY);
  return safeParse(stored);
};

export const saveInventoryMetaMap = (map) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVENTORY_META_KEY, JSON.stringify(map));
};

export const updateInventoryMetaMap = (productId, updater) => {
  const currentMap = getInventoryMetaMap();
  const currentMeta = currentMap[productId] || {};
  const nextMeta = updater(currentMeta);
  const updatedMap = { ...currentMap, [productId]: nextMeta };
  saveInventoryMetaMap(updatedMap);
  return updatedMap;
};

export const normalizeLocations = (locations) => {
  const list = Array.isArray(locations) ? locations : [];
  return list.map((location) => ({
    id: location.id || location.name,
    name: location.name,
    quantity: Number(location.quantity || 0),
  }));
};

export const mergeLocations = (locations, locationName, delta) => {
  const normalized = normalizeLocations(locations);
  const existing = normalized.find((location) => location.name === locationName);
  if (existing) {
    existing.quantity = Math.max(0, existing.quantity + delta);
    return [...normalized];
  }
  return [
    ...normalized,
    {
      id: locationName,
      name: locationName,
      quantity: Math.max(0, delta),
    },
  ];
};

export const getLocationQuantity = (locations, locationName) => {
  const match = locations.find((location) => location.name === locationName);
  return match ? Number(match.quantity || 0) : 0;
};
