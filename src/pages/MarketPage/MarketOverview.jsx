import React, { useEffect, useRef } from 'react';

const MarketOverview = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: 550,
      defaultColumn: 'overview',
      screener_type: 'crypto_mkt',
      displayCurrency: 'USD',
      colorTheme: 'dark',
      locale: 'en',
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-black text-white rounded-lg shadow-lg" style={{width:"100vw"}}>
      <div className="tradingview-widget-container" ref={containerRef}></div>
    </div>
  );
};

export default MarketOverview;
