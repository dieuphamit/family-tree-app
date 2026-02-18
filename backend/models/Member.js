const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    dateOfDeath: {
        type: Date,
        default: null
    },
    placeOfResidence: {
        type: String,
        trim: true,
        default: ''
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed'],
        default: 'single'
    },
    occupation: {
        type: String,
        trim: true,
        default: ''
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    photoUrl: {
        type: String,
        default: '/uploads/default-avatar.png'
    },
    childOrder: {
        type: Number,
        default: null  // null if not a child, or 1, 2, 3... for birth order
    },
    generation: {
        type: Number,
        default: 0  // 0 = root, 1 = children, 2 = grandchildren, -1 = parents, -2 = grandparents
    },
    positionX: {
        type: Number,
        default: 0
    },
    positionY: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Text index for search functionality
memberSchema.index({ name: 'text' });

// Custom validation: dateOfDeath must be after dateOfBirth
memberSchema.pre('save', function (next) {
    if (this.dateOfDeath && this.dateOfBirth && this.dateOfDeath < this.dateOfBirth) {
        next(new Error('Date of death must be after date of birth'));
    }
    next();
});

module.exports = mongoose.model('Member', memberSchema);
