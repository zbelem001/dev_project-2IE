const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');
const bodyParser = require("body-parser");

const verifyToken = require('./middleware/verifyToken');
const addNewUser = require('./middleware/addNewUser');
const userLoginCheck = require('./middleware/userLoginCheck');
const welcome = require('./middleware/welcome');
const Utilisateur = require('./middleware/Data/Utilisateur');
const Dashboard = require('./middleware/Data/Dashboard');
const Livre = require('./middleware/Data/Livre');
const Etudiant = require('./middleware/Data/Etudiant');
const Stats = require('./middleware/Data/Stats');

const port = process.env.PORT || 4400;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', welcome);
app.post('/signup', addNewUser);
app.post('/userlogin', userLoginCheck);

const apiRoutes = express.Router();
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());
apiRoutes.use(verifyToken);
apiRoutes.get('/Utilisateur', Utilisateur);
apiRoutes.get('/profile', Utilisateur);
apiRoutes.get('/dashboard', Dashboard);
apiRoutes.get('/livres', Livre.getAllLivres[0], Livre.getAllLivres[1]);
apiRoutes.get('/livres/:id', Livre.getLivreById[0], Livre.getLivreById[1]);
apiRoutes.post('/livres', Livre.addLivre[0], Livre.addLivre[1]);
apiRoutes.put('/livres/:id', Livre.updateLivre[0], Livre.updateLivre[1]);
apiRoutes.delete('/livres/:id', Livre.deleteLivre[0], Livre.deleteLivre[1]);
apiRoutes.get('/etudiants', Etudiant.getAllEtudiants);
apiRoutes.post('/etudiants', Etudiant.addEtudiant);
apiRoutes.put('/etudiants/:id', Etudiant.updateEtudiant);
apiRoutes.delete('/etudiants/:id', Etudiant.deleteEtudiant);
apiRoutes.get('/livres-populaires', Livre.getMostBorrowed[0]);
apiRoutes.post('/emprunter', Livre.borrowBook);
apiRoutes.post('/rendre', Livre.returnBook);
apiRoutes.get('/mes-emprunts', Livre.getUserActiveBorrowings);
apiRoutes.get('/stats', Stats);


app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log('Démarrage et écoute sur le port ' + port);
});