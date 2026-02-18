const express = require('express');
const Relationship = require('../models/Relationship');
const Member = require('../models/Member');
const router = express.Router();

// GET /api/relationships - Get all relationships
router.get('/', async (req, res) => {
    try {
        const relationships = await Relationship.find()
            .populate('memberId', 'name gender')
            .populate('relatedMemberId', 'name gender');

        res.json({ relationships });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch relationships', details: error.message });
    }
});

// GET /api/relationships/member/:id - Get all relationships for a specific member
router.get('/member/:id', async (req, res) => {
    try {
        const relationships = await Relationship.find({
            $or: [
                { memberId: req.params.id },
                { relatedMemberId: req.params.id }
            ]
        })
            .populate('memberId', 'name gender photoUrl childOrder')
            .populate('relatedMemberId', 'name gender photoUrl childOrder');

        res.json({ relationships });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch member relationships', details: error.message });
    }
});

// POST /api/relationships - Create new relationship (with auto-bidirectional)
router.post('/', async (req, res) => {
    try {
        const { memberId, relatedMemberId, relationshipType } = req.body;

        // Validate member IDs exist
        const member = await Member.findById(memberId);
        const relatedMember = await Member.findById(relatedMemberId);

        if (!member || !relatedMember) {
            return res.status(400).json({ error: 'One or both members not found' });
        }

        const createdRelationships = [];

        // Create primary relationship
        const relationship = new Relationship({ memberId, relatedMemberId, relationshipType });
        await relationship.save();
        createdRelationships.push(relationship);

        // Create bidirectional relationship based on type
        let reverseType = null;
        if (relationshipType === 'parent') {
            reverseType = 'child';
        } else if (relationshipType === 'child') {
            reverseType = 'parent';
        } else if (relationshipType === 'spouse' || relationshipType === 'sibling') {
            reverseType = relationshipType; // Same type for spouse and sibling
        }

        if (reverseType) {
            try {
                const reverseRelationship = new Relationship({
                    memberId: relatedMemberId,
                    relatedMemberId: memberId,
                    relationshipType: reverseType
                });
                await reverseRelationship.save();
                createdRelationships.push(reverseRelationship);
            } catch (error) {
                // Ignore duplicate error (relationship may already exist)
                if (error.code !== 11000) {
                    throw error;
                }
            }
        }

        res.status(201).json({ relationships: createdRelationships });
    } catch (error) {
        if (error.message.includes('Cannot create relationship with self')) {
            return res.status(400).json({ error: 'Cannot create relationship with self' });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Relationship already exists' });
        }
        res.status(500).json({ error: 'Failed to create relationship', details: error.message });
    }
});

// DELETE /api/relationships/:id - Delete relationship
router.delete('/:id', async (req, res) => {
    try {
        const relationship = await Relationship.findByIdAndDelete(req.params.id);

        if (!relationship) {
            return res.status(404).json({ error: 'Relationship not found' });
        }

        res.json({ message: 'Relationship deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete relationship', details: error.message });
    }
});

module.exports = router;
