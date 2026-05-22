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
 * @param {*} 
 * @throws Si une donnée est invalide
 * @returns 
 */
function createConcert({id, artist, date, location, nb_seats}){
    //Validation sur les données
    if(!(nb_seats > 1)){
        throw new Error("nb_seats must be greater than 0");
    }
    //Validation...
    //Valider la date !

    //L'objet est initialisé dans un état valide.
    return new Concert(id, artist, date, location, nb_seats);
}

module.exports = createConcert;