const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const { sequelize } = require('./models/');
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
