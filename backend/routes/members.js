const express = require('express');
const Member = require('../models/Member');
const Relationship = require('../models/Relationship');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/members - Get all members with relationships
router.get('/', async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        const relationships = await Relationship.find();

        res.json({
            members,
            relationships
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members', details: error.message });
    }
});

// GET /api/members/:id - Get single member
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch member', details: error.message });
    }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();

        res.status(201).json({ member });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const details = {};
            Object.keys(error.errors).forEach(key => {
                details[key] = error.errors[key].message;
            });
            return res.status(400).json({ error: 'Validation failed', details });
        }
        res.status(500).json({ error: 'Failed to create member', details: error.message });
    }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ member });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const details = {};
            Object.keys(error.errors).forEach(key => {
                details[key] = error.errors[key].message;
            });
            return res.status(400).json({ error: 'Validation failed', details });
        }
        res.status(500).json({ error: 'Failed to update member', details: error.message });
    }
});

// DELETE /api/members/:id - Delete member and cascade relationships
router.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Cascade delete all relationships
        const deletedRelationships = await Relationship.deleteMany({
            $or: [
                { memberId: req.params.id },
                { relatedMemberId: req.params.id }
            ]
        });

        res.json({
            message: 'Member deleted successfully',
            deletedRelationships: deletedRelationships.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete member', details: error.message });
    }
});

// PATCH /api/members/:id/position - Update member position (admin only)
router.patch('/:id/position', requireAdmin, async (req, res) => {
    try {
        const { positionX, positionY } = req.body;

        const member = await Member.findByIdAndUpdate(
            req.params.id,
            { positionX, positionY },
            { new: true, runValidators: true }
        );

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/members/save-layout - Save layout (bulk update positions) - admin only
router.post('/save-layout', requireAdmin, async (req, res) => {
    try {
        const { positions } = req.body; // { memberId: { x, y }, ... }

        if (!positions || typeof positions !== 'object') {
            return res.status(400).json({ error: 'Invalid positions data' });
        }

        const updates = [];
        for (const [memberId, pos] of Object.entries(positions)) {
            updates.push(
                Member.findByIdAndUpdate(
                    memberId,
                    { positionX: pos.x, positionY: pos.y },
                    { new: true }
                )
            );
        }

        await Promise.all(updates);

        res.json({
            success: true,
            message: `Updated ${updates.length} member positions`,
            count: updates.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
