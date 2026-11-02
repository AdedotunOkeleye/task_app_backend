const Task = require("../model/task");

const getAllTasks = async (req, res) => {
    try {
        console.log('GET /tasks - Fetching all tasks');
        const tasks = await Task.find({}).sort({ createdAt: -1 });
        console.log(`Found ${tasks.length} tasks`);
        
        res.json({ 
            success: true, 
            count: tasks.length,
            data: tasks 
        });
    } catch (error) {
        console.error('Error in getAllTasks:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        console.log(`GET /tasks/${req.params.id} - Fetching task`);
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: "Task not found" 
            });
        }
        res.json({ 
            success: true, 
            data: task 
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid task ID format" 
            });
        }
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const createTask = async (req, res) => {
    try {
        console.log('POST /tasks - Creating task with body:', req.body);
        const { title, priority } = req.body;
        
        if (!title) {
            return res.status(400).json({ 
                success: false, 
                message: "Title is required" 
            });
        }
        
        if (!priority || priority < 1 || priority > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Priority must be a number between 1 and 5" 
            });
        }
        
        // Find the highest existing id and increment
        const lastTask = await Task.findOne().sort({ id: -1 });
        const nextId = lastTask ? lastTask.id + 1 : 1;
        
        const task = new Task({
            id: nextId,
            title: title.trim(),
            priority: parseInt(priority),
            done: false
        });
        
        const savedTask = await task.save();
        console.log('Task created successfully:', savedTask._id);
        
        res.status(201).json({ 
            success: true, 
            data: savedTask 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: messages.join(', ') 
            });
        }
        console.error('Error in createTask:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const updateTask = async (req, res) => {
    try {
        console.log(`PUT /tasks/${req.params.id} - Updating task`);
        const { title, priority, done } = req.body;
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: "Task not found" 
            });
        }
        
        if (title !== undefined) task.title = title.trim();
        if (priority !== undefined) task.priority = parseInt(priority);
        if (done !== undefined) task.done = done;
        
        const updatedTask = await task.save();
        console.log('Task updated successfully');
        
        res.json({ 
            success: true, 
            data: updatedTask 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: messages.join(', ') 
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid task ID format" 
            });
        }
        console.error('Error in updateTask:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        console.log(`DELETE /tasks/${req.params.id} - Deleting task`);
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: "Task not found" 
            });
        }
        
        console.log('Task deleted successfully');
        res.json({ 
            success: true, 
            message: "Task deleted successfully",
            data: task 
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid task ID format" 
            });
        }
        console.error('Error in deleteTask:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

module.exports = { 
    getAllTasks, 
    getTaskById, 
    createTask, 
    updateTask, 
    deleteTask 
};