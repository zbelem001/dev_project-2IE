'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Book, Search, Filter, Star, ArrowRight, Menu, X, User } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';


interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_creation: string;
  nom_complet: string;
}
// Define the Book interface for TypeScript
interface Book {
  book_id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  total_copies: number;
  available_copies: number;
  cover: string;
}

const Catalog: React.FC = () => {
  const { logout, token } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [user, setUser] = useState<{ nom: string; prenom: string } | null>(null);
  const [userBorrowings, setUserBorrowings] = useState<number[]>([]);
  const booksPerPage: number = 6;
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Categories for filtering
  const categories: string[] = [
    'Toutes',
    'Informatique',
    'Mathématiques',
    'Gestion',
    'Environnement',
    'Romans',
    'Sciences',
    'Arts'
  ];

  // Charger les livres depuis l'API
  const loadBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4400/api/livres', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        console.error('Erreur lors du chargement des livres');
      }
    } catch {
      // Erreur lors du chargement des livres
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Charger les informations utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4400/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.error('Erreur lors du chargement des informations utilisateur');
        }
      } catch {
        // Erreur lors du chargement des informations utilisateur
      }
    };
    loadUser();
  }, []);

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

  // Filter and search books
  const filteredBooks = books.filter((book: Book) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.category.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'Toutes' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  const fetchUserBorrowings = async () => {
    if (!token) return;
    const response = await fetch('http://localhost:4400/api/mes-emprunts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setUserBorrowings((data as { book_id: number }[]).map((e) => e.book_id));
    }
  };

  const handleBorrow = async (book_id: number) => {
    if (!token) {
      alert("Vous devez être connecté pour emprunter un livre.");
      return;
    }
    try {
      const response = await fetch('http://localhost:4400/api/emprunter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Livre emprunté avec succès !");
        // Rafraîchir la liste des livres et des emprunts utilisateur
        await loadBooks();
        await fetchUserBorrowings();
      } else {
        alert(data.error || "Erreur lors de l'emprunt");
      }
    } catch {
      alert("Erreur lors de l'emprunt");
    }
  };

  useEffect(() => {
    fetchUserBorrowings();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
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
              <Link href="/catalogue" className="text-gray-700 hover:text-green-500 transition-colors font-medium border-b-2 border-green-500 pb-1">Catalogue</Link>
              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium hidden lg:inline">
                    {user ? `${user.nom} ${user.prenom}` : 'Utilisateur'}
                  </span>
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
        {/* Search and Filters */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Catalogue des Livres</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, auteur ou genre..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Book List */}
        <section className="mb-12">
          {currentBooks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <p className="text-gray-600 text-lg">Aucun livre trouvé.</p>
              <Link
                href="/catalogue"
                className="mt-4 inline-flex items-center text-red-500 hover:text-red-600 font-semibold"
              >
                Réinitialiser les filtres
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBooks.map((book) => {
                const alreadyBorrowed = userBorrowings.includes(book.book_id);
                return (
                  <div key={book.book_id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100">
                    <div className="h-32 flex items-center justify-center mb-4">
                      <img src={book.cover} alt="Icône livre" className="w-16 h-16 object-contain" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available_copies > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available_copies}/{book.total_copies} disponibles
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">{book.author}</p>
                    <p className="text-gray-500 text-sm mb-2">{book.category}</p>
                    <div className="flex items-center mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600 font-medium">{book.rating}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className={`flex-1 px-4 py-2 rounded-full text-white font-semibold transition-all transform hover:scale-105 ${
                          book.available_copies > 0 && !alreadyBorrowed
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={book.available_copies <= 0 || alreadyBorrowed}
                        onClick={() => handleBorrow(book.book_id)}
                      >
                        {alreadyBorrowed
                          ? 'Déjà emprunté'
                          : (book.available_copies > 0 ? 'Emprunter' : 'Indisponible')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="flex justify-center">
            <nav className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    currentPage === index + 1
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          </section>
        )}
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
            <p>© 2025 Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE). Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;