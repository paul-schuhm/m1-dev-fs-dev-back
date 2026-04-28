//Déclarer nos middleware 'routeur' frontaux : manipule la requete et la réponse.

const concertRepository = require('../../repository/concertRepository');

/**
 * GET /concerts
 * Retourne la liste des concerts à venir
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function all(req, res, next) {

  //1. Appeller le repository pour récupérer les données
  const concerts = concertRepository.all();

  /*
    1. Modifier les champs :
      - supprimer id
      - supprimer nb_seats
      - ajouter nb de places restantes (égale à nb_seats pour l'instant)
      - supprimer date
      - ajouter date (formatée pour la zone)
      - ajouter heure
    2. Filtrer les concerts passés
    3. Trier les concerts du plus au moins récent
    4. Transformer la réponse en Resource Object (HAL)
    5. Paginer résultats (on le fera ensemble après)

  */


  //Fabrication de la réponse HTTP
  //Content type
  res.set('Content-Type', 'application/hal+json');
  //Code status
  res.status(200);
  //Fin au cycle requete/repose
  res.json(concerts);
}

module.exports = { all };
