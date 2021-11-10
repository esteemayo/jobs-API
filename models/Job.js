const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: [50, 'A company must have less or equal than 50 characters'],
    },
    slug: String,
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: [100, 'A position must have less or equal than 100 characters'],
    },
    status: {
        type: String,
        enum: ['interview', 'decline', 'pending'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
}, {
    timestamps: true,
});

jobSchema.index({ company: 1, createdBy: 1 });
jobSchema.index({ slug: -1 });

jobSchema.pre('save', async function (next) {
    if (!this.isModified('company')) return next();
    this.slug = slugify(this.company, { lower: true });

    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const jobWithSlug = await this.constructor.find({ slug: slugRegEx });

    if (jobWithSlug.length) {
        this.slug = `${this.slug}-${jobWithSlug.length + 1}`;
    }
});

jobSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'createdBy',
        select: 'name email',
    });

    next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
