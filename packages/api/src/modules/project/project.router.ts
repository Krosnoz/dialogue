import { protectedProcedure, router } from "@dialogue/api/server";
import {
	deleteProjectDto,
	getProjectByIdDto,
	renameProjectDto,
} from "@dialogue/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { projectService } from "./project.service";

export const projectRouter = router({
	getById: protectedProcedure
		.input(getProjectByIdDto)
		.query(async ({ input, ctx }) => {
			return await projectService.getById(input.projectId, ctx.session.user.id);
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return await projectService.list(ctx.session.user.id);
	}),

	listRecent: protectedProcedure.query(async ({ ctx }) => {
		return await projectService.listRecent(ctx.session.user.id);
	}),

	delete: protectedProcedure
		.input(deleteProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await projectService.delete(input, ctx.session.user.id);
		}),

	rename: protectedProcedure
		.input(renameProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await projectService.rename(input, ctx.session.user.id);
		}),
});

export type ProjectRouter = typeof projectRouter;
export type ProjectInputs = inferRouterInputs<ProjectRouter>;
export type ProjectOutputs = inferRouterOutputs<ProjectRouter>;
