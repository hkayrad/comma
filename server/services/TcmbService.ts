import { ExchangeRates } from "@common/types";
import { Logger } from "../lib/utils/logger";

function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${day}-${month}-${date.getFullYear()}`;
}

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

export class TcmbService {
	static async GetExchangeRates(): Promise<ExchangeRates | null> {
		try {
			Logger.debug("[TCMB Service] Fetching exchange rates from TCMB");

			const today = new Date(Date.now());
			const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

			const tcmbEndDate = formatDate(today);
			const tcmbStartDate = formatDate(threeDaysAgo);

			Logger.debug(`TCMB date range: ${tcmbStartDate} to ${tcmbEndDate}`);

			const proxyUrl = process.env.PROXY_URL;
			const apiKey = process.env.PROXY_API_KEY || "";

			if (!proxyUrl) {
				Logger.error("[TCMB Service] PROXY_URL is not defined in environment variables");
				return null;
			}

			const response = await fetch(
				`${proxyUrl}/tcmb?series=${series.join("-")}&startDate=${tcmbStartDate}&endDate=${tcmbEndDate}&type=json&frequency=2`,
				{
					headers: {
						"X-Api-Key": apiKey,
					},
				},
			);

			if (!response.ok) {
				Logger.error("[TCMB Service] Failed to fetch from TCMB API", {
					status: response.status,
					statusText: response.statusText,
				});
				return null;
			}

			const result: TcmbJsonResult = await response.json();

			if (!result || !result.items || result.items.length === 0) {
				Logger.error("[TCMB Service] No data returned from TCMB API");
				return null;
			}

			const latest = result.items[result.items.length - 1];
			Logger.debug("[TCMB Service] Processing latest data point", { latest });

			const usd = {
				buy: latest.TP_DK_USD_A_YTL,
				sell: latest.TP_DK_USD_S_YTL,
			};
			const eur = {
				buy: latest.TP_DK_EUR_A_YTL,
				sell: latest.TP_DK_EUR_S_YTL,
			};

			if (!usd.buy || !eur.buy) {
				Logger.error("[TCMB Service] Missing required currency data in response", { hasUsd: !!usd.buy, hasEur: !!eur.buy });
				return null;
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

			Logger.debug("[TCMB Service] Exchange rates fetched successfully", { date: data.date });
			return data;
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[TCMB Service] Error fetching TCMB data", { error: error.message });
			return null;
		}
	}
}
