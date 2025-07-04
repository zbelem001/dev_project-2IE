const bcrypt = require("bcrypt");
const db = require("../database");

const addNewUser = async (req, res, next) => {
  try {
    // Validation des données
    const { nom, prenom, email, password, telephone } = req.body;

    if (!nom || nom.length > 100) {
      return res.json({ Error: true, Message: "Le nom est requis et ne doit pas dépasser 100 caractères" });
    }
    if (!prenom || prenom.length > 100) {
      return res.json({ Error: true, Message: "Le prénom est requis et ne doit pas dépasser 100 caractères" });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email) || email.length > 255) {
      return res.json({ Error: true, Message: "L'email est requis, doit être valide et ne pas dépasser 255 caractères" });
    }
    if (!password || password.length < 6 || password.length > 255) {
      return res.json({ Error: true, Message: "Le mot de passe est requis, doit avoir au moins 6 caractères et ne pas dépasser 255 caractères" });
    }
    if (telephone && (telephone.length > 20 || !/^\+?[0-9\s-]+$/.test(telephone))) {
      return res.json({ Error: true, Message: "Le numéro de téléphone doit être valide et ne pas dépasser 20 caractères" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const post = {
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone: telephone || null, // Gérer le champ facultatif
      useractive: 1, // Utilisateur actif par défaut
    };

    console.log(post);

    // Vérifier si l'email existe déjà
    const [existingUsers] = await db.query("SELECT email FROM utilisateurs WHERE email = ?", [post.email]);

    if (existingUsers.length === 0) {
      // Insérer le nouvel utilisateur
      await db.query("INSERT INTO utilisateurs SET ?", [post]);
      return res.json({ Error: false, Message: "Inscription réussie" });
    } else {
      return res.json({ Error: true, Message: "Cet email est déjà enregistré" });
    }
  } catch (error) {
    console.error("Erreur :", error);
    console.error("Message d'erreur :", error.message);
    console.error("Type d'erreur :", error.name);
    return res.json({ Error: true, Message: "Erreur serveur lors de l'inscription" });
  }
};

module.exports = addNewUser;