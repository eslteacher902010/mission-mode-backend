const dotenv = require('dotenv');
dotenv.config();
const express = require('express');


const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const app = express();
// Middleware
app.use(express.json());
app.use(cors());
console.log("🔥 CORS MIDDLEWARE ACTIVE");


//models
const Mission= require('./models/missions.js');
const Badge= require('./models/badge.js');

//controllers
const missionRouter = require('./controllers/missions.js');
const badges= require('./controllers/badge.js');
const authRouter = require('./controllers/auth');
const testJwtRouter = require('./controllers/test-jwt');



//mongodb 


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log("=== MongoDB Connection Info ===");
  console.log("Database name:", mongoose.connection.db.databaseName);
  console.log("Host:", mongoose.connection.host);
  console.log("Port:", mongoose.connection.port);
  console.log("===============================");
});

app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/missions', missionRouter); 
app.use('/badges', badges);
app.use('/auth', authRouter);
app.use('/test-jwt', testJwtRouter);
app.use('/', require('./controllers/seedBadges'));

// Start the server



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}`);
});
