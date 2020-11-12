const { json } = require('express');
const app = require('./app');
const port = process.env.PORT || 5000;




app.listen(port, () => console.log(`Server starter on port ${port}`));