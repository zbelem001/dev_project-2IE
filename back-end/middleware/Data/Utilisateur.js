const db = require("../../database");

module.exports = async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token (déjà vérifié par le middleware verifyToken)
    const userId = req.user.user_id;

    const [rows] = await db.query("SELECT id, nom, prenom, email, telephone, date_creation, useractive, role FROM utilisateurs WHERE id = ? AND useractive = 1", [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({"Error": true, "Message": "Utilisateur non trouvé"});
    }
    
    const user = rows[0];
    res.json({
      Error: false,
      user: {
        id: user.id,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email,
        telephone: user.telephone || '',
        date_creation: user.date_creation,
        useractive: user.useractive,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({"Error": true, "Message": "Erreur serveur"});
  }
};