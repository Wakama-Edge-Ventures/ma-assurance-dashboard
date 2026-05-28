const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.wakama.farm";
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractArray(raw, preferredKeys = []) {
  if (Array.isArray(raw)) return raw;
  const root = asObject(raw);
  if (!root) return [];

  const keys = [...new Set([...preferredKeys, "data", "items", "results"])];
  for (const key of keys) {
    if (Array.isArray(root[key])) return root[key];
  }

  const data = asObject(root.data);
  if (!data) return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
}

function rootKeys(raw) {
  if (Array.isArray(raw)) return ["[array]"];
  const root = asObject(raw);
  return root ? Object.keys(root) : [];
}

function firstItemKeys(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const first = list[0];
  const item = asObject(first);
  return item ? Object.keys(item) : [];
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}`);
  }
  return response.json();
}

function getPaginationMeta(payload) {
  const root = asObject(payload);
  const data = asObject(root?.data);
  return {
    total: asNumber(root?.total) ?? asNumber(data?.total),
    page: asNumber(root?.page) ?? asNumber(data?.page),
    pageSize:
      asNumber(root?.pageSize) ??
      asNumber(root?.limit) ??
      asNumber(data?.pageSize) ??
      asNumber(data?.limit),
  };
}

async function fetchPaginated(path, preferredKeys = []) {
  const firstPath = `${path}?page=1&pageSize=${PAGE_SIZE}`;
  const firstPayload = await fetchJson(firstPath);
  const firstList = extractArray(firstPayload, preferredKeys);

  let items = [...firstList];
  const meta = getPaginationMeta(firstPayload);
  const total = meta.total;
  const effectivePageSize = meta.pageSize && meta.pageSize > 0 ? meta.pageSize : PAGE_SIZE;

  if (total && total > items.length) {
    const expectedPages = Math.ceil(total / effectivePageSize);
    const maxPages = Math.min(Math.max(expectedPages, 1), MAX_PAGES);

    for (let page = 2; page <= maxPages; page += 1) {
      const payload = await fetchJson(`${path}?page=${page}&pageSize=${PAGE_SIZE}`);
      const list = extractArray(payload, preferredKeys);
      if (list.length === 0) break;
      items = items.concat(list);
      if (items.length >= total) break;
    }
  }

  return { payload: firstPayload, items };
}

async function fetchSimple(path, preferredKeys = []) {
  const payload = await fetchJson(path);
  const items = extractArray(payload, preferredKeys);
  return { payload, items };
}

function printResult(label, payload, items) {
  console.log(`${label} root:`, JSON.stringify(rootKeys(payload)));
  console.log(`${label} count:`, items.length);
  console.log(`${label} first item keys:`, firstItemKeys(items).join(","));
}

async function run() {
  console.log("API base:", API_BASE_URL);

  const farmers = await fetchPaginated("/v1/farmers", ["farmers", "items", "results", "data"]);
  printResult("farmers", farmers.payload, farmers.items);

  const cooperatives = await fetchPaginated("/v1/cooperatives", [
    "cooperatives",
    "items",
    "results",
    "data",
  ]);
  printResult("cooperatives", cooperatives.payload, cooperatives.items);

  const parcelles = await fetchPaginated("/v1/parcelles", [
    "parcelles",
    "plots",
    "items",
    "results",
    "data",
  ]);
  printResult("parcelles", parcelles.payload, parcelles.items);

  const alerts = await fetchSimple("/v1/alerts", ["alerts", "items", "results", "data"]);
  printResult("alerts", alerts.payload, alerts.items);
}

run().catch((error) => {
  console.error("smoke-live-shared failed:", error.message);
  process.exit(1);
});
