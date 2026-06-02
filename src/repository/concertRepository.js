//Couche d'abstraction sur les données

'use strict';

// A remplacer par un appel à une db
const concerts = require('../data/db');
const createConcert = require('../model/concert');

/**
 * Retourne tous les concerts
 */
function all() {
    //Générer temporairement un identifiant (on le remplacera par son id reel quand on aura une base de données).
    return concerts.map((c, i) =>
        createConcert({
            id: i + 1,
            ...c,
        }),
    );
}

module.exports = { all };
