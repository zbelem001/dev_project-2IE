const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ Error: true, Message: 'Aucun token fourni' });
    }

    jwt.verify(token, config.secret, function (err, decoded) {
      if (err) {
        console.error('Erreur JWT:', err);
        return res.status(401).json({ Error: true, Message: 'Token invalide ou expiré' });
      }
      req.user = decoded; // Stocker les données décodées dans req.user
      next();
    });
  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({ Error: true, Message: 'Erreur serveur lors de la vérification du token' });
  }
};

module.exports = verifyToken;