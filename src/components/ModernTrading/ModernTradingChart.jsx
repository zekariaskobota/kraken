import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const ModernTradingChart = ({ symbol, onPriceUpdate }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' or 'line'

  const timeframes = [
    { label: '1m', value: '1m', interval: '1' },
    { label: '5m', value: '5m', interval: '5' },
    { label: '15m', value: '15m', interval: '15' },
    { label: '1h', value: '1h', interval: '60' },
    { label: '4h', value: '4h', interval: '240' },
    { label: '1d', value: '1d', interval: '1d' },
    { label: '1w', value: '1w', interval: '1w' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { type: 'solid', color: '#0b0e14' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1a1d29', style: 2 },
        horzLines: { color: '#1a1d29', style: 2 },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: '#1a1d29',
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

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const selectedTf = timeframes.find(tf => tf.value === timeframe);
        const interval = selectedTf?.interval || '60';
        
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
        );
        const data = await response.json();

        if (!Array.isArray(data)) return;

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

        candleSeries.setData(candles);
        volumeSeries.setData(volumes);

        // Update price info
        if (candles.length > 0) {
          const latest = candles[candles.length - 1];
          const previous = candles[candles.length - 2] || latest;
          const change = latest.close - previous.close;
          const changePercent = (change / previous.close) * 100;
          onPriceUpdate?.(latest.close, change, changePercent);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchInitialData();

    // WebSocket for real-time updates
    const selectedTf = timeframes.find(tf => tf.value === timeframe);
    const wsInterval = selectedTf?.value === '1m' ? '1m' : 
                      selectedTf?.value === '5m' ? '5m' :
                      selectedTf?.value === '15m' ? '15m' :
                      selectedTf?.value === '1h' ? '1h' :
                      selectedTf?.value === '4h' ? '4h' :
                      selectedTf?.value === '1d' ? '1d' : '1h';

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${wsInterval}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;

      if (kline.x) { // Candle is closed
        candleSeries.update({
          time: kline.t / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        });

        volumeSeries.update({
          time: kline.t / 1000,
          value: parseFloat(kline.v),
          color: parseFloat(kline.c) >= parseFloat(kline.o) ? '#26a69a26' : '#ef535026',
        });

        // Update price
        const change = parseFloat(kline.c) - parseFloat(kline.o);
        const changePercent = (change / parseFloat(kline.o)) * 100;
        onPriceUpdate?.(parseFloat(kline.c), change, changePercent);
      } else {
        // Update current candle
        candleSeries.update({
          time: kline.t / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        });
      }
    };

    wsRef.current = ws;

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, timeframe]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <div className="flex justify-between items-center gap-2 px-3 sm:px-4 py-2 border-b border-[#2a2d3a]">
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-all ${
                timeframe === tf.value
                  ? 'bg-teal-500 text-white'
                  : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-all ${
              chartType === 'candlestick'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-all ${
              chartType === 'line'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
          >
            Line
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full relative" />
    </div>
  );
};

export default ModernTradingChart;

