"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "..";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();
