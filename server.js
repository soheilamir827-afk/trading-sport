const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    name: "Trading Sport API",
    status: "online"
  });
});

app.get("/api/prices", async (req, res) => {
  try {
    const symbols = [
      "BTCUSDT",
      "ETHUSDT",
      "BNBUSDT",
      "SOLUSDT",
      "XRPUSDT",
      "DOGEUSDT",
      "TRXUSDT",
      "ADAUSDT",
      "TONUSDT"
    ];

    const [nobitexResponse, binanceResponse] =
      await Promise.all([
        fetch(
          "https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls"
        ),
        fetch(
          "https://api.binance.com/api/v3/ticker/price"
        )
      ]);

    if (!nobitexResponse.ok || !binanceResponse.ok) {
      throw new Error("Price provider unavailable");
    }

    const nobitex = await nobitexResponse.json();
    const binance = await binanceResponse.json();

    const usdtRial =
      Number(nobitex.stats?.["usdt-rls"]?.latest);

    if (!Number.isFinite(usdtRial) || usdtRial <= 0) {
      throw new Error("USDT price unavailable");
    }

    const usdtToman = usdtRial / 10;

    const prices = {};

    for (const symbol of symbols) {
      const item = binance.find(
        x => x.symbol === symbol
      );

      if (item) {
        prices[symbol.replace("USDT", "")] =
          Number(item.price) * usdtToman;
      }
    }

    prices.USDT = usdtToman;

    res.json({
      success: true,
      currency: "TOMAN",
      updatedAt: new Date().toISOString(),
      prices
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Trading Sport API running on port " + PORT);
});
