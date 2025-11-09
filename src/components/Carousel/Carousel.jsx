import React, { useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import config from "../../config";

const Carousel = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/sliders/active`);
        const data = await response.json();
        if (data.sliders && data.sliders.length > 0) {
          // Process image URLs
          const processedSlides = data.sliders.map(slide => ({
            ...slide,
            image: slide.image?.startsWith('http') 
              ? slide.image 
              : `${config.BACKEND_URL}${slide.image}`
          }));
          setSlides(processedSlides);
        } else {
          // Fallback to default slides if no sliders found
          setSlides([
            {
              image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
              title: "Trade Cryptocurrencies with Confidence",
              description: "Access 100+ trading pairs with advanced charting tools and real-time market data",
              primaryBtn: { text: "Start Trading", link: "/trade" },
              secondaryBtn: { text: "Learn More", link: "/market" }
            },
            {
              image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80",
              title: "Secure & Fast Transactions",
              description: "Deposit and withdraw funds instantly with bank-level security",
              primaryBtn: { text: "Deposit Now", link: "/profile" },
              secondaryBtn: { text: "View Markets", link: "/market" }
            },
            {
              image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
              title: "24/7 Market Access",
              description: "Trade anytime, anywhere with our professional trading platform",
              primaryBtn: { text: "Explore Markets", link: "/market" },
              secondaryBtn: { text: "View News", link: "/news" }
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
        // Fallback to default slides on error
        setSlides([
          {
            image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
            title: "Trade Cryptocurrencies with Confidence",
            description: "Access 100+ trading pairs with advanced charting tools and real-time market data",
            primaryBtn: { text: "Start Trading", link: "/trade" },
            secondaryBtn: { text: "Learn More", link: "/market" }
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrent(index);

  if (loading) {
    return (
      <div className="relative w-full h-auto min-h-[200px] md:min-h-[280px] lg:min-h-[350px] overflow-hidden rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-2xl mx-auto max-w-7xl bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[#2a2d3a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-auto min-h-[200px] md:min-h-[280px] lg:min-h-[350px] overflow-hidden rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-2xl mx-auto max-w-7xl bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[#2a2d3a]">
      <div className="relative w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`transition-opacity duration-600 ease-in-out ${
              index === current ? 'opacity-100 z-10 block' : 'opacity-0 z-0 hidden'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center w-full">
              {/* Image on Left */}
              <div className="w-full md:w-1/2 h-[200px] md:h-[280px] lg:h-[350px] relative overflow-hidden rounded-l-xl md:rounded-l-2xl">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=Slider+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/60 via-[#0b0e14]/30 to-transparent"></div>
              </div>
              
              {/* Text Content on Right */}
              <div className="w-full md:w-1/2 p-4 md:p-6 lg:p-8 flex flex-col justify-center h-[200px] md:h-[280px] lg:h-[350px] bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] rounded-r-xl md:rounded-r-2xl">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-4 md:mb-5 leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    to={slide.primaryBtn.link} 
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-gradient-to-r from-teal-500 to-teal-600 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/40"
                  >
                    {slide.primaryBtn.text}
                  </Link>
                  <Link 
                    to={slide.secondaryBtn.link} 
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-white/10 text-white border border-white/20 transition-all duration-300 hover:bg-white/20"
                  >
                    {slide.secondaryBtn.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex justify-between items-center px-2 md:px-4 z-30 pointer-events-none">
        <button 
          onClick={prevSlide} 
          className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-md hover:bg-teal-500/80 hover:border-teal-400 hover:scale-110 pointer-events-auto shadow-lg"
        >
          <FaChevronLeft className="text-xs md:text-sm" />
        </button>
        <button 
          onClick={nextSlide} 
          className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-black/60 border border-white/20 text-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-md hover:bg-teal-500/80 hover:border-teal-400 hover:scale-110 pointer-events-auto shadow-lg"
        >
          <FaChevronRight className="text-xs md:text-sm" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 cursor-pointer rounded-full ${
              index === current 
                ? 'w-6 h-2 bg-teal-400 rounded' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
