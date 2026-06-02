//Configuration : enregistrer tous les routeurs de la v1.

const express = require('express');
const router = express.Router();

// 1. Import des routeurs pour chaque ressource
const concertRouter = require('./concertRouter');

// 2. Enregistrement sur le routeur principal
router.use('/', concertRouter);

module.exports = router;
