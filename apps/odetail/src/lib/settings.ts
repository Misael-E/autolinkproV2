export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
	[key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
	"/admin(.*)": ["admin"],
	"/employee(.*)": ["admin"],
	"/customer(.*)": ["admin", "member"],
	"/invoice(.*)": ["admin", "member"],
	"/changelog": ["admin", "member"],
	"/appointments(.*)": ["admin", "member"],
	"/list/employees": ["admin", "member"],
	"/list/customers": ["admin", "member"],
	"/list/services": ["admin"],
	"/list/billing": ["admin"],
	"/list/statements(.*)": ["admin"],
	"/list/expense": ["admin"],
	"/list/invoices(.*)": ["admin", "member"],
};
