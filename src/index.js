const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
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
