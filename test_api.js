// Script de test pour vérifier l'API
const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Test de l\'API...\n');

  // Test 1: Vérifier que le serveur répond
  try {
    console.log('1️⃣ Test de connexion au serveur...');
    const response = await fetch('http://localhost:4400/');
    console.log('✅ Serveur accessible');
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    return;
  }

  // Test 2: Test de connexion (si vous avez un utilisateur de test)
  try {
    console.log('\n2️⃣ Test de connexion...');
    const loginResponse = await fetch('http://localhost:4400/userlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (loginResult.Error) {
      console.log('⚠️ Erreur de connexion (normal si l\'utilisateur n\'existe pas):', loginResult.Message);
    } else {
      console.log('✅ Connexion réussie');
      console.log('Token reçu:', loginResult.token ? 'Oui' : 'Non');
      console.log('Données utilisateur:', loginResult.nom, loginResult.prenom);
      
      // Test 3: Test de l'API protégée avec le token
      if (loginResult.token) {
        console.log('\n3️⃣ Test de l\'API protégée...');
        const profileResponse = await fetch('http://localhost:4400/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
            'Content-Type': 'application/json',
          },
        });

        const profileResult = await profileResponse.json();
        
        if (profileResult.Error) {
          console.log('❌ Erreur API protégée:', profileResult.Message);
        } else {
          console.log('✅ API protégée fonctionne');
          console.log('Données profil:', profileResult.user);
        }
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de connexion:', error.message);
  }

  console.log('\n🏁 Test terminé');
}

testAPI(); 