'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react';

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password2: '',
    telephone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validation en temps réel de la correspondance des mots de passe
  useEffect(() => {
    if (formData.password2) {
      if (formData.password2 !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          password2: 'Les mots de passe ne correspondent pas',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password2: '',
        }));
      }
    }
  }, [formData.password, formData.password2]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length > 100) {
      newErrors.nom = 'Le nom ne doit pas dépasser 100 caractères';
    }

    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (formData.prenom.length > 100) {
      newErrors.prenom = 'Le prénom ne doit pas dépasser 100 caractères';
    }

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    } else if (formData.email.length > 255) {
      newErrors.email = "L'email ne doit pas dépasser 255 caractères";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (formData.password.length > 255) {
      newErrors.password = 'Le mot de passe ne doit pas dépasser 255 caractères';
    }

    if (formData.telephone && (formData.telephone.length > 20 || !/^\+?[0-9\s-]+$/.test(formData.telephone))) {
      newErrors.telephone = 'Veuillez entrer un numéro de téléphone valide (max 20 caractères)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4400/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.Error) {
        setErrors({ general: result.Message });
      } else {
        alert('Inscription réussie ! Redirection vers la page de connexion...');
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setErrors({ general: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Inscription
          </h2>
          <p className="text-gray-600">
            Créez votre compte pour accéder à la bibliothèque
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
          <div className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre nom"
                />
              </div>
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.prenom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre prénom"
                />
              </div>
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
              )}
            </div>

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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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

              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="password2"
                  name="password2"
                  type={showPassword2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password2}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.password2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirmer votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-600">{errors.password2}</p>
              )}
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone (facultatif)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+226 1234 5678"
                />
              </div>
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-600 text-center">{errors.general}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Inscription en cours...
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            En vous inscrivant, vous acceptez nos{' '}
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

export default RegisterPage;