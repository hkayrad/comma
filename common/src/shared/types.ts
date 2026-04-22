export type OverviewViewType = "receivable" | "payable";
export type AvailableCurrency = "TRY" | "USD" | "EUR";

export type ApiResponse<T> = {
	success: boolean;
	data: T | null;
	message: string;
};

export type UUID = string;

export type LogoSize = "small" | "large";

export type Totals = {
	total_debts: number;
	total_payments: number;
	remaining_debt: number;
};

export type ExchangeRates = {
	date: string;
	unixtime: string;
	usd: {
		forexBuying: string;
		forexSelling: string;
	};
	eur: {
		forexBuying: string;
		forexSelling: string;
	};
};

export type InsertResult = {
	affectedRows: number;
	id: string;
};

export type SortItem = {
	id: string;
	desc: boolean;
};

export type FilterItem = {
	id: string;
	value: string | string[] | boolean;
};
