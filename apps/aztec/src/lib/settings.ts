export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/employee(.*)": ["admin"],
  "/customer(.*)": ["admin", "member"],
  "/invoice(.*)": ["admin", "member"],
  "/appointment(.*)": ["admin", "member"],
  "/list/employees": ["admin", "member"],
  "/list/customers": ["admin", "member"],
  "/list/services": ["admin", "member"],
  "/list/billing": ["admin"],
  "/list/statements(.*)": ["admin"],
  "/list/expense": ["admin", "member"],
  "/list/invoices(.*)": ["admin", "member"],
};
