const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

/**
 * POST /api/auth/check-admin
 * Verify admin password
 */
router.post('/check-admin', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: 'Password required',
                isAdmin: false
            });
        }

        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!passwordHash) {
            console.error('ADMIN_PASSWORD_HASH not configured');
            return res.status(500).json({
                error: 'Server configuration error',
                isAdmin: false
            });
        }

        const isValid = await bcrypt.compare(password, passwordHash);

        res.json({
            isAdmin: isValid,
            message: isValid ? 'Admin access granted' : 'Invalid password'
        });
    } catch (error) {
        console.error('Check admin error:', error);
        res.status(500).json({
            error: 'Authentication error',
            isAdmin: false
        });
    }
});

/**
 * POST /api/auth/generate-hash
 * Helper endpoint to generate password hash (development only)
 * Remove in production!
 */
router.post('/generate-hash', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        const hash = await bcrypt.hash(password, 10);

        res.json({
            hash,
            message: 'Add this to your .env as ADMIN_PASSWORD_HASH'
        });
    } catch (error) {
        console.error('Generate hash error:', error);
        res.status(500).json({ error: 'Hash generation error' });
    }
});

module.exports = router;
