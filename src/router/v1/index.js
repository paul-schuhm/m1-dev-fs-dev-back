//Configuration : enregistrer tous les routeurs de la v1.

const express = require('express');
const router = express.Router();

// 1. Import des routeurs pour chaque ressource
const concertRouter = require('./concertRouter');
const chatRouter = require('./chatRouter');

// 2. Enregistrement sur le routeur principal
router.use('/', concertRouter);
router.use('/', chatRouter);

module.exports = router;
