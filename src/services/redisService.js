const { Redis } = require('@upstash/redis');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Save excuse to Redis
 */
async function saveExcuse(excuseData) {
  try {
    const timestamp = Date.now();
    const excuseId = `excuse:${timestamp}:${Math.random().toString(36).substr(2, 9)}`;
    
    const record = {
      id: excuseId,
      excuses: excuseData.excuses,
      category: excuseData.category || 'general',
      mood: excuseData.mood || 'casual',
      type: excuseData.type || 'text',
      timestamp: timestamp,
      createdAt: new Date(timestamp).toISOString()
    };
    
    console.log('Saving excuse to Redis:', excuseId);
    
    // Save individual excuse
    await redis.set(excuseId, JSON.stringify(record));
    
    // Add to list for simple retrieval (newest first)
    await redis.lpush('excuses:list', excuseId);
    
    // Keep only last 500 excuses in list
    await redis.ltrim('excuses:list', 0, 499);
    
    // Add to category list
    await redis.lpush(`excuses:category:${record.category}`, excuseId);
    await redis.ltrim(`excuses:category:${record.category}`, 0, 199);
    
    // Add to mood list
    await redis.lpush(`excuses:mood:${record.mood}`, excuseId);
    await redis.ltrim(`excuses:mood:${record.mood}`, 0, 199);
    
    console.log('Successfully saved excuse to Redis');
    return record;
  } catch (error) {
    console.error('Error saving excuse to Redis:', error);
    return null;
  }
}

/**
 * Query excuses with filters
 */
async function queryExcuses(filters = {}) {
  try {
    const {
      category,
      mood,
      timeRange = 'all',
      limit = 50
    } = filters;
    
    console.log('Querying excuses with filters:', filters);
    
    // Determine which list to query
    let listKey = 'excuses:list';
    
    if (category) {
      listKey = `excuses:category:${category}`;
    } else if (mood) {
      listKey = `excuses:mood:${mood}`;
    }
    
    console.log('Querying Redis list:', listKey);
    
    // Get excuse IDs from list
    const excuseIds = await redis.lrange(listKey, 0, limit * 2 - 1);
    
    console.log('Found excuse IDs:', excuseIds?.length || 0);
    
    if (!excuseIds || excuseIds.length === 0) {
      return [];
    }
    
    // Fetch full excuse data
    const excuses = [];
    for (const id of excuseIds) {
      const data = await redis.get(id);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        excuses.push(parsed);
      }
    }
    
    console.log('Fetched excuse data:', excuses.length);
    
    // Calculate time range filter
    const now = Date.now();
    let minTimestamp = 0;
    
    switch (timeRange) {
      case 'hour':
        minTimestamp = now - (60 * 60 * 1000);
        break;
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        minTimestamp = todayStart.getTime();
        break;
      case 'week':
        minTimestamp = now - (7 * 24 * 60 * 60 * 1000);
        break;
      default:
        minTimestamp = 0;
    }
    
    // Filter results
    let results = excuses.filter(e => e.timestamp >= minTimestamp);
    
    // Additional filtering if both category and mood specified
    if (category && mood) {
      results = results.filter(e => e.mood === mood);
    }
    
    // If only mood filter and we used main list
    if (mood && !category) {
      results = results.filter(e => e.mood === mood);
    }
    
    // Limit results
    results = results.slice(0, limit);
    
    console.log('Returning results:', results.length);
    return results;
  } catch (error) {
    console.error('Error querying excuses from Redis:', error);
    return [];
  }
}

/**
 * Get excuse statistics
 */
async function getExcuseStats() {
  try {
    const total = await redis.llen('excuses:list');
    
    console.log('Total excuses in Redis:', total);
    
    return {
      total: total || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting stats from Redis:', error);
    return { total: 0, timestamp: new Date().toISOString() };
  }
}

/**
 * Migrate existing data to new list format
 */
async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Scan for all excuse keys
    const keys = [];
    let cursor = 0;
    
    do {
      const result = await redis.scan(cursor, { match: 'excuse:*', count: 100 });
      cursor = result[0];
      if (result[1]) {
        keys.push(...result[1]);
      }
    } while (cursor !== 0);
    
    console.log('Found keys to migrate:', keys.length);
    
    if (keys.length === 0) {
      return { migrated: 0 };
    }
    
    // Get all excuse data with timestamps
    const excuses = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        excuses.push({ key, data: parsed });
      }
    }
    
    // Sort by timestamp (newest first)
    excuses.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
    
    // Clear existing lists
    await redis.del('excuses:list');
    
    // Add to main list
    for (const excuse of excuses) {
      await redis.rpush('excuses:list', excuse.key);
      
      // Add to category list
      if (excuse.data.category) {
        await redis.rpush(`excuses:category:${excuse.data.category}`, excuse.key);
      }
      
      // Add to mood list
      if (excuse.data.mood) {
        await redis.rpush(`excuses:mood:${excuse.data.mood}`, excuse.key);
      }
    }
    
    console.log('Migration complete:', excuses.length);
    return { migrated: excuses.length };
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated: 0, error: error.message };
  }
}

module.exports = {
  saveExcuse,
  queryExcuses,
  getExcuseStats,
  migrateData
};