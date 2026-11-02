const express = require('express');
const taskRoutes = require('./routes/tasks');

const app = express();

// CORS middleware - MUST be FIRST before any routes
app.use((req, res, next) => {
  // Allow all origins for development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/tasks', taskRoutes);

// Root route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: "Task Manager API is running",
        endpoints: {
            tasks: "GET /tasks",
            createTask: "POST /tasks",
            getTask: "GET /tasks/:id",
            updateTask: "PUT /tasks/:id",
            deleteTask: "DELETE /tasks/:id"
        }
    });
});

// 404 handler - keep at the end
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.method} ${req.url} not found` 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;