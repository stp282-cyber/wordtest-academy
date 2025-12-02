const cache = (duration) => {
    return (req, res, next) => {
        // Simple in-memory cache implementation or Redis
        // For now, just pass through as placeholder
        // In production, check Redis key based on req.originalUrl

        if (req.method !== 'GET') {
            return next();
        }

        // console.log(`Cache check for ${req.originalUrl}`);
        next();
    };
};

module.exports = cache;
