// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "symbols": [
            [
              "FX:EURUSD|1M|XTVCUSDT"
            ],
            [
              "OANDA:GBPUSD|1M|XTVCUSDT"
            ],
            [
              "OANDA:EURUSD|1M|XTVCUSDT"
            ],
            [
              "FX:GBPUSD|1M|XTVCUSDT"
            ],
            [
              "FX:USDJPY|1M|XTVCUSDT"
            ],
            [
              "OANDA:GBPJPY|1M|XTVCUSDT"
            ],
            [
              "CAPITALCOM:USDJPY|1M|XTVCUSDT"
            ],
            [
              "OANDA:USDJPY|1M|XTVCUSDT"
            ],
            [
              "OANDA:USDJPY|1D|XTVCUSDT"
            ],
            [
              "FOREXCOM:EURUSD|1M|XTVCUSDT"
            ],
            [
              "CAPITALCOM:USDCAD|1M|XTVCUSDT"
            ],
            [
              "FX:AUDUSD|1M|XTVCUSDT"
            ],
            [
              "OANDA:USDCAD|1M|XTVCUSDT"
            ],
            [
              "OANDA:AUDUSD|1M|XTVCUSDT"
            ],
            [
              "OANDA:USDCHF|1M|XTVCUSDT"
            ],
            [
              "OANDA:EURJPY|1M|XTVCUSDT"
            ],
            [
              "OANDA:NZDUSD|1M|XTVCUSDT"
            ],
            [
              "FX:GBPJPY|1M|XTVCUSDT"
            ],
            [
              "FOREXCOM:GBPUSD|1M|XTVCUSDT"
            ],
            [
              "CAPITALCOM:EURUSD|1M|XTVCUSDT"
            ],
            [
              "OANDA:EURGBP|1M|XTVCUSDT"
            ],
            [
              "OANDA:AUDJPY|1M|XTVCUSDT"
            ],
            [
              "FX:USDCAD|1M|XTVCUSDT"
            ]
          ],
          "chartOnly": false,
          "width": "100%",
          "height": "100%",
          "locale": "en",
          "colorTheme": "dark",
          "autosize": true,
          "showVolume": true,
          "showMA": true,
          "hideDateRanges": false,
          "hideMarketStatus": false,
          "hideSymbolLogo": false,
          "scalePosition": "right",
          "scaleMode": "Normal",
          "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
          "fontSize": "10",
          "noTimeScale": false,
          "valuesTracking": "1",
          "changeMode": "price-and-percent",
          "chartType": "area",
          "maLineColor": "#2962FF",
          "maLineWidth": 1,
          "maLength": 9,
          "headerFontSize": "medium",
          "lineWidth": 2,
          "lineType": 0,
          "dateRanges": [
            "1d|1",
            "1m|30",
            "3m|60",
            "12m|1D",
            "60m|1W",
            "all|1M"
          ]
        }`;
      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container mt-10" ref={container} style={{height:"100vh"}}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewWidget);
