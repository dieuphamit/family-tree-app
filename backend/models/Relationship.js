const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Member ID is required']
    },
    relatedMemberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Related member ID is required']
    },
    relationshipType: {
        type: String,
        enum: ['parent', 'child', 'spouse', 'sibling'],
        required: [true, 'Relationship type is required']
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Compound index to prevent duplicate relationships
relationshipSchema.index({ memberId: 1, relatedMemberId: 1, relationshipType: 1 }, { unique: true });

// Validation: Cannot create relationship with self
relationshipSchema.pre('save', function (next) {
    if (this.memberId.equals(this.relatedMemberId)) {
        next(new Error('Cannot create relationship with self'));
    }
    next();
});

module.exports = mongoose.model('Relationship', relationshipSchema);
