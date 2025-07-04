const db = require('../../database');

const getStats = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM Livres) AS totalBooks,
        (SELECT COUNT(*) FROM utilisateurs) AS totalStudents,
        (SELECT COUNT(*) FROM Emprunts) AS totalLoans,
        (SELECT COUNT(*) FROM Emprunts WHERE date_retour IS NOT NULL) AS totalReturns,
        (SELECT COUNT(*) FROM Emprunts WHERE date_retour IS NULL AND due_date < NOW()) AS overdueLoans
    `);
    // Ensure results is an array with one object
    if (Array.isArray(results) && results.length > 0) {
      const stats = results[0];
      res.json({
        totalBooks: Number(stats.totalBooks) || 0,
        totalStudents: Number(stats.totalStudents) || 0,
        totalLoans: Number(stats.totalLoans) || 0,
        totalReturns: Number(stats.totalReturns) || 0,
        overdueLoans: Number(stats.overdueLoans) || 0,
      });
    } else {
      throw new Error('Invalid database response');
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Erreur lors du chargement des statistiques',
      details: error.message || 'Unknown error',
    });
  }
};

module.exports = getStats;