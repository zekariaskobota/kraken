// src/NewsDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const response = await fetch(`https://api.binance.com/api/v3/exchangeInfo?symbol=${id}`); // Adjust to your API endpoint
      const data = await response.json();
      setArticle(data);
    };

    fetchArticle();
  }, [id]);

  if (!article) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-4">{article.symbol}</h1>
        <p className="text-gray-400 mb-4">Status: {article.status}</p>
        <p className="text-white">{JSON.stringify(article, null, 2)}</p> {/* Displaying JSON data for illustration */}
      </div>
    </div>
  );
};

export default NewsDetail;