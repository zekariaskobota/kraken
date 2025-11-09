import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import config from '../../config';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';

const CryptoNews = () => {
  const [news, setNews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Your login session expired, You need to log in again',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        navigate("/login");
      });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/news`);
        const data = await response.json();
        setNews(data.articles || []); 
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="text-left mb-6 sm:mb-8">
          <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold sm:font-bold text-white mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
            Crypto News
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">Stay updated with the latest cryptocurrency news and insights</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Loading news...</p>
          </div>
        ) : (
          <>
            {news.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {news.map((article, index) => (
                  <article key={index} className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl overflow-hidden hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-500/10">
                    {article.urlToImage && (
                      <div className="w-full h-48 sm:h-56 overflow-hidden">
                        <img 
                          src={article.urlToImage || '/news.png'} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/news.png';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-6">
                      <h2 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3 line-clamp-2">{article.title}</h2>
                      {article.description && (
                        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-3">
                          {article.description.length > 150 
                            ? `${article.description.substring(0, 150)}...` 
                            : article.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaCalendarAlt className="text-[10px] sm:text-xs" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all"
                        >
                          Read More <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-400 text-sm">No news available at the moment.</p>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default CryptoNews;
