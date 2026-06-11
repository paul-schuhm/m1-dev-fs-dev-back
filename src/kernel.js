const express = require('express');

const app = express();
require('express-ws')(app);
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

//Match toutes les autres routes (celles qui n'existent pas)
app.use(function (req, res, next) {
    const err = new Error('Ressource introuvable');
    err.status = 404;
    next(err);
});

// Dernier middleware : gestionnaire d'erreur, détecté par ses 4 arguments (prefix _ (_next) pour dire a eslint d'ignorer l'arg non utilisé)
// @see https://expressjs.com/fr/5x/guide/error-handling/#%C3%A9criture-des-gestionnaires-derreurs
app.use(function (err, req, res, _next) {

    res.locals.message = err.message;
    // On ne logue et retourne l'erreur complète que si on est en environnement développement
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    res.status(err.status || 500);
    res.json(res.locals.message);
});

//Lancement du serveur http
app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Web API Ticketing system listening on port ${port}`);
    }
});
