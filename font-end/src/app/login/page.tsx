'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';

async function fetchStats() {
  const res = await fetch('/api/statistiques');
  if (!res.ok) throw new Error('Erreur API: ' + await res.text());
  return res.json();
}

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "L&apos;email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (formData.password.length > 255) {
      newErrors.password = 'Le mot de passe ne doit pas dépasser 255 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:4400/userlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (!result.Error) {
        // Utiliser le contexte d'authentification pour stocker les données
        const userData = {
          id: result.currUser,
          nom: result.nom || '',
          prenom: result.prenom || '',
          email: result.email,
          telephone: result.telephone || '',
          date_creation: result.date_creation,
          role: result.role // si le back le fournit
        };
        
        login(userData, result.token);
        
        alert('Connexion réussie ! Redirection...');
        // Redirection selon le rôle de l'utilisateur
        if (result.role && result.role.trim().toLowerCase() === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashbord');
        }
      } else {
        setErrors({ general: result.Message });
      }
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrors({ general: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await fetchStats();
      } catch (error: any) {
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour à l'accueil
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Book className="w-12 h-12 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">Bibliothèque 2iE</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-600">Accédez à votre compte pour gérer vos emprunts</p>
        </div>

        {/* Accès admin */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-2 text-sm">
          <strong>Accès admin de démonstration :</strong><br />
          Email : <span className="font-mono">admin@gmail.com</span><br />
          Mot de passe : <span className="font-mono">admin1</span>
        </div>
        {/* Accès utilisateur */}
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded mb-4 text-sm">
          <strong>Accès utilisateur de démonstration :</strong><br />
          Email : <span className="font-mono">z.belem001@gmail.com</span><br />
          Mot de passe : <span className="font-mono">13135690</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {errors.general && <p className="text-sm text-red-600 text-center">{errors.general}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 hover:scale-105 hover:rotate-1 hover:shadow-xl hover:-translate-y-1 hover:border-2 hover:border-red-300'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/newUsers" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              politique de confidentialité
            </a>
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Besoin d'aide ?</strong>
          </p>
          <p className="text-sm text-yellow-700">
            Contactez le support à{' '}
            <a href="mailto:support@2ie-edu.org" className="underline text-blue-600 hover:text-blue-500">
              support@2ie-edu.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;