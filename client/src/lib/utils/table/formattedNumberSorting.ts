import type { Row } from "@tanstack/react-table";

export function formattedNumber(rowA: Row<any>, rowB: Row<any>, columnId: string) {
	const a = parseFloat(String(rowA.getValue(columnId)).replace(/[^\d.-]/g, "")) || 0;
	const b = parseFloat(String(rowB.getValue(columnId)).replace(/[^\d.-]/g, "")) || 0;
	return a > b ? 1 : a < b ? -1 : 0;
}
