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

    // Récupérer l'historique des emprunts
    const [historyRows] = await db.query(`
      SELECT l.book_id AS id, l.title, l.author, l.rating AS ratingGiven, e.borrow_date AS borrowDate, e.date_retour AS returnDate
      FROM Emprunts e
      JOIN Livres l ON e.book_id = l.book_id
      WHERE e.user_id = ?
      ORDER BY e.borrow_date DESC
    `, [userId]);

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