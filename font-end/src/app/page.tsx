'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Book, Users, Star, Menu, X, BookOpen, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface BookType {
  book_id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  available: boolean;
  cover: string;
  borrow_count: number;
}

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // const [books, setBooks] = useState<BookType[]>([]); // plus utilisé
  const [popularBooks, setPopularBooks] = useState<BookType[]>([]);
  const { user, token } = useAuth();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        await fetch('http://localhost:4400/api/livres');
        // plus d'utilisation de data ni de setBooks
      } catch {
        // plus d'utilisation de setBooks
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      const response = await fetch('http://localhost:4400/api/livres-populaires');
      if (response.ok) {
        const data = await response.json();
        setPopularBooks(data);
      }
    };
    fetchPopularBooks();
  }, []);

  const stats = [
    { icon: Book, label: "Livres Disponibles", value: "15,000+", color: "bg-red-500" },
    { icon: Users, label: "Étudiants Inscrits", value: "2,500+", color: "bg-green-500" },
    { icon: Star, label: "Note Moyenne", value: "4.8/5", color: "bg-blue-500" }
  ];

  const services = [
    {
      icon: BookOpen,
      title: "Consultation en ligne",
      description: "Accédez à nos ressources numériques 24h/24",
      color: "bg-red-500"
    },
    {
      icon: Calendar,
      title: "Réservation facile",
      description: "Réservez vos ouvrages en quelques clics",
      color: "bg-yellow-500"
    },
    {
      icon: Award,
      title: "Recommandations personnalisées",
      description: "Découvrez des livres adaptés à votre parcours",
      color: "bg-green-500"
    }
  ];

  const handleSearch = () => {
    console.log('Recherche:', searchQuery);
    // Logique de recherche à implémenter
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
        alert('Livre emprunté avec succès !');
        // Optionnel : rafraîchir la liste des livres populaires
      } else {
        alert(data.error || JSON.stringify(data) || "Erreur lors de l'emprunt");
      }
    } catch (error) {
      alert("Erreur lors de l'emprunt");
    }
  };

  const DEFAULT_BOOK_ICON = "https://cdn-icons-png.flaticon.com/512/29/29302.png";

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
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-500 transition-colors font-medium border-b-2 border-transparent hover:border-red-500 pb-1">Accueil</a>
              <a href="#services" className="text-gray-700 hover:text-blue-500 transition-colors font-medium border-b-2 border-transparent hover:border-blue-500 pb-1">À propos</a>
              <a href="#contact" className="text-gray-700 hover:text-yellow-500 transition-colors font-medium border-b-2 border-transparent hover:border-yellow-500 pb-1">Contact</a>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <button className="text-gray-700 hover:text-red-500 py-2 px-4 rounded-full transition-all duration-300 font-medium hover:bg-red-50 hover:shadow-lg hover:scale-105 hover:rotate-1 hover:border-2 hover:border-red-200 transform hover:-translate-y-1 cursor-pointer">
                  Connexion
                </button>
              </Link>
              <Link href="/newUsers" className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-yellow-600 transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center">
                Inscription
              </Link>
            </div>

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
              <a href="#" className="block py-2 text-gray-700 hover:text-red-500 font-medium">Accueil</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">À propos</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-yellow-500 font-medium">Contact</a>
              <div className="pt-3 border-t space-y-2">
                <button className="block w-full text-left py-2 text-gray-700 font-medium hover:text-red-500 hover:bg-red-50 hover:px-4 hover:rounded-lg transition-all duration-300 hover:scale-105 hover:rotate-1 transform">Connexion</button>
                <button className="block w-full text-left py-2 text-red-500 font-medium">Inscription</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
              <span className="text-gray-700 font-medium ml-2">Bibliothèque Numérique 2iE</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Votre Gateway vers
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent block mt-2">
              la Connaissance
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Découvrez, réservez et empruntez des milliers de livres en quelques clics. 
            Innovation, Excellence et Accessibilité au service de votre formation.
          </p>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative bg-white rounded-full shadow-2xl overflow-hidden">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Rechercher un livre, un auteur, un domaine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-4 py-5 text-lg border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-8 py-3 rounded-full hover:from-red-600 hover:to-yellow-600 transition-all transform hover:scale-105 font-medium shadow-lg"
              >
                Rechercher
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-l-4 border-transparent hover:border-red-500">
                <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">Des outils modernes pour faciliter votre apprentissage et vos recherches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-3 border-2 border-gray-100 hover:border-red-200">
                <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION LIVRES POPULAIRES */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Livres populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularBooks.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">Aucun livre populaire trouv&eacute;.</div>
            ) : (
              popularBooks.map((book) => (
                <div key={book.book_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 group border border-gray-100">
                  <img
                    src={book.cover || DEFAULT_BOOK_ICON}
                    alt={book.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{book.title}</h3>
                    <p className="text-gray-500 mb-1">{book.author}</p>
                    <p className="text-xs text-gray-400 mb-2">Cat&eacute;gorie : {book.category}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-500 flex items-center"><Star className="w-4 h-4 mr-1" />{book.rating}</span>
                      <span className="text-xs text-gray-400">{book.borrow_count} emprunts</span>
                    </div>
                    <button
                      className={`w-full px-4 py-2 rounded-lg font-semibold mt-2 transition-all ${book.available ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      disabled={!book.available}
                      onClick={() => handleBorrow(book.book_id)}
                    >
                      {book.available ? 'Emprunter' : 'Indisponible'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à rejoindre l'excellence 2iE ?
          </h2>
          <p className="text-xl text-white opacity-90 mb-10 leading-relaxed">
            Rejoignez des milliers d'étudiants et de professionnels qui utilisent déjà notre plateforme pour exceller dans leurs domaines
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-4 bg-white text-red-500 rounded-full font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl">
              Créer un compte
            </button>
            <Link href="/login">
              <button className="px-10 py-4 border-3 border-white text-white rounded-full font-bold hover:bg-white hover:text-red-500 transition-all transform hover:scale-105 shadow-xl">
                Voir tout le catalogue
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
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
                <li><a href="/login" className="hover:text-white transition-colors hover:text-red-400">Accueil</a></li>
                <li><a href="/login" className="hover:text-white transition-colors hover:text-blue-400">Mon compte</a></li>
                <li><a href="/login" className="hover:text-white transition-colors hover:text-yellow-400">Aide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-green-400">Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/login" className="hover:text-white transition-colors">Emprunts</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Réservations</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Recherche avancée</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Recommandations</a></li>
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
            <p>&copy; 2025 Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE). Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;