const bcrypt = require('bcrypt');

/**
 * Middleware to check if request has valid admin password
 */
const requireAdmin = async (req, res, next) => {
    try {
        const adminPassword = req.headers['x-admin-password'];

        if (!adminPassword) {
            return res.status(403).json({
                error: 'Admin access required',
                message: 'No admin password provided'
            });
        }

        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!passwordHash) {
            console.error('ADMIN_PASSWORD_HASH not configured in .env');
            return res.status(500).json({
                error: 'Server configuration error'
            });
        }

        const isValid = await bcrypt.compare(adminPassword, passwordHash);

        if (!isValid) {
            return res.status(403).json({
                error: 'Invalid admin password'
            });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};

module.exports = { requireAdmin };
