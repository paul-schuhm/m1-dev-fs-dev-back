const concertRepository = require("../../repository/concertRepository");
const hal = require("../../service/hal");
const pagination = require("../../service/paginate");

function all(req, res, next) {

    /* #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Offset pour pagination',                   
        required: false,                     
        type: 'string',                          
    } */

    /* #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Nombre d\'éléments par page',                   
        required: false,                     
        type: 'string',                          
    } */

    /* #swagger.responses[400] = {
    description: 'Bad value for query parameters',
    } */

    //Important : Toujours valider les paramètres d'URL (clé et valeur) !

    //Déclarer les paramètres d'URL acceptés
    const paginateEnum = ["offset", "limit"];

    //Comportement par défaut
    let query = {
        offset: 0,
        limit: pagination.LIMIT_DEFAULT,
        // sort_by, sort_order, filter_by
    };

    //Validation des paramètres d'URL
    if ("offset" in req.query && paginateEnum.includes("offset")) {
        //offset : doit être un entier, positif ou nul
        const offset = Number.parseInt(req.query.offset, 10);
        if (!isNaN(offset) && offset > -1) {
            //Met a jour les paramètres par défaut.
            query.offset = Number.parseInt(req.query.offset);
        } else {
            
            //Erreur: Bad request

            //A terminer : Délègue au middleware gestionnaire d'erreur...
            res.locals.errorResponse = hal.errorToResourceObject({
                code: 400,
                url: req.originalUrl,
                path: req.path,
                source: 'Bad value for query parameter \'offset\'',
                description: 'offset must be an integer, positive or nul',
                timestamp: new Date().getTime(),
            }, req.baseUrl);
            next();
        }
    }

    //Validation des paramètres d'URL
    if ("limit" in req.query && paginateEnum.includes("limit")) {
        //limit : doit être un entier positif
        const limit = Number.parseInt(req.query.limit, 10);
        if (!isNaN(limit) && limit > 0 && limit <= pagination.LIMIT_MAX) {
            //Met a jour les paramètres par défaut.
            query.limit = Number.parseInt(req.query.limit);
        }
    }

    //1. Appeller le repository pour récupérer les données
    const concerts = concertRepository.all();

    //Filtrer les concerts passés
    //Remarque : A déplacer en base de données
    const today = new Date();
    const upcoming_concerts = concerts.filter((c) => new Date(c.date) > today);

    //Trier les concerts du plus au moins récent
    //Remarque : A déplacer en base de données
    upcoming_concerts.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    //Paginer les résultats
    //Remarques : A déplacer en base de données
    const page = upcoming_concerts.slice(
        query.offset,
        query.offset + query.limit,
    );

    const hasNext = query.offset + query.limit < upcoming_concerts.length;
    const hasPrev = query.offset > 0;

    const current_url = `${req.baseUrl}?offset=${query.offset}&limit=${query.limit}`;
    const next_url = hasNext
        ? `${req.baseUrl}?offset=${query.offset + query.limit}&limit=${query.limit}`
        : null;
    const prev_url = hasPrev
        ? `${req.baseUrl}?offset=${Math.max(query.offset - query.limit, 0)}&limit=${query.limit}`
        : null;

    const response = hal.listeConcertsToResourceObject(
        page,
        req.baseUrl,
        current_url,
        next_url,
        prev_url,
    );

    //Fabrication de la réponse HTTP
    //Content type
    res.set("Content-Type", "application/hal+json");
    //Code status
    res.status(200);
    //Fin au cycle requete/repose
    res.json(response);
}

module.exports = { all };
