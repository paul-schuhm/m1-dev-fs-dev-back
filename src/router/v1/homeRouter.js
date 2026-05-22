const express = require("express");
const hal = require("../../service/hal");

const router = express.Router();

router.get("/", function (req, res, next) {
  //Retourne un objet JSON conforme à la spec HAL : un Resource Object
  res
    .status(200)
    .set("Content-Type", "application/hal+json")
    .send({
      //Navigation
      _links: {
        self: hal.halLinkObject("/"),
        concerts: hal.halLinkObject("/v1/concerts"),
      },
      //Etat actuel de ma ressource "Page d'accueil"
      description:
        "A (quasi)RESTful concerts ticketing system. Look for concerts and book a seat !",
    });
});

module.exports = router;
