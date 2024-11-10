const express = require('express');
const dotenv = require('dotenv');
const { registerRoutes } = require('./routes/index.js');
dotenv.config();
const app = express();

const { sequelize } = require('./models/');
const PORT = process.env.PORT || 3000;

const { connectToRedis } = require('./config/redis');

app.use(express.json());
registerRoutes(app);
app.use(express.urlencoded({ extended: true }));

const startServer = async function () {
	try {
		await sequelize.authenticate();
		console.log('database connected');
	} catch (err) {
		console.log('Database connection failed', err);
		console.log('Error: ', err.message);
	}
};
startServer();
connectToRedis();

app.get('/health-check', (req, res) => {
	try {
		console.log('working fine');
		res.send('Health Check Right!!');
	} catch (err) {
		console.log('Error Message :', err);
	}
});
app.listen(PORT, () => {
	console.log(`server running on port http://localhost:${PORT}`);
});
