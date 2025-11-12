import express from "express";
import { parseStringPromise } from "xml2js";
import { authMiddleware } from "../lib/utils/middleware";
import { ExchangeRates } from "@common/types";
import { Logger } from "../lib/utils";

const router = express.Router();

interface CurrencyData {
	$: { Kod: string };
	ForexBuying: string[];
	ForexSelling: string[];
	BanknoteBuying: string[];
	BanknoteSelling: string[];
}

interface TcmbXmlResult {
	Tarih_Date: {
		$: { Tarih: string };
		Currency: CurrencyData[];
	};
}

router.use(authMiddleware);

router.get("/", async (req, res) => {
	try {
		Logger.debug("[TCMB] Fetching exchange rates from TCMB");

		const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");

		if (!response.ok) {
			Logger.error("[TCMB] Failed to fetch from TCMB API", {
				status: response.status,
				statusText: response.statusText,
			});
			return res.status(500).json({ success: false, message: "Error fetching TCMB data" });
		}

		const xmlData = await response.text();
		const result = (await parseStringPromise(xmlData)) as TcmbXmlResult;

		const currencies = result.Tarih_Date.Currency;

		const usd = currencies.find((c: CurrencyData) => c.$.Kod === "USD");
		const eur = currencies.find((c: CurrencyData) => c.$.Kod === "EUR");
		const gbp = currencies.find((c: CurrencyData) => c.$.Kod === "GBP");

		if (!usd || !eur || !gbp) {
			Logger.error("[TCMB] Missing required currency data", { hasUsd: !!usd, hasEur: !!eur, hasGbp: !!gbp });
			return res.status(500).json({ success: false, message: "Missing currency data" });
		}

		const data: ExchangeRates = {
			date: result.Tarih_Date.$.Tarih,
			usd: {
				forexBuying: usd.ForexBuying[0],
				forexSelling: usd.ForexSelling[0],
				banknoteBuying: usd.BanknoteBuying[0],
				banknoteSelling: usd.BanknoteSelling[0],
			},
			eur: {
				forexBuying: eur.ForexBuying[0],
				forexSelling: eur.ForexSelling[0],
				banknoteBuying: eur.BanknoteBuying[0],
				banknoteSelling: eur.BanknoteSelling[0],
			},
			gbp: {
				forexBuying: gbp.ForexBuying[0],
				forexSelling: gbp.ForexSelling[0],
				banknoteBuying: gbp.BanknoteBuying[0],
				banknoteSelling: gbp.BanknoteSelling[0],
			},
		};

		Logger.debug("[TCMB] Exchange rates fetched successfully", { date: data.date });
		res.send(data);
	} catch (error: any) {
		Logger.error("[TCMB] Error fetching TCMB data", { error: error.message });
		res.status(500).json({ success: false, message: "Error fetching TCMB data" });
	}
});

export default router;
