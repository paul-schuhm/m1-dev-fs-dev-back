const request = require('supertest');
const express = require('express');
const concertController = require('../../src/controller/v1/concertController');

// 1. On mock le repository pour qu'il renvoie des données prévisibles en dur
const concertRepository = require('../../src/repository/concertRepository');
jest.mock('../../src/repository/concertRepository');

// 2. On crée une mini-app Express jetable dédiée au test du contrôleur
const app = express();
app.get('/v1/concerts', concertController.all);

describe('=== TEST HTTP : concertController ===', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('devrait répondre avec le bon Content-Type et un statut 200', async () => {
    // On prépare le comportement de notre mock
        concertRepository.all.mockReturnValue([
            { id: 1, title: 'Futur Concert', date: '2028-01-01' },
        ]);

        const response = await request(app).get('/v1/concerts').expect(200);

        // Validation des attentes HTTP spécifiques
        expect(response.headers['content-type']).toMatch(/application\/hal\+json/);
        expect(response.body).toHaveProperty('_links');
    });

    it('devrait lever une erreur ou appeler next() si l\'offset est négatif', async () => {
        await request(app).get('/v1/concerts?offset=-5');
        expect(concertRepository.all).not.toHaveBeenCalled();
    });
});
