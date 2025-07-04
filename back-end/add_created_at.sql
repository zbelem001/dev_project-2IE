-- Script pour ajouter la colonne created_at à la table Livres
-- À exécuter dans votre base de données MySQL

-- Ajouter la colonne created_at si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE Livres ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "Column created_at already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mettre à jour les livres existants avec la date actuelle
UPDATE Livres SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL; 


-- Script pour ajouter la colonne created_at à la table Livres
-- À exécuter dans votre base de données MySQL

-- Ajouter la colonne created_at si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'db_biblio' 
     AND TABLE_NAME = 'Livres' 
     AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE Livres ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "Column created_at already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mettre à jour les livres existants avec la date actuelle
UPDATE Livres SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL; 