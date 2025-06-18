const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import user routes
const userRoutes = require('./routers/user');
// Use user routes
app.use('/api', userRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the User Management API');
});
// connect to port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
