class Concert {
    constructor(id, artist, date, location, nb_seats) {
        this.id = id;
        this.artist = artist;
        this.date = date;
        this.location = location;
        this.nb_seats = nb_seats;
    }
}

/**
 * Retourne un Concert dans un état valide.
 * @param {Object} data
 * @param {string|number} data.id
 * @param {string} data.artist
 * @param {Date|string} data.date
 * @param {string} data.location
 * @param {number} data.nb_seats
 * @throws {Error} Si une donnée est manquante ou invalide
 * @returns {Concert}
 */
function createConcert({ id, artist, date, location, nb_seats }) {
    //Validation des données
    if (!id || !artist || !location) {
        throw new Error('Missing required fields: id, artist, and location are mandatory.');
    }

    if (!Number.isInteger(nb_seats) || nb_seats <= 0) {
        throw new Error('nb_seats must be a number greater than 0');
    }

    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
        throw new Error('The provided date is invalid.');
    }

    if (parsedDate < new Date()) {
        throw new Error('The concert date must be in the future.');
    }

    return new Concert(id, artist, parsedDate, location, nb_seats);
}

module.exports = createConcert;
