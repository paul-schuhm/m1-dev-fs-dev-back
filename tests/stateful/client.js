/*
Un client test pour tester l'image qui sera livrée dans un environnement proche de la prod
Test d'intégration ou avec état pré-défini (base de données avec un jeu de données test, etc.)
Test depuis l'extérieur (image: code+deps) via un client HTTP
*/

const { test } = require('node:test');
const assert = require('node:assert/strict');

// Récupération de l'URL de l'API (fournie par Docker / la CI)
const API_URL = process.env.API_URL || 'http://localhost:3000';

test('GET /v1/concerts - Doit retourner la liste des concerts avec un statut 200', async () => {
    // 1. Envoi de la requête à l'API
    const response = await fetch(`${API_URL}/v1/concerts`);

    // 2. Vérification du Status Code 
    assert.equal(response.status, 200, `Le statut devrait être 200, mais reçu: ${response.status}`);

    // 3. Vérification du Content-Type
    const contentType = response.headers.get('content-type');
    assert.match(contentType, /^application\/hal\+json(;.*)?$/, 'La réponse doit être au format application/hal+json');

    // 4. Extraction et validation du corps JSON
    const body = await response.json();

    // On vérifie que le body est bien un objet (ou un tableau selon votre API)
    assert.equal(typeof body, 'object', 'Le corps de la réponse doit être un objet JSON');
  
    // Exemple : Vérifier qu'un champ spécifique "_links" existe
    assert.ok('_links' in body, 'La réponse JSON doit contenir un champ \'_links\'');
    assert.ok(Array.isArray(body._links), 'Le champ \'_links\' doit être un tableau');
    assert.ok(
        'total_items' in body, 
        'Le body de la réponse est manquant du champ obligatoire \'total\'',
    );
    assert.strictEqual(
        typeof body.total_items, 
        'number', 
        'Le champ \'total_items\' doit être un nombre',
    );
    //Vérifier que l'on récupère les données sur les concerts attendues
    // Etc... assert.ok(
    //     body.total_items === 3, 
    //     'Le champ \'total_items\' doit être égal à 3',
    // );
});