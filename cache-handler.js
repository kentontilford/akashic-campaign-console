// Simple cache handler for Next.js incremental static regeneration
const cache = new Map();

module.exports = {
  async get(key) {
    return cache.get(key);
  },
  
  async set(key, data, ctx) {
    cache.set(key, {
      value: data,
      lastModified: Date.now(),
    });
  },
  
  async revalidateTag(tag) {
    // Implement tag-based revalidation if needed
    for (const [key, value] of cache.entries()) {
      if (value.tags && value.tags.includes(tag)) {
        cache.delete(key);
      }
    }
  },
};