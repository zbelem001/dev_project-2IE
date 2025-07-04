-- Script pour modifier la table Livres pour gérer les exemplaires
-- À exécuter dans votre base de données MySQL

-- 1. Ajouter les nouvelles colonnes pour les exemplaires (seulement si elles n'existent pas)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND COLUMN_NAME = 'total_copies') = 0,
    'ALTER TABLE Livres ADD COLUMN total_copies INT DEFAULT 1 AFTER rating',
    'SELECT "Column total_copies already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND COLUMN_NAME = 'available_copies') = 0,
    'ALTER TABLE Livres ADD COLUMN available_copies INT DEFAULT 1 AFTER total_copies',
    'SELECT "Column available_copies already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Mettre à jour les données existantes
-- Si un livre était marqué comme disponible (available = 1), il aura 1 exemplaire disponible
-- Si un livre était marqué comme indisponible (available = 0), il aura 0 exemplaire disponible
UPDATE Livres SET 
total_copies = 1,
available_copies = CASE WHEN available = 1 THEN 1 ELSE 0 END
WHERE total_copies IS NULL OR available_copies IS NULL;

-- 3. Supprimer l'ancienne colonne available (optionnel, vous pouvez la garder pour compatibilité)
-- ALTER TABLE Livres DROP COLUMN available;

-- 4. Ajouter des contraintes pour s'assurer que available_copies <= total_copies (seulement si elle n'existe pas)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND CONSTRAINT_NAME = 'chk_copies') = 0,
    'ALTER TABLE Livres ADD CONSTRAINT chk_copies CHECK (available_copies >= 0 AND available_copies <= total_copies)',
    'SELECT "Constraint chk_copies already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Créer un index pour optimiser les requêtes sur les exemplaires disponibles (seulement s'il n'existe pas)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND INDEX_NAME = 'idx_available_copies') = 0,
    'CREATE INDEX idx_available_copies ON Livres(available_copies)',
    'SELECT "Index idx_available_copies already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Mettre à jour les livres existants avec des valeurs plus réalistes (optionnel)
-- Vous pouvez ajuster ces valeurs selon vos besoins
UPDATE Livres SET 
total_copies = 3,
available_copies = 2
WHERE book_id IN (1, 2, 3); -- Exemple pour les premiers livres 

ALTER TABLE Emprunts ADD COLUMN date_retour DATETIME DEFAULT NULL;

DELETE FROM Emprunts;
DELETE FROM Returns;
DELETE FROM Livres;
DELETE FROM utilisateurs;


     SELECT * FROM Livres ORDER BY book_id DESC LIMIT 5;

      DESCRIBE Returns;