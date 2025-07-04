const welcome = (req, res) => {
  res.json({
    message: "Bienvenue sur l'API de la Bibliothèque 2iE",
    version: "1.0.0",
    status: "En ligne",
    endpoints: {
      login: "POST /userlogin",
      signup: "POST /signup",
      profile: "GET /api/profile",
      dashboard: "GET /api/dashboard"
    }
  });
};

module.exports = welcome; 