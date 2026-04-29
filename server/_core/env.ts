export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",  // 第一個註冊的 admin email
  isProduction: process.env.NODE_ENV === "production",
};
