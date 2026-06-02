/**
 * Fonctions pour présenter les données suivant la spécification HAL
 * Voir la spécification HAL (RFC, source) : https://datatracker.ietf.org/doc/html/draft-kelly-json-hal
 */
const paginate = require('./paginate');
/**
 * Retourne un Link Object
 * @param {*} url
 * @param {*} type
 * @param {*} name
 * @param {*} templated
 * @param {*} deprecation
 * @returns
 */
function halLinkObject(
    url,
    type = '',
    name = '',
    templated = false,
    deprecation = false,
) {
    return {
        href: url,
        templated: templated,
        ...(type && { type: type }),
        ...(name && { name: name }),
        ...(deprecation && { deprecation: deprecation }),
    };
}

/**
 * Retourne une représentation Resource Object (HAL) de la liste des concerts à venir
 * @param {} concerts
 * @param {*} baseUrl
 */
function listeConcertsToResourceObject(concerts, baseUrl, current_page, next_page, prev_page) {

    return {
        _links: [
            {
                self: halLinkObject(baseUrl + `/concerts{?offset=0&limit=${paginate.LIMIT_DEFAULT}}`, 'string', '', true),
                current_page: current_page,
                next_page: next_page,
                prev_page: prev_page,
            },
        ],
        _embedded: concerts.map((c) => concertItemListToResourceObject(c, baseUrl)),

        //Données propres à la liste
        total_items: concerts.length,
        created_at: new Date(),
    };
}

/**
 * Retourne une représentation Resource Object (HAL) d'une erreur de traitement d'une requête HTTP
 * @param {*} errorData 
 * @returns 
 */
function errorToResourceObject(errorData) {
    return {
        _links: {
            self: halLinkObject(errorData.url, 'string'),
            path: halLinkObject(errorData.path),
        },
        url: errorData.url,
        source: errorData.source,
        description: errorData.description,
        timestamp: errorData.timestamp,
        error: errorData.code,
    };
}

/**
 * Retourne une représentation Ressource Object (HAL) d'un concert présenté dans une liste
 * @param {*} concertData Données brutes d'un concert
 * @returns un Ressource Object Concert (spec HAL)
 */
function concertItemListToResourceObject(concertData, baseUrl) {
    return {
        _links:
        {
            self: halLinkObject(
                baseUrl + '/concerts' + '/' + concertData.id,
                'string',
            ),
            reservation: halLinkObject(
                baseUrl + '/concerts' + '/' + concertData.id + '/reservations',
                'string',
            ),
        },
        remainingAttendeeCapacity:
            concertData.nb_seats - (concertData.nb_reservations ?? 0),
        date_start: concertData.date,
        local_date: new Date(concertData.date).toLocaleDateString('fr-FR', {
            timeZone: 'Europe/Paris',
        }),
        local_hour: new Date(concertData.date).toLocaleTimeString('fr-FR', {
            timeZone: 'Europe/Paris',
        }),
        performer: concertData.artist,
        location: concertData.location,
    };
}

/**
 * Retourne une représentation Ressource Object (HAL) d'une réservation
 * @param {*} reservationData Données brutes d'une reservation
 * @returns un Ressource Object Concert (spec HAL)
 */
function reservationToResourceObject(data, baseURL) {
    return {
        _links:
        {
            self: halLinkObject(
                `${baseURL}/concerts/${data.id_concert}/reservations/?`,
                'string',
            ),
        },
        pseudo: data.id_user,
        date_reservation: data.date_booking,
        status: data.statut,
    };
}

/**
 * Retourne un Resource Object d'un utilisateur
 * @param {*} utilisateurData
 * @param {*} baseURL
 * @returns
 */
function userToResourceObject(utilisateurData, baseURL) {
    return {
        _links:
        {
            self: halLinkObject(
                baseURL + '/utilisateurs' + '/' + utilisateurData.pseudo,
                'string',
            ),
        },
        _embedded: {
            pseudo: utilisateurData.pseudo,
        },
    };
}

module.exports = {
    halLinkObject,
    errorToResourceObject,
    concertItemListToResourceObject,
    userToResourceObject,
    reservationToResourceObject,
    listeConcertsToResourceObject,
};
