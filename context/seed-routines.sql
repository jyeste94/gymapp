-- ============================================================
-- RUTINAS POR DEFECTO
-- ============================================================
-- Ejecutar en la BD de NutriFlow (MySQL)
-- NOTA: Si algún nombre de ejercicio no coincide exactamente con
-- los datos scrapeados, el INSERT fallará para ese ejercicio.
-- Revisa primero los nombres en la tabla `exercises`:
--   SELECT DISTINCT name FROM exercises ORDER BY name;
-- ============================================================

-- -----------------------------------------------------------
-- RUTINA 4 DÍAS: Estética y Fuerza
-- -----------------------------------------------------------
INSERT INTO routines (id, user_id, name, days_of_week)
SELECT '00000000-0000-0000-0000-000000000001', id, 'Estética y Fuerza (4 Días)',
       '["1","athlos-json:%7B%22id%22%3A%22dia1%22%2C%22title%22%3A%22Empuje%20A%20-%20Pecho%20y%20Tr%C3%ADceps%22%2C%22focus%22%3A%22Pecho%2C%20Hombro%2C%20Triceps%22%2C%22count%22%3A7%7D","athlos-json:%7B%22id%22%3A%22dia2%22%2C%22title%22%3A%22Tir%C3%B3n%20A%20-%20Espalda%20y%20B%C3%ADceps%22%2C%22focus%22%3A%22Espalda%2C%20Femoral%2C%20Biceps%22%2C%22count%22%3A6%7D","athlos-json:%7B%22id%22%3A%22dia3%22%2C%22title%22%3A%22Empuje%20B%20-%20Hombro%20y%20Pecho%20Superior%22%2C%22focus%22%3A%22Pierna%2C%20Pecho%2C%20Hombro%22%2C%22count%22%3A7%7D","athlos-json:%7B%22id%22%3A%22dia4%22%2C%22title%22%3A%22Tir%C3%B3n%20B%20-%20Detalle%20Espalda%20y%20Brazo%22%2C%22focus%22%3A%22Espalda%2C%20Gluteo%2C%20Biceps%2C%20Triceps%22%2C%22count%22%3A7%7D"]'
FROM users ORDER BY created_at ASC LIMIT 1;
SET @routine4d = '00000000-0000-0000-0000-000000000001';

-- Día 1: Empuje A
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 4, 8, 120, 0 FROM exercises e WHERE e.name LIKE '%Press%Bench%' OR e.name LIKE '%Press banca%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 90, 1 FROM exercises e WHERE e.name LIKE '%Press militar%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 90, 2 FROM exercises e WHERE e.name LIKE '%Fondos%' OR e.name LIKE '%Dips%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 15, 60, 3 FROM exercises e WHERE (e.name LIKE '%Aperturas%' OR e.name LIKE '%Peck%' OR e.name LIKE '%Fly%') AND (e.name LIKE '%Polea%' OR e.name LIKE '%Cable%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 4, 15, 60, 4 FROM exercises e WHERE e.name LIKE '%Elevaciones laterales%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 15, 60, 5 FROM exercises e WHERE (e.name LIKE '%Tr%C3%ADceps%' OR e.name LIKE '%Triceps%') AND e.name LIKE '%Polea%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 60, 6 FROM exercises e WHERE e.name LIKE '%Plancha%' OR e.name LIKE '%Plank%' OR e.name LIKE '%Ab wheel%' LIMIT 1;

-- Día 2: Tirón A
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 5, 150, 0 FROM exercises e WHERE e.name LIKE '%Peso muerto%' AND e.name NOT LIKE '%Rumano%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 4, 8, 120, 1 FROM exercises e WHERE e.name LIKE '%Dominadas%' OR e.name LIKE '%Pull%-%up%' OR e.name LIKE '%Chin%-%up%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 2 FROM exercises e WHERE e.name LIKE '%Remo%' AND e.name LIKE '%Barra%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 15, 60, 3 FROM exercises e WHERE e.name LIKE '%P%C3%A1jaros%' OR e.name LIKE '%Reverse%fly%' OR (e.name LIKE '%Elevaciones%' AND e.name LIKE '%posterior%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 4 FROM exercises e WHERE e.name LIKE '%Curl%' AND e.name LIKE '%Barra%' AND (e.name LIKE '%B%C3%ADceps%' OR e.name LIKE '%Biceps%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 60, 5 FROM exercises e WHERE e.name LIKE '%Curl%martillo%' OR e.name LIKE '%Hammer%curl%' LIMIT 1;

-- Día 3: Empuje B
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 120, 0 FROM exercises e WHERE (e.name LIKE '%Sentadilla%fronta%' OR e.name LIKE '%Front%squat%' OR e.name LIKE '%Hack%squat%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 90, 1 FROM exercises e WHERE e.name LIKE '%Bulgarian%' OR e.name LIKE '%Split%squat%' OR e.name LIKE '%Sentadilla%b%C3%BAlgara%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 2 FROM exercises e WHERE e.name LIKE '%Press%inclinado%' AND (e.name LIKE '%Mancuerna%' OR e.name LIKE '%Dumbbell%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 3 FROM exercises e WHERE e.name LIKE '%Press%Arnold%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 60, 4 FROM exercises e WHERE e.name LIKE '%Press%franc%C3%A9s%' OR e.name LIKE '%Skull%crusher%' OR (e.name LIKE '%Flexiones%' AND e.name LIKE '%Diamante%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 4, 20, 60, 5 FROM exercises e WHERE e.name LIKE '%Elevaciones laterales%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 15, 60, 6 FROM exercises e WHERE e.name LIKE '%Ab%wheel%' OR e.name LIKE '%Rueda%abdominal%' OR e.name LIKE '%Ab%roller%' LIMIT 1;

-- Día 4: Tirón B
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 0 FROM exercises e WHERE e.name LIKE '%Peso muerto%rumano%' OR e.name LIKE '%Romanian%deadlift%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 1 FROM exercises e WHERE (e.name LIKE '%Jal%C3%B3n%' OR e.name LIKE '%Lat%pulldown%' OR e.name LIKE '%Pull%-%down%') AND (e.name LIKE '%pecho%' OR e.name LIKE '%ancho%' OR e.name LIKE '%wide%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 90, 2 FROM exercises e WHERE e.name LIKE '%Remo%una%mano%' OR e.name LIKE '%Remo%mancuerna%' OR e.name LIKE '%Dumbbell%row%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 90, 3 FROM exercises e WHERE e.name LIKE '%Hip%thrust%' OR e.name LIKE '%Puente%gl%C3%BAteo%' OR e.name LIKE '%Glute%bridge%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 60, 4 FROM exercises e WHERE e.name LIKE '%Curl%inclinado%' OR (e.name LIKE '%Curl%' AND e.name LIKE '%B%C3%ADceps%' AND e.name LIKE '%mancuerna%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 12, 60, 5 FROM exercises e WHERE (e.name LIKE '%Extensi%C3%B3n%tr%C3%ADceps%' OR e.name LIKE '%Triceps%extension%' OR e.name LIKE '%Overhead%triceps%') AND e.name LIKE '%nuca%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine4d, e.id, 3, 10, 60, 6 FROM exercises e WHERE (e.name LIKE '%Hanging%leg%raise%' OR e.name LIKE '%Elevaci%C3%B3n%piernas%' OR e.name LIKE '%Leg%raise%') AND e.name NOT LIKE '%side%' LIMIT 1;


-- -----------------------------------------------------------
-- RUTINA 3 DÍAS: Push / Pull / Legs
-- -----------------------------------------------------------
INSERT INTO routines (id, user_id, name, days_of_week)
SELECT '00000000-0000-0000-0000-000000000002', id, 'Push / Pull / Legs (3 Días)',
       '["1","athlos-json:%7B%22id%22%3A%22dia1%22%2C%22title%22%3A%22Push%22%2C%22focus%22%3A%22Pecho%2C%20Hombro%2C%20Triceps%22%2C%22count%22%3A6%7D","athlos-json:%7B%22id%22%3A%22dia2%22%2C%22title%22%3A%22Pull%22%2C%22focus%22%3A%22Espalda%2C%20Biceps%22%2C%22count%22%3A6%7D","athlos-json:%7B%22id%22%3A%22dia3%22%2C%22title%22%3A%22Legs%22%2C%22focus%22%3A%22Pierna%22%2C%22count%22%3A6%7D"]'
FROM users ORDER BY created_at ASC LIMIT 1;
SET @routine3d = '00000000-0000-0000-0000-000000000002';

-- Día 1: Push
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 4, 8, 120, 0 FROM exercises e WHERE e.name LIKE '%Press%Bench%' OR e.name LIKE '%Press banca%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 10, 90, 1 FROM exercises e WHERE e.name LIKE '%Press militar%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 90, 2 FROM exercises e WHERE e.name LIKE '%Press%inclinado%' AND (e.name LIKE '%Mancuerna%' OR e.name LIKE '%Dumbbell%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 10, 90, 3 FROM exercises e WHERE e.name LIKE '%Fondos%' OR e.name LIKE '%Dips%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 4, 20, 60, 4 FROM exercises e WHERE e.name LIKE '%Elevaciones laterales%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 15, 60, 5 FROM exercises e WHERE (e.name LIKE '%Tr%C3%ADceps%' OR e.name LIKE '%Triceps%') AND e.name LIKE '%Polea%' LIMIT 1;

-- Día 2: Pull
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 5, 150, 0 FROM exercises e WHERE e.name LIKE '%Peso muerto%' AND e.name NOT LIKE '%Rumano%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 4, 8, 120, 1 FROM exercises e WHERE e.name LIKE '%Dominadas%' OR e.name LIKE '%Pull%-%up%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 90, 2 FROM exercises e WHERE e.name LIKE '%Remo%' AND e.name LIKE '%Barra%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 15, 60, 3 FROM exercises e WHERE e.name LIKE '%P%C3%A1jaros%' OR e.name LIKE '%Reverse%fly%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 90, 4 FROM exercises e WHERE e.name LIKE '%Curl%barra%z%' OR (e.name LIKE '%Curl%' AND e.name LIKE '%Barra%' AND e.name LIKE '%B%C3%ADceps%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 60, 5 FROM exercises e WHERE e.name LIKE '%Curl%martillo%' OR e.name LIKE '%Hammer%curl%' LIMIT 1;

-- Día 3: Legs
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 4, 10, 120, 0 FROM exercises e WHERE (e.name LIKE '%Sentadilla%fronta%' OR e.name LIKE '%Front%squat%' OR e.name LIKE '%Hack%squat%') LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 90, 1 FROM exercises e WHERE e.name LIKE '%Peso muerto%rumano%' OR e.name LIKE '%Romanian%deadlift%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 15, 90, 2 FROM exercises e WHERE e.name LIKE '%Prensa%' OR e.name LIKE '%Leg%press%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 10, 90, 3 FROM exercises e WHERE e.name LIKE '%Bulgarian%' OR e.name LIKE '%Split%squat%' OR e.name LIKE '%Sentadilla%b%C3%BAlgara%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 3, 12, 90, 4 FROM exercises e WHERE e.name LIKE '%Hip%thrust%' OR e.name LIKE '%Puente%gl%C3%BAteo%' OR e.name LIKE '%Glute%bridge%' LIMIT 1;
INSERT INTO routine_exercises (id, routine_id, exercise_id, sets, reps, rest_seconds, order_index)
SELECT UUID(), @routine3d, e.id, 4, 15, 60, 5 FROM exercises e WHERE e.name LIKE '%Gemelos%' OR e.name LIKE '%Calf%raise%' OR e.name LIKE '%Pantorrilla%' LIMIT 1;
