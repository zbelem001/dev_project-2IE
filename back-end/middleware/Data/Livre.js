const db = require('../../database');

// Middleware d'authentification (supposé défini ailleurs)
const verifyToken = require('../verifyToken');

// Définir l'URL de l'icône par défaut
const DEFAULT_COVER = "https://cdn-icons-png.flaticon.com/512/29/29302.png";

// Lister tous les livres
exports.getAllLivres = [verifyToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Livres');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
  }
}];

// Obtenir un livre par ID
exports.getLivreById = [verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM Livres WHERE book_id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du livre' });
  }
}];

// Ajouter un livre
exports.addLivre = [verifyToken, async (req, res) => {
  const { title, author, category, rating, total_copies, cover } = req.body;
  if (!title || !author || !category || typeof rating !== 'number' || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Données invalides : titre, auteur, catégorie requis, et note entre 0 et 5' });
  }
  // Validation des exemplaires
  const total = total_copies || 1;
  const available = total; // Toujours initialisé à total_copies
  if (total < 0) {
    return res.status(400).json({ error: 'Nombre d\'exemplaires invalide' });
  }
  // Utiliser l'icône fixe si aucun cover fourni
  const coverUrl = cover || DEFAULT_COVER;
  try {
    const [result] = await db.query(
      'INSERT INTO Livres (title, author, category, rating, total_copies, available_copies, cover) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, category, rating, total, available, coverUrl]
    );
    const [newLivre] = await db.query('SELECT * FROM Livres WHERE book_id = ?', [result.insertId]);
    res.status(201).json(newLivre[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du livre' });
  }
}];

// Modifier un livre
exports.updateLivre = [verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, author, category, rating, total_copies, cover } = req.body;
  if (!title || !author || !category || typeof rating !== 'number' || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Données invalides : titre, auteur, catégorie requis, et note entre 0 et 5' });
  }
  // Validation du nombre total d'exemplaires
  const total = total_copies || 1;
  if (total < 0) {
    return res.status(400).json({ error: 'Nombre total d\'exemplaires invalide' });
  }
  // Utiliser l'icône fixe si aucun cover fourni
  const coverUrl = cover || DEFAULT_COVER;
  try {
    // Récupérer le nombre d'exemplaires déjà empruntés
    const [borrowed] = await db.query('SELECT COUNT(*) AS count FROM Emprunts WHERE book_id = ? AND date_retour IS NULL', [id]);
    const empruntes = borrowed[0].count;
    // Le nombre d'exemplaires disponibles = total - empruntés
    let available = total - empruntes;
    if (available < 0) available = 0;
    const [result] = await db.query(
      'UPDATE Livres SET title = ?, author = ?, category = ?, rating = ?, total_copies = ?, available_copies = ?, cover = ? WHERE book_id = ?',
      [title, author, category, rating, total, available, coverUrl, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    const [updatedLivre] = await db.query('SELECT * FROM Livres WHERE book_id = ?', [id]);
    res.json(updatedLivre[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du livre' });
  }
}];

// Supprimer un livre
exports.deleteLivre = [verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si le livre est emprunté
    const [borrowings] = await db.query('SELECT * FROM Emprunts WHERE book_id = ? AND date_retour IS NULL', [id]);
    if (borrowings.length > 0) {
      return res.status(400).json({ error: 'Ce livre est actuellement emprunté et ne peut pas être supprimé' });
    }
    const [result] = await db.query('DELETE FROM Livres WHERE book_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du livre' });
  }
}];

// Endpoint pour les livres les plus empruntés
exports.getMostBorrowed = [verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT l.*, COUNT(e.borrowing_id) AS borrow_count
      FROM Livres l
      LEFT JOIN Emprunts e ON l.book_id = e.book_id
      GROUP BY l.book_id
      ORDER BY borrow_count DESC
      LIMIT 8
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des livres populaires' });
  }
}];

// Emprunter un livre (par utilisateur)
exports.borrowBook = [verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { book_id, due_date } = req.body;

    // Vérifier si l'utilisateur a déjà un emprunt actif pour ce livre
    const [existing] = await db.query(
      'SELECT * FROM Emprunts WHERE user_id = ? AND book_id = ? AND date_retour IS NULL',
      [userId, book_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà emprunté ce livre.' });
    }

    // Vérifier la disponibilité du livre
    const [book] = await db.query('SELECT * FROM Livres WHERE book_id = ?', [book_id]);
    if (book.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    
    if (book[0].available_copies <= 0) {
      return res.status(400).json({ error: 'Aucun exemplaire disponible pour ce livre.' });
    }

    // Gestion de la date de retour personnalisée
    const now = new Date();
    let due;
    if (due_date) {
      due = new Date(due_date);
      // Validation : la date doit être dans le futur et max 30 jours après aujourd'hui
      const minDate = new Date(now);
      minDate.setDate(now.getDate() + 1);
      const maxDate = new Date(now);
      maxDate.setDate(now.getDate() + 30);
      if (isNaN(due.getTime()) || due < minDate || due > maxDate) {
        return res.status(400).json({ error: "Date de retour invalide (doit être comprise entre demain et dans 30 jours)" });
      }
    } else {
      due = new Date(now);
      due.setDate(now.getDate() + 14);
    }
    
    await db.query('START TRANSACTION');
    
    await db.query(
      'INSERT INTO Emprunts (user_id, book_id, borrow_date, due_date, extended) VALUES (?, ?, ?, ?, 0)',
      [userId, book_id, now, due]
    );
    
    await db.query(
      'UPDATE Livres SET available_copies = available_copies - 1 WHERE book_id = ?',
      [book_id]
    );
    
    await db.query('COMMIT');
    
    res.json({ success: true, message: 'Livre emprunté avec succès' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'emprunt du livre' });
  }
}];

// Rendre un livre
exports.returnBook = [verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { book_id } = req.body;
    
    // Trouver l'emprunt actif
    const [emprunts] = await db.query(
      'SELECT * FROM Emprunts WHERE user_id = ? AND book_id = ? AND date_retour IS NULL',
      [userId, book_id]
    );
    if (emprunts.length === 0) {
      return res.status(400).json({ error: 'Aucun emprunt actif trouvé pour ce livre.' });
    }
    
    await db.query('START TRANSACTION');
    
    // Marquer comme rendu
    await db.query(
      'UPDATE Emprunts SET date_retour = ? WHERE borrowing_id = ?',
      [new Date(), emprunts[0].borrowing_id]
    );

    // Insérer dans Returns
    await db.query(
      'INSERT INTO Returns (user_id, book_id, borrow_date, return_date, rating_given) VALUES (?, ?, ?, ?, ?)',
      [userId, book_id, emprunts[0].borrow_date, new Date(), null]
    );
    
    // Incrémenter les exemplaires disponibles
    await db.query(
      'UPDATE Livres SET available_copies = available_copies + 1 WHERE book_id = ?',
      [book_id]
    );
    
    await db.query('COMMIT');
    
    res.json({ success: true, message: 'Livre rendu avec succès' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du retour du livre' });
  }
}];

// Liste des emprunts actifs de l'utilisateur
exports.getUserActiveBorrowings = [verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [results] = await db.query(
      `SELECT * FROM Emprunts WHERE user_id = ? AND date_retour IS NULL`,
      [userId]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des emprunts' });
  }
}];

