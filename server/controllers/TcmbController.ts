import express from "express";
import { ExchangeRates } from "@common/types";
import { Logger } from "../lib/utils/logger";
import { authMiddleware } from "../lib/middleware";

function formatDate(date: Date): string {
	return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
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

		const tcmbTodayDate = formatDate(today);
		Logger.debug(`TCMB date: ${tcmbTodayDate}`);
		const tcmbFourteenDaysAgoDate = formatDate(threeDaysAgo);
		Logger.debug(`TCMB date: ${tcmbFourteenDaysAgoDate}`);

		const response = await fetch(
			`https://proxy.hkayrad.me/tcmb?series=${series.join("-")}&startDate=${tcmbFourteenDaysAgoDate}&endDate=${tcmbTodayDate}&type=json&frequency=2`,
		);

		if (!response.ok) {
			Logger.error("[TCMB] Failed to fetch from TCMB API", {
				response: response,
				status: response.status,
				statusText: response.statusText,
			});
			return res.status(500).json({ success: false, message: "Error fetching TCMB data" });
		}

		const result: TcmbJsonResult = await response.json();
		Logger.debug(result);

		if (!result) {
			Logger.error("[TCMB] Failed to parse response from TCMB API");
			return res.status(500).json({ success: false, message: "Failed to parse response from TCMB API" });
		}

		const latest = result.items[result.totalCount - 1];
		Logger.debug(latest);

		const usd = {
			buy: latest.TP_DK_USD_A_YTL,
			sell: latest.TP_DK_USD_S_YTL,
		};
		const eur = {
			buy: latest.TP_DK_EUR_A_YTL,
			sell: latest.TP_DK_EUR_S_YTL,
		};

		if (!usd || !eur) {
			Logger.error("[TCMB] Missing required currency data", { hasUsd: !!usd, hasEur: !!eur });
			return res.status(500).json({ success: false, message: "Missing currency data" });
		}

		const data: ExchangeRates = {
			date: latest.Tarih,
			unixtime: latest.UNIXTIME.$numberLong,
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
