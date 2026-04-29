const express = require("express");

const app = express();
const port = 3000;

//Monte la swagger UI uniquement en environnement de dev
if (process.env.NODE_ENV == "developement") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerFile = require("./oad.json");
  app.use("/v1/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

const routerv1 = require("./router/v1");

// Enregistrement routeur principal pour chaque version
app.use("/v1", routerv1);
// app.use('/v2', routerv2);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
