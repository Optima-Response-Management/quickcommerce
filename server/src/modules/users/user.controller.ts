import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ListUsersQuery } from "./user.schema";
import * as userService from "./user.service";

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body, req.user!);
  res.status(201).json(new ApiResponse("User created", { user }));
});

export const listUsersController = asyncHandler(async (req: Request, res: Response) => {
  const query = res.locals.query as ListUsersQuery;
  const result = await userService.listUsers(query);
  res.status(200).json(new ApiResponse("Users fetched", result));
});

export const updateAccessController = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateAccess(req.params.id as string, req.body, req.user!);
  res.status(200).json(new ApiResponse("Access updated", { user }));
});

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id as string, req.user!);
  res.status(200).json(new ApiResponse("User deleted", result));
});
