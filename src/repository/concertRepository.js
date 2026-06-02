//Couche d'abstraction sur les données

'use strict';

const db = require('../data/db');
const createConcert = require('../model/concert');

/**
 * Retourne tous les concerts à venir
 */
async function upcomingConcerts() {    
    const [rows] = await db.connexion.execute('SELECT * FROM Concert WHERE date_start > CURRENT_DATE ORDER BY date_start ASC');

    return rows.map(concert => createConcert(
        {
            id: concert.id, 
            artist: concert.performer, 
            date: concert.date_start, 
            location: concert.location, 
            nb_seats: concert.nb_seats,
        },
    ));
}

module.exports = { upcomingConcerts };
