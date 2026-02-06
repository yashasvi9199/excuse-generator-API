const { queryExcuses, getExcuseStats, migrateData } = require('../services/redisService');

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

/**
 * Migrate existing data to new format
 */
async function runMigration(req, res, next) {
  try {
    const result = await migrateData();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
  getStats,
  runMigration
};