const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,  // Added: ensures id uniqueness
        index: true     // Added: improves query performance
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,                    // Removes whitespace from both ends
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    priority: {
        type: Number,
        required: [true, 'Priority is required'],
        min: [1, 'Priority must be at least 1'],
        max: [5, 'Priority cannot exceed 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Priority must be an integer'
        }
    },
    done: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

// Add an index for common queries (find by done status and priority)
taskSchema.index({ done: 1, priority: -1 });

// Virtual for formatted response
taskSchema.virtual('status').get(function() {
    return this.done ? 'Completed' : 'Pending';
});

// Instance method to toggle task completion
taskSchema.methods.toggleDone = function() {
    this.done = !this.done;
    return this.save();
};

// Static method to find high priority tasks
taskSchema.statics.findHighPriority = function() {
    return this.find({ priority: { $gte: 4 }, done: false });
};

// Pre-save middleware for logging (optional)
// taskSchema.pre('save', function(next) {
//     console.log(`Saving task: ${this.title} (Priority: ${this.priority})`);
//     next();
// });

taskSchema.pre('save', async function() {
  console.log(`Saving task: ${this.title} (Priority: ${this.priority})`);
});

// Post-save middleware
taskSchema.post('save', function(doc) {
    console.log(`Task saved successfully: ${doc.id} - ${doc.title}`);
});

// Ensure virtuals are included in JSON output
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;