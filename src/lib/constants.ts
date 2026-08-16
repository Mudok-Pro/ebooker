export const SITE_NAME = "Allo BEM";
export const SITE_NAME_AR = "ألو بيام";
export const SITE_DESCRIPTION = "كتاب رياضيات رقمي للسنة الرابعة متوسط";
export const BOOK_TITLE = "Allo BEM";
export const BOOK_TITLE_AR = "ألو بيام";
export const BOOK_PRICE = 960;
export const BOOK_CURRENCY = "DA";
export const AUTHOR_NAME = "ملياني فاطمة الزهراء";

export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "+213697842678";
export const WHATSAPP_MESSAGE =
  "السلام عليكم، أريد حجز حصة فردية.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const ORDER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const USER_ROLE = {
  STUDENT: "student",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
