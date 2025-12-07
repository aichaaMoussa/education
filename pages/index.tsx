import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiBook, FiUsers, FiAward, FiPlayCircle, FiCheckCircle, 
  FiStar, FiArrowRight, FiTrendingUp, FiShield, FiClock,
  FiVideo, FiFileText, FiHelpCircle, FiBarChart2
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, 
  FaRocket, FaLaptopCode, FaChartLine, FaCertificate
} from 'react-icons/fa';
import { HiAcademicCap, HiLightBulb } from 'react-icons/hi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  const features = [
    {
      icon: <FiVideo className="w-8 h-8" />,
      title: 'Vidéos Interactives',
      description: 'Apprenez avec des vidéos de qualité professionnelle',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: 'Ressources PDF',
      description: 'Téléchargez des PDFs pour approfondir vos connaissances',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: <FiHelpCircle className="w-8 h-8" />,
      title: 'Quiz Interactifs',
      description: 'Testez vos connaissances avec des quiz personnalisés',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: 'Suivi de Progression',
      description: 'Suivez votre avancement en temps réel',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: <FaChalkboardTeacher className="w-8 h-8" />,
      title: 'Formateurs Experts',
      description: 'Apprenez auprès de professionnels expérimentés',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: <FaCertificate className="w-8 h-8" />,
      title: 'Certificats',
      description: 'Obtenez des certificats de complétion reconnus',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Apprenants actifs', icon: <FaUserGraduate className="w-6 h-6" /> },
    { number: '500+', label: 'Formations disponibles', icon: <FiBook className="w-6 h-6" /> },
    { number: '200+', label: 'Formateurs experts', icon: <FaChalkboardTeacher className="w-6 h-6" /> },
    { number: '95%', label: 'Taux de satisfaction', icon: <FiStar className="w-6 h-6" /> },
  ];

  const categories = [
    { name: 'Développement Web', icon: <FaLaptopCode className="w-6 h-6" />, color: 'bg-blue-500' },
    { name: 'Data Science', icon: <FaChartLine className="w-6 h-6" />, color: 'bg-green-500' },
    { name: 'Design', icon: <HiLightBulb className="w-6 h-6" />, color: 'bg-purple-500' },
    { name: 'Marketing', icon: <FiTrendingUp className="w-6 h-6" />, color: 'bg-orange-500' },
    { name: 'Business', icon: <HiAcademicCap className="w-6 h-6" />, color: 'bg-indigo-500' },
    { name: 'Photographie', icon: <FiAward className="w-6 h-6" />, color: 'bg-pink-500' },
  ];

  return (
    <>
      <Head>
        <title>Easy Tech - Apprenez en ligne avec les meilleurs formateurs</title>
        <meta name="description" content="Plateforme d'apprentissage en ligne avec des formations de qualité, des formateurs experts et un suivi de progression personnalisé." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                  <FaGraduationCap className="text-2xl text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Easy Tech
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Fonctionnalités
                </Link>
                <Link href="#categories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Catégories
                </Link>
                <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  À propos
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="flex items-center space-x-2">
                    <span>Commencer</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                  <FaRocket className="w-4 h-4" />
                  <span>Plateforme #1 d'apprentissage en ligne</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Apprenez sans limites avec{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Easy Tech
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Accédez à des milliers de formations de qualité, enseignées par des experts. 
                  Développez vos compétences et atteignez vos objectifs professionnels.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="flex items-center space-x-2 group">
                      <span>Commencer gratuitement</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" size="lg" className="flex items-center space-x-2">
                      <FiPlayCircle className="w-5 h-5" />
                      <span>Explorer les formations</span>
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center space-x-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"></div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">10,000+</p>
                      <p className="text-xs text-gray-600">Apprenants actifs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">4.9/5</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-3">
                          <FaGraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Formation Complète</h3>
                          <p className="text-sm text-gray-600">Développement Web</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-3/4"></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-semibold text-blue-600">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 left-8 w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir <span className="text-blue-600">Easy Tech</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Une expérience d'apprentissage complète avec tous les outils dont vous avez besoin pour réussir
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} hover className="border-0 shadow-lg">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-6 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Explorez nos <span className="text-blue-600">catégories</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trouvez la formation parfaite pour développer vos compétences
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <Link key={index} href="/courses">
                  <Card hover className="text-center border-2 border-gray-100 hover:border-blue-500 transition-all group">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-xl mb-4 text-white group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FaGraduationCap className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à commencer votre parcours d'apprentissage ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez des milliers d'apprenants qui développent leurs compétences avec Easy Tech
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 flex items-center space-x-2">
                  <span>Créer un compte gratuit</span>
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  Voir les formations
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FaGraduationCap className="text-2xl text-blue-400" />
                  <span className="text-xl font-bold text-white">Easy Tech</span>
                </div>
                <p className="text-sm text-gray-400">
                  La plateforme d'apprentissage en ligne pour développer vos compétences et atteindre vos objectifs.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/courses" className="hover:text-blue-400 transition-colors">Formations</Link></li>
                  <li><Link href="#features" className="hover:text-blue-400 transition-colors">Fonctionnalités</Link></li>
                  <li><Link href="#categories" className="hover:text-blue-400 transition-colors">Catégories</Link></li>
                  <li><Link href="/register" className="hover:text-blue-400 transition-colors">S'inscrire</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Centre d'aide</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Politique de confidentialité</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiAward className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Easy Tech. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
