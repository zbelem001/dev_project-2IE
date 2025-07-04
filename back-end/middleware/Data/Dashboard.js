const db = require("../../database");

module.exports = async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token (déjà vérifié par le middleware verifyToken)
    const userId = req.user.user_id;

    // Récupérer les informations de base de l'utilisateur
    const [userRows] = await db.query("SELECT id, nom, prenom, email, telephone, date_creation, role, useractive FROM utilisateurs WHERE id = ? AND useractive = 1", [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({"Error": true, "Message": "Utilisateur non trouvé"});
    }

    const user = userRows[0];

    // Récupérer les livres empruntés (actifs)
    const [borrowedRows] = await db.query(`
      SELECT l.book_id AS id, l.title, l.author, l.rating, l.cover, e.borrow_date AS borrowDate, e.due_date AS dueDate
      FROM Emprunts e
      JOIN Livres l ON e.book_id = l.book_id
      WHERE e.user_id = ? AND e.date_retour IS NULL
    `, [userId]);

    // Récupérer les 10 derniers événements (emprunts, retours et ajouts de livres)
    const [historyRows] = await db.query(`
      SELECT 
        l.book_id AS id, 
        l.title, 
        l.author, 
        r.rating_given AS ratingGiven, 
        e.borrow_date AS borrowDate, 
        r.return_date AS returnDate,
        'emprunt' AS event_type,
        e.borrow_date AS event_date
      FROM Emprunts e
      JOIN Livres l ON e.book_id = l.book_id
      LEFT JOIN Returns r ON e.user_id = r.user_id AND e.book_id = r.book_id AND e.borrow_date = r.borrow_date
      WHERE e.user_id = ?
      
      UNION ALL
      
      SELECT 
        l.book_id AS id, 
        l.title, 
        l.author, 
        r.rating_given AS ratingGiven, 
        r.borrow_date AS borrowDate, 
        r.return_date AS returnDate,
        'retour' AS event_type,
        r.return_date AS event_date
      FROM Returns r
      JOIN Livres l ON r.book_id = l.book_id
      WHERE r.user_id = ?
      
      UNION ALL
      
      SELECT 
        l.book_id AS id, 
        l.title, 
        l.author, 
        NULL AS ratingGiven, 
        NULL AS borrowDate, 
        NULL AS returnDate,
        'ajout' AS event_type,
        l.created_at AS event_date
      FROM Livres l
      WHERE l.created_at IS NOT NULL
      
      ORDER BY event_date DESC
      LIMIT 10
    `, [userId, userId]);

    const dashboardData = {
      Error: false,
      user: {
        id: user.id,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email,
        telephone: user.telephone || '',
        date_creation: user.date_creation,
        nom_complet: `${user.nom || ''} ${user.prenom || ''}`.trim(),
        role: user.role,
        useractive: user.useractive,
      },
      borrowedBooks: borrowedRows,
      borrowingHistory: historyRows
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({"Error": true, "Message": "Erreur serveur"});
  }
}; 