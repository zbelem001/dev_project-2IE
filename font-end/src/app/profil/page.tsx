'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Book, User, Save, X, Menu, Edit, Mail, IdCard, Phone } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

// Define User interface for TypeScript
interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_creation?: string;
  useractive?: number;
}

const Profile: React.FC = () => {
  const { user, token, logout, updateUser, refreshUserData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<User>({ nom: '', prenom: '', email: '', telephone: '' });
  const [errors, setErrors] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fonction stable pour récupérer les données
  const fetchUserData = useCallback(async () => {
    if (!token) {
      console.log('Aucun token disponible, redirection vers login');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshUserData, router]);

  // Récupérer les données utilisateur depuis l'API au chargement (une seule fois)
  useEffect(() => {
    if (!hasInitialized && token) {
      setHasInitialized(true);
      fetchUserData();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [hasInitialized, token, fetchUserData]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }
    if (formData.telephone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error on change
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Ici vous pourriez ajouter une API pour mettre à jour le profil
        // Pour l'instant, on met à jour seulement localement
        updateUser(formData);
        setIsEditing(false);
        
        // Rafraîchir les données depuis l'API
        await refreshUserData();
        
        alert('Profil mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour du profil');
      }
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setFormData(user || { nom: '', prenom: '', email: '', telephone: '' }); // Reset form on cancel
      setErrors({});
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour obtenir le nom complet
  const getFullName = () => {
    if (!user) return '';
    return `${user.nom} ${user.prenom}`.trim();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: Impossible de charger les données utilisateur</p>
          <button 
            onClick={() => fetchUserData()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-red-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Bibliothèque</span>
                  <span className="text-xl font-bold text-red-500 ml-1">2iE</span>
                </div>
              </div>

              {/* Navigation Desktop */}
              <nav className="hidden md:flex space-x-8 items-center">
                <Link href="/dashbord" className="text-gray-700 hover:text-red-500 transition-colors font-medium border-b-2 border-transparent hover:border-red-500 pb-1">Tableau de bord</Link>
                <Link href="/catalogue" className="text-gray-700 hover:text-green-500 transition-colors font-medium border-b-2 border-transparent hover:border-green-500 pb-1">Catalogue</Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium hidden lg:inline">{getFullName()}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                      <div className="py-2">
                        <Link
                          href="/profil"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-500 font-medium"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 font-medium"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Menu Mobile */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6 text-red-500" />}
              </button>
            </div>
          </div>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t shadow-lg">
              <div className="px-4 py-4 space-y-3">
                <Link href="/dashbord" className="block py-2 text-gray-700 hover:text-red-500 font-medium">Tableau de bord</Link>
                <Link href="/catalogue" className="block py-2 text-gray-700 hover:text-green-500 font-medium">Catalogue</Link>
                <Link href="/profil" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">Profil</Link>
                <Link href="/catalogue" className="block py-2 text-gray-700 hover:text-green-500 font-medium">Emprunt</Link>
                <Link href="/returns" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">Retour</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-500 font-medium"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="ml-4 text-3xl font-bold text-gray-900">Votre Profil</h1>
                </div>
                <button
                  onClick={toggleEdit}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full hover:from-blue-600 hover:to-green-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
                >
                  {isEditing ? (
                    <>
                      <X className="w-5 h-5 mr-2" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5 mr-2" />
                      Modifier
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="nom"
                          name="nom"
                          type="text"
                          value={formData.nom}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          placeholder="Entrez votre nom"
                        />
                      </div>
                      {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                    </div>
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="prenom"
                          name="prenom"
                          type="text"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          placeholder="Entrez votre prénom"
                        />
                      </div>
                      {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Entrez votre email"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone (optionnel)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone || ''}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Ex: +226 25 49 28 00"
                      />
                    </div>
                    {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 font-medium">Nom</p>
                    <p className="text-lg text-gray-900">{user?.nom}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Prénom</p>
                    <p className="text-lg text-gray-900">{user?.prenom}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-lg text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Téléphone</p>
                    <p className="text-lg text-gray-900">{user?.telephone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Date de création du compte</p>
                    <p className="text-lg text-gray-900">{formatDate(user?.date_creation)}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-12 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Bibliothèque </span>
                    <span className="text-xl font-bold text-red-400">2iE</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  L'innovation au service de l'éducation. Votre plateforme de gestion de bibliothèque universitaire moderne et intuitive.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-6 text-red-400">Navigation</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="/dashbord" className="hover:text-white transition-colors hover:text-red-400">Tableau de bord</Link></li>
                  <li><Link href="/catalogue" className="hover:text-white transition-colors hover:text-green-400">Catalogue</Link></li>
                  <li><Link href="/profil" className="hover:text-white transition-colors hover:text-blue-400">Profil</Link></li>
                  <li><Link href="/help" className="hover:text-white transition-colors hover:text-yellow-400">Aide</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-6 text-green-400">Services</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Emprunts</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Réservations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Recherche avancée</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Recommandations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-6 text-blue-400">Contact</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>Email: bibliotheque@2ie-edu.org</li>
                  <li>Tél: +226 25 49 28 00</li>
                  <li>Adresse: 01 BP 594</li>
                  <li>Ouagadougou 01, Burkina Faso</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>© 2025 Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE). Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;