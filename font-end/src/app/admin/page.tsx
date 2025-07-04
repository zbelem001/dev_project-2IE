"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Book,
  Search,
  Filter,
  Star,
  ArrowRight,
  Menu,
  X,
  User,
  Save,
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";

// Interface pour les livres
interface Book {
  book_id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  available: boolean;
  cover: string;
  total_copies: number;
  available_copies: number;
}

// Interface pour les statistiques
interface Stats {
  totalBooks: number;
  totalStudents: number;
  totalLoans: number;
  totalReturns: number;
  overdueLoans: number;
}

const Catalog: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalStudents: 0,
    totalLoans: 0,
    totalReturns: 0,
    overdueLoans: 0,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<Partial<Book>>({ 
    title: "",
    author: "",
    category: "",
    rating: 0, 
    available: true,
    cover: "",
    total_copies: 0,
    available_copies: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const booksPerPage: number = 6;

  // Catégories pour le filtrage
  const categories: string[] = [
    "Toutes",
    "Informatique",
    "Mathématiques",
    "Gestion",
    "Environnement",
  ];

  // Liste d'icônes disponibles pour les livres
  const bookIcons = [
    "https://cdn-icons-png.flaticon.com/512/29/29302.png",
    "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    "https://cdn-icons-png.flaticon.com/512/616/616489.png",
    "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
  ];

  // Charger les livres et les statistiques depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token envoyé:", token);

        // Charger les livres
        const booksResponse = await fetch("http://localhost:4400/api/livres", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const booksText = await booksResponse.text();
        console.log("Réponse livres:", booksText);
        if (!booksResponse.ok) {
          throw new Error('Erreur API: ' + booksText);
        }
        const booksData = JSON.parse(booksText);
        setBooks(booksData);

        // Charger les statistiques
        const statsResponse = await fetch("http://localhost:4400/api/Stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const statsText = await statsResponse.text();
        console.log("Réponse stats:", statsText);
        if (!statsResponse.ok) {
          throw new Error('Erreur API: ' + statsText);
        }
        const statsData = JSON.parse(statsText);
        setStats({
          totalBooks: Number(statsData.totalBooks) || 0,
          totalStudents: Number(statsData.totalStudents) || 0,
          totalLoans: Number(statsData.totalLoans) || 0,
          totalReturns: Number(statsData.totalReturns) || 0,
          overdueLoans: Number(statsData.overdueLoans) || 0,
        });
      } catch (error) {
        console.error("Erreur dans loadData:", error);
      }
    };
    loadData();
  }, []);

  // Fermer le menu de profil en cas de clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrer les livres
  const filteredBooks = books.filter((book: Book) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.category.toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategory === "Toutes" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Valider le formulaire
  const validateBookForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!bookForm.title?.trim()) errors.title = "Le titre est requis";
    if (!bookForm.author?.trim()) errors.author = "L'auteur est requis";
    if (!bookForm.category?.trim()) errors.category = "La catégorie est requise";
    if (bookForm.rating && (bookForm.rating < 0 || bookForm.rating > 5))
      errors.rating = "La note doit être entre 0 et 5";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBookForm()) {
      try {
        const token = localStorage.getItem("token");
        const url = editingBook 
          ? `http://localhost:4400/api/livres/${editingBook.book_id}`
          : "http://localhost:4400/api/livres";
        const method = editingBook ? "PUT" : "POST";
        // On retire available_copies lors de l'ajout (POST)
        let dataToSend = { ...bookForm };
        if (!editingBook) {
          // Suppression du champ available_copies pour la création
          const { available_copies, ...rest } = dataToSend;
          dataToSend = rest;
        }
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) {
          throw new Error('Erreur API: ' + (await response.text()));
        }
        const result = await response.json();
        if (editingBook) {
          setBooks(books.map((b) => (b.book_id === editingBook.book_id ? result : b)));
        } else {
          setBooks([...books, result]);
        }
        setStats((prev) => ({ ...prev, totalBooks: editingBook ? prev.totalBooks : prev.totalBooks + 1 }));
        resetBookForm();
        alert(editingBook ? "Livre modifié avec succès!" : "Livre ajouté avec succès!");
      } catch (error: unknown) {
        console.error("Erreur:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        alert(`Erreur: ${errorMessage}`);
      }
    }
  };

  // Supprimer un livre
  const deleteBook = async (book_id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce livre ?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4400/api/livres/${book_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setBooks(books.filter((b) => b.book_id !== book_id));
          setStats((prev) => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
          alert("Livre supprimé avec succès!");
        } else {
          throw new Error('Erreur API: ' + (await response.text()));
        }
      } catch (error: unknown) {
        console.error("Erreur:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        alert(`Erreur: ${errorMessage}`);
      }
    }
  };

  // Réinitialiser le formulaire
  const resetBookForm = () => {
    setBookForm({ title: "", author: "", category: "", rating: 0, available: true, cover: "", total_copies: 0, available_copies: 0 });
    setEditingBook(null);
    setIsBookModalOpen(false);
    setFormErrors({});
  };

  // Ouvrir le modal d'édition
  const openEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm(book);
    setIsBookModalOpen(true);
  };

  // Déconnexion
  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    router.push("/login");
  };

  const handleAddBook = async (bookData) => {
    await fetch('/api/livres', {
      method: 'POST',
      body: JSON.stringify(bookData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchStats();
  };

  // Fonction pour rafraîchir les statistiques
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const statsResponse = await fetch("http://localhost:4400/api/Stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!statsResponse.ok) {
        throw new Error('Erreur API: ' + (await statsResponse.text()));
      }
      const statsData = await statsResponse.json();
      setStats({
        totalBooks: Number(statsData.totalBooks) || 0,
        totalStudents: Number(statsData.totalStudents) || 0,
        totalLoans: Number(statsData.totalLoans) || 0,
        totalReturns: Number(statsData.totalReturns) || 0,
        overdueLoans: Number(statsData.overdueLoans) || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  return (
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
              <Link
                href="/admin"
                className="text-gray-700 hover:text-red-500 transition-colors font-medium border-b-2 border-red-500 pb-1"
              >
                Tableau de bord
              </Link>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium hidden lg:inline">Admin</span>
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
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6 text-red-500" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <Link href="/dashbord" className="block py-2 text-gray-700 hover:text-red-500 font-medium">
                Tableau de bord
              </Link>
              <Link href="/catalogue" className="block py-2 text-gray-700 hover:text-green-500 font-medium">
                Catalogue
              </Link>
              <Link href="/profil" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">
                Profil
              </Link>
              <Link href="/catalogue" className="block py-2 text-gray-700 hover:text-green-500 font-medium">
                Emprunt
              </Link>
              <Link href="/returns" className="block py-2 text-gray-700 hover:text-blue-500 font-medium">
                Retour
              </Link>
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
        {/* Statistics Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Tableau de Bord Admin</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <Book className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-semibold">Livres</p>
                    <p className="text-3xl font-bold">{stats.totalBooks}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <Users className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-semibold">Étudiants</p>
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <BookOpen className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-semibold">Emprunts</p>
                    <p className="text-3xl font-bold">{stats.totalLoans}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-semibold">Retours</p>
                    <p className="text-3xl font-bold">{stats.totalReturns}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <AlertTriangle className="w-10 h-10" />
                  <div>
                    <p className="text-lg font-semibold">Emprunts en retard</p>
                    <p className="text-3xl font-bold">{stats.overdueLoans}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Books Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Livres</h2>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full hover:from-red-600 hover:to-yellow-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un Livre
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, auteur ou genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                {currentBooks.map((book) => (
                  <div
                    key={book.book_id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="h-32 flex items-center justify-center mb-4">
                      <img 
                        src={book.cover || "https://cdn-icons-png.flaticon.com/512/29/29302.png"} 
                        alt="Icône livre" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 mb-2 font-medium">{book.author}</p>
                    <p className="text-gray-500 text-sm mb-2">{book.category}</p>
                    <div className="flex items-center mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600 font-medium">{book.rating}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditBook(book)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 font-semibold"
                      >
                        <Edit className="w-4 h-4 mr-2 inline" />
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteBook(book.book_id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 font-semibold"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exemplaires disponibles
                        <input
                          type="number"
                          value={book.available_copies}
                          readOnly
                          className="w-full mt-1 p-2 border rounded"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          </section>
        )}
      </main>

      {/* Modal pour ajouter/modifier un livre */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBook ? "Modifier le Livre" : "Ajouter un Livre"}
              </h2>
              <button onClick={resetBookForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  value={bookForm.title || ""}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Auteur</label>
                <input
                  type="text"
                  value={bookForm.author || ""}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formErrors.author && <p className="text-sm text-red-500">{formErrors.author}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <input
                  type="text"
                  value={bookForm.category || ""}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={bookForm.rating || 0}
                  onChange={(e) => setBookForm({ ...bookForm, rating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formErrors.rating && <p className="text-sm text-red-500">{formErrors.rating}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Disponible</label>
                <select
                  value={bookForm.available ? "true" : "false"}
                  onChange={(e) => setBookForm({ ...bookForm, available: e.target.value === "true" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'exemplaires
                  <input
                    type="number"
                    name="total_copies"
                    value={bookForm.total_copies || ''}
                    onChange={e => setBookForm({ ...bookForm, total_copies: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône du livre
                </label>
                <select
                  value={bookForm.cover || bookIcons[0]}
                  onChange={e => setBookForm({ ...bookForm, cover: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {bookIcons.map((icon, idx) => (
                    <option key={idx} value={icon}>
                      Icône {idx + 1}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center">
                  <img src={bookForm.cover || bookIcons[0]} alt="Aperçu icône" className="w-12 h-12 mr-2 border rounded" />
                  <span className="text-xs text-gray-500">Aperçu</span>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetBookForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editingBook ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <li>
                  <Link href="/stats" className="hover:text-white transition-colors hover:text-red-400">
                    Tableau de bord
                  </Link>
                </li>
                <li>
                  <Link href="/catalogue" className="hover:text-white transition-colors hover:text-green-400">
                    Catalogue
                  </Link>
                </li>
                <li>
                  <Link href="/profil" className="hover:text-white transition-colors hover:text-blue-400">
                    Profil
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors hover:text-yellow-400">
                    Aide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-green-400">Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Emprunts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Réservations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Recherche avancée
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Recommandations
                  </a>
                </li>
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