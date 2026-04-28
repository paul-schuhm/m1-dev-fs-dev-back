const express = require("express");
const app = express();
const port = 3000;

const routerv1 = require('./router/v1');

// Enregistrement routeur principal pour chaque version
app.use('/v1', routerv1);
// app.use('/v2', routerv2);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
