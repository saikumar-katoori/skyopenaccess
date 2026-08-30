import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 120, checkperiod: 150 });

export const cacheGet = (keyFn) => (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  if (req.method !== "GET") return next();
  const cacheHeader = String(req.headers["cache-control"] || "").toLowerCase();
  if (cacheHeader.includes("no-cache") || cacheHeader.includes("no-store")) return next();
  const key = keyFn(req);
  const cached = cache.get(key);
  if (cached) {
    return res.status(200).json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cache.set(key, body);
    return originalJson(body);
  };

  next();
};

export const cacheInvalidateByPrefix = (prefix) => {
  cache.keys().forEach((key) => {
    if (key.startsWith(prefix)) {
      cache.del(key);
    }
  });
};
