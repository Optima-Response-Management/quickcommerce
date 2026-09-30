import bcrypt from "bcryptjs";
import mongoose, { HydratedDocument } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { FEATURES } from "../../config/contstants";
import { IUser, User } from "./user.model";
import { CreateUserInput, ListUsersQuery, UpdateAccessInput } from "./user.schema";

type PopulatedCreator = { _id: mongoose.Types.ObjectId; name: string; email: string };

const isDuplicateEmail = (err: unknown) =>
  typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000;

const createdByPayload = (createdBy: IUser["createdBy"] | PopulatedCreator | undefined) => {
  if (!createdBy) return null;
  if (typeof createdBy === "object" && "email" in createdBy) {
    return { id: String(createdBy._id), name: createdBy.name, email: createdBy.email };
  }
  return { id: String(createdBy) };
};

type UserRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: IUser["role"];
  platformAccess: IUser["platformAccess"];
  platforms: IUser["platforms"];
  features: IUser["features"];
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy?: IUser["createdBy"] | PopulatedCreator | null;
  createdAt?: Date;
};

export const toPublicUser = (user: UserRecord) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  platformAccess: user.platformAccess,
  platforms: user.platforms,
  features: user.features,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt ?? null,
  createdBy: createdByPayload(user.createdBy),
  createdAt: user.createdAt ?? null,
});

const resolveFeatures = (role: CreateUserInput["role"], features: CreateUserInput["features"]) =>
  role === "super_admin" ? [...FEATURES] : features;

const resolvePlatforms = (platformAccess: "all" | "custom", platforms: CreateUserInput["platforms"]) =>
  platformAccess === "all" ? [] : platforms;

async function loadUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

// Only the super admin who created the account can change access or delete it.
function assertCanManage(actor: HydratedDocument<IUser>, target: HydratedDocument<IUser>) {
  if (actor.id === target.id) {
    throw new ApiError(403, "You can't manage your own account");
  }
  if (actor.role !== "super_admin") {
    throw new ApiError(403, "Only a super admin can manage this user");
  }
  if (!target.createdBy || String(target.createdBy) !== actor.id) {
    throw new ApiError(403, "Only the super admin who created this user can manage them");
  }
}

export async function createUser(input: CreateUserInput, actor: HydratedDocument<IUser>) {
  if (input.role === "super_admin" && actor.role !== "super_admin") {
    throw new ApiError(403, "Only a super admin can create another super admin");
  }

  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const password = await bcrypt.hash(input.password, 10);

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      password,
      role: input.role,
      platformAccess: input.platformAccess,
      platforms: resolvePlatforms(input.platformAccess, input.platforms),
      features: resolveFeatures(input.role, input.features),
      createdBy: actor._id,
    });

    return toPublicUser(user);
  } catch (err) {
    if (isDuplicateEmail(err)) throw new ApiError(409, "A user with this email already exists");
    throw err;
  }
}

export async function listUsers(query: ListUsersQuery) {
  const { search, role, page, limit } = query;
  const filter: Record<string, unknown> = {};

  if (role) filter.role = role;
  if (search) {
    const term = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: { $regex: term, $options: "i" } }, { email: { $regex: term, $options: "i" } }];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: docs.map((d) => toPublicUser(d as UserRecord)),
    total,
    page,
    limit,
  };
}

export async function updateAccess(id: string, input: UpdateAccessInput, actor: HydratedDocument<IUser>) {
  const target = await loadUser(id);
  assertCanManage(actor, target);

  if (target.role !== "super_admin" && input.features.length === 0) {
    throw new ApiError(400, "Select at least one feature");
  }

  target.platformAccess = input.platformAccess;
  target.platforms = resolvePlatforms(input.platformAccess, input.platforms);
  target.features = target.role === "super_admin" ? [...FEATURES] : input.features;

  await target.save();
  return toPublicUser(target);
}

export async function deleteUser(id: string, actor: HydratedDocument<IUser>) {
  const target = await loadUser(id);
  assertCanManage(actor, target);
  await target.deleteOne();
  return { id: target.id };
}
