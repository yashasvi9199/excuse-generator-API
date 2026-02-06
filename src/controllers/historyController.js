const { queryExcuses, getExcuseStats } = require('../services/redisService');
const { Redis } = require('@upstash/redis');

// Initialize Redis client for debugging
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Debug endpoint to check Redis data
 */
async function debugRedis(req, res, next) {
  try {
    // Get all keys from timeline
    const timelineMembers = await redis.zrange('excuses:timeline', 0, -1);
    
    // Get one excuse directly by key (if exists)
    let sampleExcuse = null;
    if (timelineMembers && timelineMembers.length > 0) {
      sampleExcuse = await redis.get(timelineMembers[0]);
    }
    
    // Get counts
    const timelineCount = await redis.zcard('excuses:timeline');
    
    // Get keys pattern (scan for excuse:* keys)
    const keys = [];
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: 'excuse:*', count: 100 });
      cursor = result[0];
      if (result[1]) {
        keys.push(...result[1]);
      }
    } while (cursor !== 0);
    
    res.status(200).json({
      success: true,
      debug: {
        timelineCount,
        timelineMembers: timelineMembers || [],
        totalKeys: keys.length,
        sampleKeys: keys.slice(0, 5),
        sampleExcuse: sampleExcuse ? JSON.parse(sampleExcuse) : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get excuse history with filters
 */
async function getHistory(req, res, next) {
  try {
    const { category, mood, timeRange, limit } = req.query;

    // Validate timeRange
    const validTimeRanges = ['hour', 'today', 'week', 'all'];
    if (timeRange && !validTimeRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          title: 'INVALID_ARGUMENT',
          message: `Invalid timeRange. Must be one of: ${validTimeRanges.join(', ')}`
        }
      });
    }

    // Validate limit
    const parsedLimit = limit ? parseInt(limit) : 50;
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 200) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          title: 'INVALID_ARGUMENT',
          message: 'Limit must be a number between 1 and 200'
        }
      });
    }

    // Query excuses
    const excuses = await queryExcuses({
      category,
      mood,
      timeRange: timeRange || 'all',
      limit: parsedLimit
    });

    res.status(200).json({
      success: true,
      data: {
        excuses,
        count: excuses.length,
        filters: {
          category: category || 'all',
          mood: mood || 'all',
          timeRange: timeRange || 'all',
          limit: parsedLimit
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get excuse statistics
 */
async function getStats(req, res, next) {
  try {
    const stats = await getExcuseStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
  getStats,
  debugRedis
};