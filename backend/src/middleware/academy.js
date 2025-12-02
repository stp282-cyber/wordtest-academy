const { ROLES } = require('../config/constants');

const academy = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Super Admin can access any academy if specified in query or body, otherwise no restriction
    if (req.user.role === ROLES.SUPER_ADMIN) {
        // If academy_id is provided in request, use it. Otherwise, proceed without specific academy context
        if (req.body.academy_id) {
            req.academyId = req.body.academy_id;
        } else if (req.query.academy_id) {
            req.academyId = req.query.academy_id;
        }
        return next();
    }

    // For other roles, enforce their assigned academy_id
    if (!req.user.academy_id) {
        return res.status(403).json({ message: 'User does not belong to an academy' });
    }

    req.academyId = req.user.academy_id;

    // Prevent accessing other academies
    if (req.body.academy_id && req.body.academy_id !== req.academyId) {
        return res.status(403).json({ message: 'Access denied to this academy' });
    }

    next();
};

module.exports = academy;
