const path = require('path');
const express = require('express');

const app = express();

const port = process.env.PORT || 3000;
const publicStaticPath = path.join(__dirname, '../public');

app.use(express.json);
app.use(express.static(publicStaticPath));

app.listen(port, () => {
  console.log(`Server started. Bind to port ${port}`);
});
