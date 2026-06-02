const express = require('express');

const app = express();
const port = 3000;

//Monte la swagger UI uniquement en environnement de dev
if (process.env.NODE_ENV === 'development') {
    console.log('mounting swagger-ui');
    const swaggerUi = require('swagger-ui-express');
    const swaggerFile = require('../oad.json');
    app.use('/v1/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

const routerv1 = require('./router/v1');
const routerHome = require('./router/v1/homeRouter');

// Enregistrement routeur principal pour chaque version
app.use('/', routerHome);
app.use('/v1', routerv1);

// Pour une éventuelle v2 de l'API
// app.use('/v2', routerv2);

app.use(function (req, res, next) {
    const err = new Error('Ressource introuvable');
    err.status = 404;
    next(err); // On passe l'erreur au middleware suivant (le error handler)
});

// Dernier middleware : error handler
app.use(function (err, req, res, _next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // On ne logue l'erreur complète que si on est en développement
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    // render the error page
    res.status(err.status || 500);
    // A compléter.
    res.json(res.locals.message);
});

app.listen(port, () => {
    console.log(`Web API Ticketing system listening on port ${port}`);
});
