'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Book, Calendar, Search, User, Star, ArrowRight, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Interfaces pour les données
interface Book {
  id: number;
  title: string;
  author: string;
  dueDate?: string;
  borrowDate?: string;
  rating?: number;
  cover: string;
}

interface BorrowingHistory {
  id: number;
  title: string;
  author: string;
  borrowDate: string;
  returnDate: string;
  ratingGiven: number;
}

interface DashboardUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_creation: string;
  nom_complet: string;
}

interface DashboardData {
  user: DashboardUser;
  borrowedBooks: Book[];
  borrowingHistory: BorrowingHistory[];
}

const Dashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchBorrowedTerm, setSearchBorrowedTerm] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [returnStates, setReturnStates] = useState<{[key: number]: {loading: boolean, message: string}}>({});

  // Fonction stable pour récupérer les données du dashboard
  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      console.log('Aucun token disponible, redirection vers login');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4400/api/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          logout();
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.Error) {
        setDashboardData(result);
      } else {
        setError(result.Message || 'Erreur lors de la récupération des données');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  // Récupérer les données du dashboard depuis l'API (une seule fois)
  useEffect(() => {
    if (!hasInitialized && token) {
      setHasInitialized(true);
      fetchDashboardData();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [hasInitialized, token, fetchDashboardData]);

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

  const handleSearchBorrowed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBorrowedTerm(e.target.value);
  };

  const filteredBorrowedBooks = dashboardData?.borrowedBooks.filter((book: Book) => {
    const searchLower = searchBorrowedTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  // Fonction pour gérer le retour d'un livre
  const handleReturn = async (bookId: number) => {
    // Initialiser l'état pour ce livre spécifique
    setReturnStates(prev => ({
      ...prev,
      [bookId]: { loading: true, message: "" }
    }));

    try {
      const response = await fetch("http://localhost:4400/api/rendre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setReturnStates(prev => ({
          ...prev,
          [bookId]: { loading: false, message: "Livre rendu avec succès !" }
        }));
        // Rafraîchir les données après un délai pour laisser le temps de voir le message
        setTimeout(() => {
          fetchDashboardData();
          // Nettoyer le message après le rafraîchissement
          setReturnStates(prev => {
            const newState = { ...prev };
            delete newState[bookId];
            return newState;
          });
        }, 2000);
      } else {
        setReturnStates(prev => ({
          ...prev,
          [bookId]: { loading: false, message: data.error || "Erreur lors du retour du livre." }
        }));
      }
    } catch {
      setReturnStates(prev => ({
        ...prev,
        [bookId]: { loading: false, message: "Erreur de connexion au serveur." }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const { user } = dashboardData;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-red-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Bibliothèque</span>
                  <span className="text-xl font-bold text-red-500 ml-1">2iE</span>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8 items-center">
                <Link href="/dashbord" className="text-gray-700 hover:text-red-500 transition-colors font-medium border-b-2 border-red-500 pb-1">Tableau de bord</Link>
                <Link href="/catalogue" className="text-gray-700 hover:text-green-500 transition-colors font-medium border-b-2 border-transparent hover:border-green-500 pb-1">Catalogue</Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium hidden lg:inline">{user.nom_complet}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                      <div className="py-2">
                        <Link href="/profil" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-500 font-medium" onClick={() => setIsProfileMenuOpen(false)}>Profil</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 font-medium">Déconnexion</button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6 text-red-500" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t shadow-lg">
              <div className="px-4 py-4 space-y-3">
                <Link href="/dashbord" className="block py-2 text-gray-700 hover:text-red-500 font-medium">Tableau de bord</Link>
                <Link href="/catalogue" className="block py-2 text-gray-700 hover:text-green-500 font-medium">Catalogue</Link>
                <Link href="/profil" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">Profil</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-500 font-medium">Déconnexion</button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Bienvenue, {user.nom_complet} !
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Gérez vos emprunts, explorez notre catalogue, et profitez de nos ressources numériques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Rechercher un livre
                </button>
                <Link
                  href="/catalogue"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full hover:from-red-600 hover:to-yellow-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
                >
                  <Book className="w-5 h-5 mr-2" />
                  Voir le catalogue
                </Link>
              </div>
              {isSearchVisible && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher parmi vos livres empruntés..."
                      value={searchBorrowedTerm}
                      onChange={handleSearchBorrowed}
                      className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Borrowed Books */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Livres Empruntés</h2>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Rafraîchir
              </button>
            </div>
            {filteredBorrowedBooks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <p className="text-gray-600 text-lg">
                  {searchBorrowedTerm ? 'Aucun livre emprunté correspondant à votre recherche.' : 'Aucun livre emprunté actuellement.'}
                </p>
                <Link
                  href="/catalogue"
                  className="mt-4 inline-flex items-center text-red-500 hover:text-red-600 font-semibold"
                >
                  Explorer le catalogue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBorrowedBooks.map((book: Book) => (
                  <div key={book.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100">
                    <div className="h-32 flex items-center justify-center mb-4">
                      <img src={book.cover} alt="Icône livre" className="w-16 h-16 object-contain" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 mb-2 font-medium">{book.author}</p>
                    {book.rating && (
                      <div className="flex items-center mb-4">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600 font-medium">{book.rating}</span>
                      </div>
                    )}
                    {book.dueDate && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">À rendre avant le {formatDate(book.dueDate)}</span>
                      </div>
                    )}
                    <button
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 font-semibold mb-2"
                      onClick={() => handleReturn(book.id)}
                      disabled={returnStates[book.id]?.loading || false}
                    >
                      {returnStates[book.id]?.loading ? "Rendu en cours..." : "Rendre"}
                    </button>
                    {returnStates[book.id]?.message && (
                      <div className={`mt-1 text-sm text-center ${
                        returnStates[book.id]?.message.includes("succès") 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {returnStates[book.id]?.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Borrowing History */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Historique des Emprunts</h2>
            {dashboardData.borrowingHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <p className="text-gray-600 text-lg">Aucun historique d&apos;emprunt disponible.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Titre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Auteur</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date d'emprunt</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date de retour</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.borrowingHistory.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{book.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(book.borrowDate)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(book.returnDate)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < book.ratingGiven ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center">
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
              <p>© 2025 Institut International d&apos;Ingénierie de l&apos;Eau et de l&apos;Environnement (2iE). Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;