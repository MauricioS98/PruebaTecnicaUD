-- Datos iniciales de prueba
-- Ejecutar DESPUÉS de db.sql (en este orden):
--   1) psql -U tu_usuario -d tu_base -f db.sql
--   2) psql -U tu_usuario -d tu_base -f seed.sql
--
-- Re-ejecutable: vacía tablas de negocio y auditoría antes de insertar.

ROLLBACK;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_app'
    ) THEN
        RAISE EXCEPTION 'Faltan las tablas base. Ejecuta db.sql completo antes de seed.sql.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'audit'
    ) THEN
        RAISE EXCEPTION 'No existe el esquema audit. Ejecuta db.sql completo antes de seed.sql.';
    END IF;
END $$;

BEGIN;

SELECT audit.set_changed_by('seed@system.local');

-- ---------------------------------------------------------------------------
-- Limpieza de datos (no elimina el esquema)
-- TRUNCATE no dispara triggers de auditoría.
-- ---------------------------------------------------------------------------

TRUNCATE TABLE
    audit.interpretation_artist_audit,
    audit.interpretation_audit,
    audit.type_interpretation_audit,
    audit.instrument_audit,
    audit.type_instrument_audit,
    audit.artist_audit,
    audit.director_audit,
    audit.work_genre_audit,
    audit.genre_audit,
    audit.composition_audit,
    audit.work_audit,
    audit.composer_audit,
    audit.user_app_audit,
    audit.log
RESTART IDENTITY;

TRUNCATE TABLE
    interpretation_artist,
    interpretation,
    composition,
    work_genre,
    instrument,
    type_instrument,
    type_interpretation,
    composer,
    director,
    artist,
    work,
    genre,
    user_app
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------------

INSERT INTO user_app (name, email, is_admin) VALUES
    ('Administrador Sistema', 'admin@sistema.local', true),
    ('Ana García',            'ana.garcia@musica.local', false),
    ('Carlos Ruiz',           'carlos.ruiz@musica.local', false),
    ('Laura Méndez',          'laura.mendez@musica.local', false);

-- ---------------------------------------------------------------------------
-- Tipos de interpretación
-- ---------------------------------------------------------------------------

INSERT INTO type_interpretation (name, description, min_artist, max_artist) VALUES
    ('Individual',         'Un solo intérprete',                              1,   1),
    ('Duo',                'Dos intérpretes',                                 2,   2),
    ('Trío',               'Tres intérpretes',                                3,   3),
    ('Cuarteto',           'Cuatro intérpretes',                              4,   4),
    ('Quinteto',           'Cinco intérpretes',                               5,   5),
    ('Orquesta de cámara', 'Formación de cámara',                            10,  40),
    ('Sinfónica',          'Orquesta sinfónica completa',                    60, 100),
    ('Histórico',          'Registro antiguo con datos incompletos',          0, 999);

-- ---------------------------------------------------------------------------
-- Géneros
-- ---------------------------------------------------------------------------

INSERT INTO genre (name, description) VALUES
    ('Barroco',    'Música compuesta aprox. entre 1600 y 1750'),
    ('Clásico',    'Período clásico, mediados del siglo XVIII'),
    ('Romántico',  'Música del siglo XIX'),
    ('Sinfónico',  'Obras escritas para orquesta sinfónica');

-- ---------------------------------------------------------------------------
-- Compositores (algunos sin usuario: figuras históricas)
-- ---------------------------------------------------------------------------

INSERT INTO composer (id_user, nickname, description) VALUES
    (NULL, 'Ludwig van Beethoven', 'Compositor alemán, período romántico temprano'),
    (NULL, 'Wolfgang Amadeus Mozart', 'Compositor austriaco del clasicismo'),
    (NULL, 'Johann Sebastian Bach', 'Compositor alemán del barroco'),
    (2,    'Ana García', 'Compositora contemporánea vinculada a usuario de la app');

-- ---------------------------------------------------------------------------
-- Obras
-- ---------------------------------------------------------------------------

INSERT INTO work (name, description, write_date) VALUES
    (
        'Sinfonía No. 9 en re menor, Op. 125',
        'Incluye el movimiento «Oda a la alegría»',
        '1824-05-07'
    ),
    (
        'Concierto para piano No. 21 en do mayor, K. 467',
        'Conocido como «Elvira Madigan» por su uso en cine',
        '1785-03-09'
    ),
    (
        'Suite No. 3 en re mayor, BWV 1068',
        'Incluye el famoso «Air on the G String»',
        '1731-01-01'
    ),
    (
        'Ecos del río',
        'Obra colaborativa contemporánea para orquesta de cámara',
        '2020-06-15'
    );

-- ---------------------------------------------------------------------------
-- Composición (varios compositores en una misma obra)
-- ---------------------------------------------------------------------------

INSERT INTO composition (id_composer, id_work) VALUES
    (1, 1),  -- Beethoven → Sinfonía No. 9
    (2, 2),  -- Mozart → Concierto piano 21
    (3, 3),  -- Bach → Suite No. 3
    (4, 4),  -- Ana García → Ecos del río
    (1, 4);  -- Beethoven coautor en obra colaborativa

-- ---------------------------------------------------------------------------
-- Géneros por obra
-- ---------------------------------------------------------------------------

INSERT INTO work_genre (id_work, id_genre) VALUES
    (1, 3), (1, 4),
    (2, 2),
    (3, 1),
    (4, 2), (4, 4);

-- ---------------------------------------------------------------------------
-- Directores
-- ---------------------------------------------------------------------------

INSERT INTO director (id_user, nickname, description) VALUES
    (3,    'Carlos Ruiz',        'Director contemporáneo'),
    (NULL, 'Herbert von Karajan', 'Director histórico, Berliner Philharmoniker'),
    (NULL, 'Leonard Bernstein',   'Director histórico, New York Philharmonic');

-- ---------------------------------------------------------------------------
-- Intérpretes
-- ---------------------------------------------------------------------------

INSERT INTO artist (id_user, nickname, description) VALUES
    (4,    'Laura Méndez',      'Pianista concertista'),
    (NULL, 'Yo-Yo Ma',          'Violonchelista'),
    (NULL, 'Itzhak Perlman',    'Violinista'),
    (NULL, 'Daniel Barenboim',  'Pianista y director'),
    (NULL, 'Martha Argerich',   'Pianista argentina'),
    (NULL, 'Anne-Sophie Mutter', 'Violinista alemana'),
    (NULL, 'Intérprete anónimo', 'Registro histórico sin identificación');

-- ---------------------------------------------------------------------------
-- Tipos e instrumentos
-- ---------------------------------------------------------------------------

INSERT INTO type_instrument (name, description) VALUES
    ('Cuerda',   'Instrumentos de cuerda frotada o pulsada'),
    ('Tecla',    'Instrumentos de teclado'),
    ('Viento',   'Instrumentos de viento madera y metal');

INSERT INTO instrument (id_type_instrument, name, description) VALUES
    (1, 'Violín',  'Instrumento de cuerda agudo'),
    (1, 'Violonchelo', 'Instrumento de cuerda grave'),
    (2, 'Piano',   'Instrumento de teclado'),
    (3, 'Flauta',  'Instrumento de viento madera');

-- ---------------------------------------------------------------------------
-- Interpretaciones
-- ---------------------------------------------------------------------------

-- 1) Individual reciente: piano solo, Mozart K. 467
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (1, 2, 1, '2024-03-15');

INSERT INTO interpretation_artist (id_artist, id_instrument, id_interpretation) VALUES
    (1, 3, 1);  -- Laura Méndez, piano

-- 2) Duo reciente: violín + violonchelo, Bach Suite (misma obra, otra interpretación)
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (2, 3, 1, '2024-05-20');

INSERT INTO interpretation_artist (id_artist, id_instrument, id_interpretation) VALUES
    (3, 1, 2),  -- Perlman, violín
    (2, 2, 2);  -- Yo-Yo Ma, violonchelo

-- 3) Sinfónica reciente: Beethoven 9 (muestra parcial de la plantilla)
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (7, 1, 2, '2023-11-10');

INSERT INTO interpretation_artist (id_artist, id_instrument, id_interpretation) VALUES
    (3, 1, 3),
    (6, 1, 3),
    (2, 2, 3),
    (1, 3, 3),
    (5, 3, 3);

-- 4) Misma obra, otro director: Beethoven 9 dirigida por Bernstein
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (7, 1, 3, '2022-09-01');

INSERT INTO interpretation_artist (id_artist, id_instrument, id_interpretation) VALUES
    (3, 1, 4),
    (5, 3, 4);

-- 5) Histórica incompleta: sin director, sin artistas, sin tipo definido
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (NULL, 3, NULL, '2025-01-10');

-- 6) Histórica con tipo pero sin director ni artistas
INSERT INTO interpretation (id_type_interpretation, id_work, id_director, load_file_date) VALUES
    (8, 1, NULL, '2025-01-10');

COMMIT;

-- ---------------------------------------------------------------------------
-- Resumen
-- ---------------------------------------------------------------------------

SELECT 'user_app'               AS tabla, COUNT(*) AS registros FROM user_app
UNION ALL SELECT 'composer',              COUNT(*) FROM composer
UNION ALL SELECT 'work',                  COUNT(*) FROM work
UNION ALL SELECT 'composition',           COUNT(*) FROM composition
UNION ALL SELECT 'genre',                 COUNT(*) FROM genre
UNION ALL SELECT 'work_genre',            COUNT(*) FROM work_genre
UNION ALL SELECT 'director',              COUNT(*) FROM director
UNION ALL SELECT 'artist',                COUNT(*) FROM artist
UNION ALL SELECT 'type_instrument',       COUNT(*) FROM type_instrument
UNION ALL SELECT 'instrument',            COUNT(*) FROM instrument
UNION ALL SELECT 'type_interpretation',   COUNT(*) FROM type_interpretation
UNION ALL SELECT 'interpretation',        COUNT(*) FROM interpretation
UNION ALL SELECT 'interpretation_artist', COUNT(*) FROM interpretation_artist
ORDER BY tabla;
