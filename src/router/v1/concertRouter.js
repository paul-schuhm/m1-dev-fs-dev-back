/**
 * Routeur des ressources associées aux concerts
 */

//Mapping entre url et les contrôleurs
//Configuration (câblage)

const express = require("express");
const router = express.Router();

//1. Importer le contrôleur de la v1
const concertController = require('../../controller/v1/concertController');

//2. Associer le contrôleur à la route
router.get('/concerts', concertController.all);

module.exports = router;
