//Déclarer nos middleware 'routeur' frontaux : manipule la requete et la réponse.

const concertRepository = require("../../repository/concertRepository");
const hal = require("../../service/hal");

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

  //Filtrer les concerts passés
  //Remarque : A déplacer en base de données
  const today = new Date();
  const upcoming_concerts = concerts.filter((c) => new Date(c.date) > today);

  //Trier les concerts du plus au moins récent
  //Remarque : A déplacer en base de données
  upcoming_concerts.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  /*
    Paginer résultats
  */

  
  const response = hal.listeConcertsToResourceObject(
    upcoming_concerts,
    req.baseUrl,
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
