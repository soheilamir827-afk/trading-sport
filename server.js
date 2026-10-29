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
  const results = {};

  try {
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price"
    );

    results.binance = {
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();

      for (const symbol of [
        "BTCUSDT",
        "ETHUSDT",
        "BNBUSDT",
        "SOLUSDT",
        "XRPUSDT",
        "DOGEUSDT",
        "TRXUSDT",
        "ADAUSDT",
        "TONUSDT"
      ]) {
        const item = data.find(x => x.symbol === symbol);

        if (item) {
          results[symbol.replace("USDT", "")] =
            Number(item.price);
        }
      }
    }
  } catch (error) {
    results.binanceError = error.message;
  }

  try {
    const response = await fetch(
      "https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls"
    );

    results.nobitex = {
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.nobitexData = data.stats?.["usdt-rls"] || null;
    }
  } catch (error) {
    results.nobitexError = error.message;
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Trading Sport API running on port " + PORT);
});
