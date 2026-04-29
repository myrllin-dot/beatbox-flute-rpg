import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
const url = import.meta.env.VITE_API_URL || "/api/trpc";
export const trpc = createTRPCReact<AppRouter>();
