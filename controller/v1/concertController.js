//Déclarer nos middleware 'routeur' frontaux : manipule la requete et la réponse.

/**
 * GET /concerts
 * Retourne la liste des concerts à venir
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function all(req, res, next) {
  res.send("Liste des concerts");
}

module.exports = { all };
