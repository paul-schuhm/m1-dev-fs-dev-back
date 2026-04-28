/**
 * Routeur des ressources associées aux concerts
 */

//Mapping entre url et les contrôleurs
//Configuration (cablage)

const express = require("express");
const router = express.Router();

//1. Importer le controleur de la v1
const concertController = require('../../controller/v1/concertController');

//2. Associer le controleur à la route
router.get('/concerts', concertController.all);

module.exports = router;
