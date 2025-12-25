import express from "express";
import { ExchangeRates } from "@common/types";
import { Logger } from "../lib/utils/logger";
import { authMiddleware } from "../lib/middleware";

function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${day}-${month}-${date.getFullYear()}`;
}

const router = express.Router();

interface TcmbJsonResult {
	totalCount: number;
	items: {
		Tarih: string;
		TP_DK_USD_A_YTL: string;
		TP_DK_USD_S_YTL: string;
		TP_DK_EUR_A_YTL: string;
		TP_DK_EUR_S_YTL: string;
		UNIXTIME: {
			$numberLong: string;
		};
	}[];
}

const series = ["TP.DK.USD.A.YTL", "TP.DK.USD.S.YTL", "TP.DK.EUR.A.YTL", "TP.DK.EUR.S.YTL"];

router.use(authMiddleware);

router.get("/", async (req, res) => {
	try {
		Logger.debug("[TCMB] Fetching exchange rates from TCMB");

		const today = new Date(Date.now());
		const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

		const tcmbEndDate = formatDate(today);
		const tcmbStartDate = formatDate(threeDaysAgo);

		Logger.debug(`TCMB date range: ${tcmbStartDate} to ${tcmbEndDate}`);

		const response = await fetch(
			`${process.env.PROXY_URL}/tcmb?series=${series.join("-")}&startDate=${tcmbStartDate}&endDate=${tcmbEndDate}&type=json&frequency=2`,
			{
				headers: {
					"X-Api-Key": process.env.PROXY_API_KEY || "",
				},
			},
		);

		if (!response.ok) {
			Logger.error("[TCMB] Failed to fetch from TCMB API", {
				status: response.status,
				statusText: response.statusText,
			});
			return res.status(500).json({ success: false, message: "Error fetching TCMB data" });
		}

		const result: TcmbJsonResult = await response.json();

		if (!result || !result.items || result.items.length === 0) {
			Logger.error("[TCMB] No data returned from TCMB API");
			return res.status(500).json({ success: false, message: "No exchange rate data available" });
		}

		const latest = result.items[result.items.length - 1];
		Logger.debug("[TCMB] Processing latest data point", { latest });

		const usd = {
			buy: latest.TP_DK_USD_A_YTL,
			sell: latest.TP_DK_USD_S_YTL,
		};
		const eur = {
			buy: latest.TP_DK_EUR_A_YTL,
			sell: latest.TP_DK_EUR_S_YTL,
		};

		if (!usd.buy || !eur.buy) {
			Logger.error("[TCMB] Missing required currency data in response", { hasUsd: !!usd.buy, hasEur: !!eur.buy });
			return res.status(500).json({ success: false, message: "Missing currency data" });
		}

		const data: ExchangeRates = {
			date: latest.Tarih,
			unixtime: latest.UNIXTIME?.$numberLong || "0",
			usd: {
				forexBuying: usd.buy,
				forexSelling: usd.sell,
			},
			eur: {
				forexBuying: eur.buy,
				forexSelling: eur.sell,
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
