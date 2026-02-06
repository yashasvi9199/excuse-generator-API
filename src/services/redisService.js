const { Redis } = require('@upstash/redis');

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Test Redis connection
 */
async function testConnection() {
    try {
        await redis.ping();
        console.log('Redis connection successful');
        return true;
    } catch (error) {
        console.error('Redis connection failed:', error);
        return false;
    }
}

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

        console.log('Saving excuse to Redis:', { id: excuseId, category: record.category, mood: record.mood });

        // Save individual excuse
        await redis.set(excuseId, JSON.stringify(record));

        // Add to sorted set for time-based queries (score = timestamp)
        await redis.zadd('excuses:timeline', {
            score: timestamp,
            member: excuseId
        });

        // Add to category-specific sorted set
        await redis.zadd(`excuses:category:${record.category}`, {
            score: timestamp,
            member: excuseId
        });

        // Add to mood-specific sorted set
        await redis.zadd(`excuses:mood:${record.mood}`, {
            score: timestamp,
            member: excuseId
        });

        console.log('Successfully saved excuse to Redis');
        return record;
    } catch (error) {
        console.error('Error saving excuse to Redis:', error);
        // Don't throw - saving to history is non-critical
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

        // Calculate time range
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

        // Determine which sorted set to query
        let setKey = 'excuses:timeline';

        if (category && mood) {
            setKey = `excuses:category:${category}`;
        } else if (category) {
            setKey = `excuses:category:${category}`;
        } else if (mood) {
            setKey = `excuses:mood:${mood}`;
        }

        console.log('Querying Redis set:', setKey, 'Time range:', minTimestamp, 'to', now);

        // Get excuse IDs from sorted set (newest first)
        const excuseIds = await redis.zrange(setKey, minTimestamp, now, {
            byScore: true,
            rev: true,
            count: limit * 2
        });

        console.log('Found excuse IDs:', excuseIds?.length || 0);

        if (!excuseIds || excuseIds.length === 0) {
            return [];
        }

        // Fetch full excuse data
        const excuses = await Promise.all(
            excuseIds.map(id => redis.get(id))
        );

        console.log('Fetched excuse data:', excuses?.length || 0);

        // Parse and filter
        let results = excuses
            .filter(item => item !== null)
            .map(item => {
                if (typeof item === 'string') {
                    try {
                        return JSON.parse(item);
                    } catch (e) {
                        console.error('Failed to parse excuse:', e);
                        return null;
                    }
                }
                return item;
            })
            .filter(item => item !== null);

        // Additional filtering if both category and mood specified
        if (category && mood) {
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
        const total = await redis.zcard('excuses:timeline');

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

module.exports = {
    saveExcuse,
    queryExcuses,
    getExcuseStats,
    testConnection
};