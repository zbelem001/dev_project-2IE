const db = require('../../database');

// Lister tous les étudiants
exports.getAllEtudiants = async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, nom, prenom, email, telephone, date_creation, useractive, role FROM utilisateurs');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Ajouter un étudiant
exports.addEtudiant = async (req, res) => {
  const { nom, prenom, email, password, telephone, useractive } = req.body;
  try {
    const [result] = await db.query('INSERT INTO utilisateurs (nom, prenom, email, password, telephone, useractive) VALUES (?, ?, ?, ?, ?, ?)', [nom, prenom, email, password, telephone, useractive]);
    res.status(201).json({ id: result.insertId, nom, prenom, email, telephone, useractive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Modifier un étudiant
exports.updateEtudiant = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, password, telephone, useractive } = req.body;
  try {
    const [result] = await db.query('UPDATE utilisateurs SET nom=?, prenom=?, email=?, password=?, telephone=?, useractive=? WHERE id=?', [nom, prenom, email, password, telephone, useractive, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }
    res.json({ id, nom, prenom, email, telephone, useractive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un étudiant
exports.deleteEtudiant = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM utilisateurs WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }
    res.json({ message: 'Étudiant supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}; 