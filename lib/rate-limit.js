/**
 * Rate limiting middleware for API routes
 * Limits the number of requests a client can make in a given time period
 */

// Rate limit store - in memory implementation
// In a production environment, use Redis or similar
const rateStore = new Map();

/**
 * Generates a key for rate limiting based on IP address
 * @param {Object} req - HTTP request
 * @returns {string} - Unique key for the client
 */
function getRateLimitKey(req) {
  // Get client IP from headers if behind a proxy, or direct IP
  const ip = 
    req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    'unknown';
  
  return `rate-limit:${ip}`;
}

/**
 * Rate limit function that returns a limiter object with check method
 * Compatible with the API's usage pattern
 * @param {Object} options - Rate limiting options
 * @returns {Object} - Limiter object with check method
 */
export function rateLimit(options) {
  return {
    check: async (res, limit, identifier) => {
      // Create a key that combines the identifier with a fixed prefix
      const key = `${identifier}-limiter`;
      
      // Get current timestamp
      const now = Date.now();
      
      // Get or initialize client's rate limiting data
      const rateLimitData = rateStore.get(key) || {
        count: 0,
        resetTime: now + (options.interval)
      };
      
      // Reset count if the interval has passed
      if (now > rateLimitData.resetTime) {
        rateLimitData.count = 0;
        rateLimitData.resetTime = now + (options.interval);
      }
      
      // Increment request count
      rateLimitData.count += 1;
      
      // Store updated data
      rateStore.set(key, rateLimitData);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - rateLimitData.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000));
      
      // Check if rate limit exceeded
      if (rateLimitData.count > limit) {
        res.status(429).json({
          error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        });
        throw new Error('Rate limit exceeded');
      }
    }
  };
}

/**
 * Wrapper function for rate limiting API handlers
 * @param {Function} handler - Original API handler
 * @param {Object} options - Rate limiting options
 * @param {number} options.interval - Time interval in seconds
 * @param {number} options.limit - Max number of requests in the interval
 * @returns {Function} - Rate-limited API handler
 */
export function withRateLimit(handler, options = { interval: 60, limit: 10 }) {
  return async function rateLimit(req, res) {
    // Get client identifier
    const key = getRateLimitKey(req);
    
    // Get current timestamp
    const now = Date.now();
    
    // Get or initialize client's rate limiting data
    const rateLimitData = rateStore.get(key) || {
      count: 0,
      resetTime: now + (options.interval * 1000)
    };
    
    // Reset count if the interval has passed
    if (now > rateLimitData.resetTime) {
      rateLimitData.count = 0;
      rateLimitData.resetTime = now + (options.interval * 1000);
    }
    
    // Increment request count
    rateLimitData.count += 1;
    
    // Store updated data
    rateStore.set(key, rateLimitData);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000));
    
    // Check if rate limit exceeded
    if (rateLimitData.count > options.limit) {
      return res.status(429).json({
        error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
      });
    }
    
    // Proceed to the original handler if rate limit not exceeded
    return handler(req, res);
  };
} 