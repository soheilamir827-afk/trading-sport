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
    const response = await fetch(
      "https://api.coinbase.com/v2/prices/BTC-USD/spot"
    );

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: "Bitcoin price source unavailable",
        status: response.status
      });
    }

    const data = await response.json();
    const btcUsd = Number(data.data.amount);

    if (!Number.isFinite(btcUsd) || btcUsd <= 0) {
      throw new Error("Invalid Bitcoin price");
    }

    const usdtResponse = await fetch(
      "https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls"
    );

    if (!usdtResponse.ok) {
      return res.status(502).json({
        success: false,
        error: "Nobitex price source unavailable",
        status: usdtResponse.status
      });
    }

    const usdtData = await usdtResponse.json();
    const usdtRial = Number(
      usdtData.stats?.["usdt-rls"]?.latest
    );

    if (!Number.isFinite(usdtRial) || usdtRial <= 0) {
      throw new Error("Invalid USDT price");
    }

    const usdtToman = usdtRial / 10;
    const btcToman = btcUsd * usdtToman;

    res.json({
      success: true,
      currency: "TOMAN",
      updatedAt: new Date().toISOString(),
      prices: {
        BTC: btcToman
      },
      details: {
        BTC_USD: btcUsd,
        USDT_TOMAN: usdtToman
      }
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
