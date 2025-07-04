const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../database");

const userLoginCheck = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ Error: true, Message: "L'email est requis et doit être valide" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ Error: true, Message: "Le mot de passe est requis et doit contenir au moins 6 caractères" });
    }

    // Vérifier l'utilisateur
    const [rows] = await db.query("SELECT * FROM utilisateurs WHERE email = ? AND useractive = 1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ Error: true, Message: "Email ou mot de passe incorrect. Si vous n'avez pas de compte, veuillez en créer un." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ Error: true, Message: "Email ou mot de passe incorrect" });
    }

    const tokenPayload = { user_id: user.id, email: user.email };
    const token = jwt.sign(tokenPayload, config.secret);

    // Pour l'instant, on ne stocke pas le token dans une table séparée
    // car la table access_token n'existe pas encore
    const defaultCover = "https://cdn-icons-png.flaticon.com/512/29/29302.png";
    const coverUrl = user.cover || defaultCover;

    return res.json({
      Error: false,
      Message: "Connexion réussie",
      currUser: user.id,
      email: user.email,
      nom: user.nom || '',
      prenom: user.prenom || '',
      telephone: user.telephone || '',
      date_creation: user.date_creation,
      role: user.role,
      token: token,
      cover: coverUrl,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).json({ Error: true, Message: "Erreur serveur lors de la connexion" });
  }
};

module.exports = userLoginCheck;