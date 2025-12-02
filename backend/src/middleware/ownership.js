const { ROLES } = require('../config/constants');

const checkOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Super Admin and Academy Admin usually have broad access, 
        // but strict ownership might be needed for student-specific resources.
        if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ACADEMY_ADMIN) {
            return next();
        }

        const resourceId = req.params[resourceIdParam];

        // For students, they should usually only access their own data.
        // This is a generic check; specific logic might be needed per resource type.
        // For now, we assume if the resource ID matches the user ID (e.g. /users/:id), it's allowed.
        if (resourceId === req.user.id) {
            return next();
        }

        // If checking against a resource that belongs to the user (like test results), 
        // we would need to query the DB. Since this is a generic middleware, 
        // we'll implement specific checks in controllers or specialized middleware.

        // Fallback for simple user-id matching
        if (req.user.role === ROLES.STUDENT && resourceId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

module.exports = checkOwnership;
