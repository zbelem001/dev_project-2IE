const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateAdmin = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ Error: true, Message: 'Aucun token fourni' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, config.secret);
    
    // Vérifier si l'utilisateur est admin (ajuster selon ta logique d'admin)
    // Pour l'instant, on accepte tous les utilisateurs authentifiés
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur authenticateAdmin:', error);
    return res.status(401).json({ Error: true, Message: 'Token invalide ou expiré' });
  }
};

module.exports = authenticateAdmin; 