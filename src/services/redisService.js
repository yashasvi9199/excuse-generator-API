const {Redis} = require('@upstash/redis');

// Initiate Redis Client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Save excuses to Redis
 */
async function saveExcuse(excuseData) {
    try{

        const timestamp = Date.now();
        const excuseId = `excuse:${timestamp}:${Math.random().toString(36).substring(2, 9)}`;

        const record = {
            id: excuseId,
            excuses: excuseData.excuses,
            category: excuseData.category || 'general',
            mood: excuseData.mood || 'casual',
            type: excuseData.type || 'text',
            timestamp: timestamp,
            createdAt: new Date(timestamp).toISOString()
        };

        // Save indivisual excuse
        await redis.set(excuseId, JSON.stringify(record));

        // Add to sorted set for time based queries (score = timestamp)
        await redis.zadd('excuses:timeline', {
            score: timestamp,
            memberL: excuseId
        });

        // Add to category-specific sorted set
        await redis.zadd(`excuses:category:${record.category}`, {
            score: timestamp,
            member: excuseId
        });

        // Add to mood-specific sorter set
        await redis.zadd(`excuses:mood:${record.mood}`, {
            score: timestamp,
            member: excuseId
        });

        return record;

    }catch(err){
        console.error('Error saving excuses to Redis:', err);
        return null;
    }
}

/**
 * Query excuses with filters
 */
async function queryExcuses(filters = {}) {
    try{

        const {
            category,
            mood,
            timeRange = 'all',  // 'hour', 'today', 'week', 'all'
            limit = 30
        } = filters;

        // Calculate time range
        const now = Date.now();
        let minTimestamp = 0;

        switch (timeRange) {
            case 'hour' :
                minTimestamp = now - (60 * 60 *1000);   // 1 hour ago
                break;
            
            case 'today':
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);    // Since 12 am today
                minTimestamp = todayStart.getTime();
                break;

            case 'week':
                minTimestamp = now - (7 * 24 * 60 * 60 * 1000)  // 7 days
                break;

            default:
                minTimestamp = 0    // all
        }

        // Determine which sorted set to query
        let setKey = 'excuse:timeline'

        if (category && mood) {
            setKey = `excuse:category:${category}`;
        }else if (category) {
            setKey = `excuse:category:${category}`;
        }else if (mood) {
            setKey = `excuse:mood:${mood}`;
        }

        // Get excuse IDs from sorted set (newest first)
        const excuseIds = await redis.zrange(setKey, minTimestamp, now, {
            byScore: true,
            rev: true,  // reverese order (newest first)
            count: limit * 2    // Get more count for failsafe
        });

        if (!excuseIds || excuseIds.length === 0) {
            return [];
        }

        // Fetch full excuse data
        const excuses = await Promise.all(
            excuseIds.map( id => redis.get(id))
        );

        // Parse and filter
        let results = excuses
            .filter( excuse => excuse !== null)
            .map( excuse => typeof excuse === 'string' ? JSON.parse(excuse) : excuse);

        // Additional filtering if both category and mood is specified
        if (category && mood) {
            results.filter( e => e.mood === mood)
        }

        //  Limit results
        results = results.slice(0, limit);

        return results;

    }
    catch(err){
        console.error(' Error querying excuses from Redis: ', err);
        return [];
    }
}

/**
 * Get excuses statistics
 */
async function getExcuseStats() {
    try{

        const total = await redis.zcard('excuse:timeline');

        return {
            total: total || 0,
            timestamp: new Date().toISOString()
        };

    }
    catch(err){
        console.error('Error getting stats from Redis: ', err);
        return {
            total: 0,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    saveExcuse,
    queryExcuses,
    getExcuseStats
}