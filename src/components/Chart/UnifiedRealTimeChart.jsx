import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const UnifiedRealTimeChart = ({ symbol, type = 'crypto', onPriceUpdate }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ma7SeriesRef = useRef(null);
  const ma14SeriesRef = useRef(null);
  const ma28SeriesRef = useRef(null);
  const wsRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [stats, setStats] = useState({ high24h: 0, low24h: 0, volume24h: 0 });
  const [loading, setLoading] = useState(true);

  const timeframes = [
    { label: '15m', value: '15m', interval: '15m' },
    { label: '1h', value: '1h', interval: '1h' },
    { label: '4h', value: '4h', interval: '4h' },
    { label: '1D', value: '1d', interval: '1d' },
  ];

  // Calculate moving averages
  const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += data[j].close;
        }
        result.push(sum / period);
      }
    }
    return result;
  };

  useEffect(() => {
    if (!chartContainerRef.current || !symbol) return;

    let isMounted = true;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Cleanup previous WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Cleanup previous resize observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    const container = chartContainerRef.current;
    
    // Responsive height based on screen size (defined outside initChart for reuse)
    const getChartHeight = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) {
        return 350; // Small mobile
      } else if (screenWidth <= 768) {
        return 400; // Tablet
      } else if (screenWidth <= 1024) {
        return 500; // Small desktop
      }
      return 600; // Large desktop
    };
    
    // Wait for container to have dimensions (especially important on mobile)
    const initChart = () => {
      if (!container || !isMounted) return;
      
      // Get actual container dimensions
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.clientWidth || window.innerWidth || 800;

      const chartHeight = getChartHeight();
      const chartWidth = Math.max(width, 300); // Minimum 300px width

      // Only create chart if container has valid dimensions
      if (chartWidth <= 0 || chartHeight <= 0) {
        // Retry after a short delay if dimensions aren't ready
        setTimeout(initChart, 100);
        return;
      }

      // Create chart
      const chart = createChart(container, {
        width: chartWidth,
        height: chartHeight,
        layout: {
          background: { type: 'solid', color: '#0b0e14' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: '#1a1d29', style: 2 },
          horzLines: { color: '#1a1d29', style: 2 },
        },
        crosshair: {
          mode: 0,
          vertLine: {
            color: '#26a69a',
            width: 1,
            style: 3,
          },
          horzLine: {
            color: '#26a69a',
            width: 1,
            style: 3,
          },
        },
        rightPriceScale: {
          borderColor: '#1a1d29',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#1a1d29',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Add candlestick series
      const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candleSeriesRef.current = candleSeries;

    // Add moving averages
    const ma7Series = chart.addLineSeries({
      color: '#ffd700',
      lineWidth: 2,
      title: 'MA7',
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    });
    ma7SeriesRef.current = ma7Series;

    const ma14Series = chart.addLineSeries({
      color: '#00d4ff',
      lineWidth: 2,
      title: 'MA14',
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    });
    ma14SeriesRef.current = ma14Series;

    const ma28Series = chart.addLineSeries({
      color: '#9c27b0',
      lineWidth: 2,
      title: 'MA28',
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    });
    ma28SeriesRef.current = ma28Series;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
      volumeSeriesRef.current = volumeSeries;

      // WebSocket for real-time updates (only for crypto with Binance)
      if (type === 'crypto') {
      const selectedTf = timeframes.find(tf => tf.value === timeframe);
      const wsInterval = selectedTf?.value === '15m' ? '15m' : 
                        selectedTf?.value === '1h' ? '1h' :
                        selectedTf?.value === '4h' ? '4h' :
                        selectedTf?.value === '1d' ? '1d' : '15m';

      const wsSymbol = symbol.endsWith('USDT') ? symbol.replace('USDT', '').toLowerCase() : symbol.toLowerCase();

      try {
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${wsSymbol}usdt@kline_${wsInterval}`
        );

        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}`);
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${symbol}:`, error);
        };

        ws.onclose = () => {
          console.log(`WebSocket closed for ${symbol}`);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const message = JSON.parse(event.data);
            const kline = message.k;

            if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

            if (kline.x) {
              candleSeriesRef.current.update({
                time: kline.t / 1000,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
              });

              volumeSeriesRef.current.update({
                time: kline.t / 1000,
                value: parseFloat(kline.v),
                color: parseFloat(kline.c) >= parseFloat(kline.o) ? '#26a69a26' : '#ef535026',
              });

              const change = parseFloat(kline.c) - parseFloat(kline.o);
              const changePercent = (change / parseFloat(kline.o)) * 100;
              setCurrentPrice(parseFloat(kline.c));
              setPriceChange(change);
              setPriceChangePercent(changePercent);
              onPriceUpdate?.(parseFloat(kline.c), change, changePercent);

              // Scroll to show latest candle
              if (chartRef.current) {
                try {
                  const timeScale = chartRef.current.timeScale();
                  if (timeScale && typeof timeScale.scrollToRealTime === 'function') {
                    timeScale.scrollToRealTime();
                  } else if (typeof timeScale.fitContent === 'function') {
                    timeScale.fitContent();
                  }
                } catch (error) {
                  // Ignore scroll errors for live updates
                }
              }
            } else {
              candleSeriesRef.current.update({
                time: kline.t / 1000,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
              });

              // Scroll to show current candle
              if (chartRef.current) {
                try {
                  const timeScale = chartRef.current.timeScale();
                  if (timeScale && typeof timeScale.scrollToRealTime === 'function') {
                    timeScale.scrollToRealTime();
                  }
                } catch (error) {
                  // Ignore scroll errors for live updates
                }
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
      }

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (chartContainerRef.current && chartRef.current && isMounted) {
          const newWidth = chartContainerRef.current.clientWidth;
          const newHeight = getChartHeight();
          if (newWidth > 0) {
            chartRef.current.applyOptions({
              width: newWidth,
              height: newHeight,
            });
            chartRef.current.timeScale().fitContent();
          }
        }
      });
      
      resizeObserver.observe(container);
      resizeObserverRef.current = resizeObserver;
    };
    
    // Handle window resize for responsive height
    const handleWindowResize = () => {
      if (chartRef.current && isMounted) {
        const newHeight = getChartHeight();
        chartRef.current.applyOptions({
          height: newHeight,
        });
      }
    };
    
    window.addEventListener('resize', handleWindowResize);

    // Fetch initial data function (uses refs so it can be called from anywhere)
    const fetchInitialData = async () => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current || !ma7SeriesRef.current || !ma14SeriesRef.current || !ma28SeriesRef.current) return;
      
      try {
        const selectedTf = timeframes.find(tf => tf.value === timeframe);
        const interval = selectedTf?.interval || '15m';
        
        let apiUrl = '';
        let symbolForApi = symbol;
        
        if (type === 'crypto') {
          symbolForApi = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
          apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbolForApi}&interval=${interval}&limit=500`;
        } else if (type === 'forex') {
          symbolForApi = 'BTCUSDT';
          apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbolForApi}&interval=${interval}&limit=500`;
        } else if (type === 'gold') {
          symbolForApi = 'BTCUSDT';
          apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbolForApi}&interval=${interval}&limit=500`;
        }

        if (!apiUrl) {
          setLoading(false);
          return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error(`Failed to fetch data for ${symbolForApi}`);
          setLoading(false);
          return;
        }
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.error(`No data returned for ${symbolForApi}`);
          setLoading(false);
          return;
        }

        if (!isMounted) return;

        const candles = data.map(d => ({
          time: (d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        const volumes = data.map(d => ({
          time: (d[0] / 1000),
          value: parseFloat(d[5]),
          color: parseFloat(d[4]) >= parseFloat(d[1]) ? '#26a69a26' : '#ef535026',
        }));

        const ma7Data = calculateMA(candles, 7).map((ma, i) => ({
          time: candles[i].time,
          value: ma,
        })).filter(d => d.value !== null);

        const ma14Data = calculateMA(candles, 14).map((ma, i) => ({
          time: candles[i].time,
          value: ma,
        })).filter(d => d.value !== null);

        const ma28Data = calculateMA(candles, 28).map((ma, i) => ({
          time: candles[i].time,
          value: ma,
        })).filter(d => d.value !== null);

        if (!isMounted) return;

        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
        ma7SeriesRef.current.setData(ma7Data);
        ma14SeriesRef.current.setData(ma14Data);
        ma28SeriesRef.current.setData(ma28Data);

        if (chartRef.current && candles.length > 0) {
          try {
            const timeScale = chartRef.current.timeScale();
            if (timeScale && typeof timeScale.scrollToRealTime === 'function') {
              timeScale.scrollToRealTime();
            } else {
              chartRef.current.timeScale().fitContent();
            }
          } catch (error) {
            try {
              chartRef.current.timeScale().fitContent();
            } catch (e) {
              console.error('Error scrolling chart:', e);
            }
          }
        }

        if (candles.length > 0) {
          const latest = candles[candles.length - 1];
          const previous = candles[candles.length - 2] || latest;
          const change = latest.close - previous.close;
          const changePercent = (change / previous.close) * 100;
          
          setCurrentPrice(latest.close);
          setPriceChange(change);
          setPriceChangePercent(changePercent);
          onPriceUpdate?.(latest.close, change, changePercent);

          const prices24h = candles.slice(-96);
          const highs = prices24h.map(c => c.high);
          const lows = prices24h.map(c => c.low);
          const volumes24h = volumes.slice(-96);
          
          setStats({
            high24h: Math.max(...highs),
            low24h: Math.min(...lows),
            volume24h: volumes24h.reduce((sum, v) => sum + v.value, 0),
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };

    // Initialize chart - use requestAnimationFrame to ensure DOM is ready
    if (container) {
      // Try immediate initialization
      initChart();
      // Also try after a short delay to handle cases where container dimensions aren't ready
      const timeoutId = setTimeout(() => {
        if (!chartRef.current && container) {
          initChart();
        }
      }, 100);
      
      // Fetch initial data after chart is initialized
      const dataTimeoutId = setTimeout(() => {
        if (chartRef.current) {
          fetchInitialData();
        }
      }, 200);
      
      // Auto-update and scroll every 5 seconds
      updateIntervalRef.current = setInterval(async () => {
        if (!isMounted || !chartRef.current || !candleSeriesRef.current) return;

        try {
          // Refresh data
          await fetchInitialData();
        
        // Scroll to latest after data update
        if (chartRef.current) {
          try {
            const timeScale = chartRef.current.timeScale();
            if (timeScale) {
              if (typeof timeScale.scrollToRealTime === 'function') {
                timeScale.scrollToRealTime();
              } else if (typeof timeScale.fitContent === 'function') {
                timeScale.fitContent();
              }
            }
          } catch (error) {
            // Ignore scroll errors
            console.error('Error scrolling in auto-update:', error);
          }
        }
      } catch (error) {
        console.error('Error in auto-update:', error);
      }
      }, 5000); // Every 5 seconds

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(dataTimeoutId);
        isMounted = false;
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
        window.removeEventListener('resize', handleWindowResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    }
  }, [symbol, timeframe, type]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '0.00';
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent min-h-[350px] lg:min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 border-b border-[#2a2d3a]">
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">${formatPrice(currentPrice)}</span>
            <span className="text-[10px] sm:text-xs text-gray-400">≈{formatPrice(currentPrice)} USD</span>
          </div>
          <div className={`text-[10px] sm:text-xs font-medium ${
            priceChange >= 0 ? 'text-teal-400' : 'text-red-400'
          }`}>
            {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-gray-400">24h High:</span>
            <span className="text-teal-400 font-medium">{formatPrice(stats.high24h)}</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-gray-400">24h Low:</span>
            <span className="text-red-400 font-medium">{formatPrice(stats.low24h)}</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-gray-400">24h Turnover:</span>
            <span className="text-white font-medium">{(stats.volume24h / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border-b border-[#2a2d3a]">
        {timeframes.map(tf => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium rounded transition-all ${
              timeframe === tf.value
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs border-b border-[#2a2d3a]">
        <div className="text-[#ffd700]">
          MA7: {formatPrice(currentPrice)}
        </div>
        <div className="text-[#00d4ff]">
          MA14: {formatPrice(currentPrice)}
        </div>
        <div className="text-[#9c27b0]">
          MA28: {formatPrice(currentPrice)}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(11,14,20,0.8)] backdrop-blur-sm z-10">
          <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-400">Loading chart data...</p>
        </div>
      )}
      <div ref={chartContainerRef} className="flex-1 w-full relative min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[300px]" />
    </div>
  );
};

export default UnifiedRealTimeChart;
