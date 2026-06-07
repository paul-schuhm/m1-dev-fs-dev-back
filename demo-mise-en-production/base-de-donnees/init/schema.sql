DROP DATABASE IF EXISTS api;

CREATE DATABASE api;

-- Sélection de la base de données
USE api;

DROP TABLE IF EXISTS Concert;

CREATE TABLE Concert(
    id INT AUTO_INCREMENT,
    performer VARCHAR(50) NOT NULL,
    date_start DATETIME NOT NULL,
    location VARCHAR(120) NOT NULL,
    nb_seats INT,
    CONSTRAINT pk_concert PRIMARY KEY(id),
    CONSTRAINT ck_nb_seats_gt_zero CHECK (nb_seats > 0)
);

-- Test data
INSERT INTO
    Concert (performer, date_start, location, nb_seats)
VALUES
    (
        'The Midnight Echo',
        STR_TO_DATE('2028-07-17 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Bordeaux (Arkéa Arena)',
        500
    ),
    (
        'Solar Flare',
        STR_TO_DATE('2024-10-05 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Strasbourg (Zénith Europe)',
        500
    ),
    (
        'Luna & The Wolves',
        STR_TO_DATE('2027-07-03 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Strasbourg (Zénith Europe)',
        1000
    ),
    (
        'Velocity 7',
        STR_TO_DATE('2026-06-08 17:00:00', '%Y-%m-%d %H:%i:%s'),
        'Nantes (Zénith Nantes Métropole)',
        500
    ),
    (
        'Neon Dreams',
        STR_TO_DATE('2026-06-11 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Paris (Accor Arena)',
        15000
    ),
    (
        'Electric Soul',
        STR_TO_DATE('2024-10-24 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Marseille (Le Dôme)',
        5000
    ),
    (
        'The Velvet Underground Revival',
        STR_TO_DATE('2026-06-04 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Lyon (Halle Tony Garnier)',
        15000
    ),
    (
        'Binary Star',
        STR_TO_DATE('2026-07-06 17:00:00', '%Y-%m-%d %H:%i:%s'),
        'Nice (Palais Nikaïa)',
        1000
    ),
    (
        'Echoes of Silence',
        STR_TO_DATE('2026-10-09 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Strasbourg (Zénith Europe)',
        500
    ),
    (
        'Stellar Groove',
        STR_TO_DATE('2026-06-21 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Bordeaux (Arkéa Arena)',
        300
    ),
    (
        'The Quantum Keys',
        STR_TO_DATE('2026-07-06 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Marseille (Le Dôme)',
        1000
    ),
    (
        'Arctic Fox',
        STR_TO_DATE('2027-09-29 17:00:00', '%Y-%m-%d %H:%i:%s'),
        'Nice (Palais Nikaïa)',
        15000
    ),
    (
        'Crimson Tide',
        STR_TO_DATE('2028-06-22 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Toulouse (Zénith de Toulouse)',
        5000
    ),
    (
        'Golden Hour',
        STR_TO_DATE('2026-11-12 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Bordeaux (Arkéa Arena)',
        5000
    ),
    (
        'Indigo Sky',
        STR_TO_DATE('2027-06-07 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Nice (Palais Nikaïa)',
        15000
    ),
    (
        'Urban Nomad',
        STR_TO_DATE('2026-07-01 17:00:00', '%Y-%m-%d %H:%i:%s'),
        'Bordeaux (Arkéa Arena)',
        300
    ),
    (
        'The Synth Theory',
        STR_TO_DATE('2026-09-04 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Lyon (Halle Tony Garnier)',
        5000
    ),
    (
        'Wildflower Rebellion',
        STR_TO_DATE('2026-10-22 19:00:00', '%Y-%m-%d %H:%i:%s'),
        'Paris (Accor Arena)',
        1000
    ),
    (
        'Iron & Silk',
        STR_TO_DATE('2026-11-11 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Strasbourg (Zénith Europe)',
        5000
    ),
    (
        'Midnight Caravan',
        STR_TO_DATE('2026-06-22 18:00:00', '%Y-%m-%d %H:%i:%s'),
        'Nantes (Zénith Nantes Métropole)',
        15000
    );