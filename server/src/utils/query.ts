import type { Model, Document, FilterQuery } from "mongoose";
import { ApiError } from "./ApiError.js";

/** Build a Mongoose sort object from `sort` + `order` query params. */
export function buildSort(sort?: string, order: "asc" | "desc" = "desc"): Record<string, 1 | -1> {
  if (!sort) return { createdAt: order === "asc" ? 1 : -1 };
  return { [sort]: order === "asc" ? 1 : -1 };
}

/** Fetch a document by id that must belong to `userId`, else throw 404. */
export async function findOwnedOrThrow<T extends Document>(
  model: Model<T>,
  id: string,
  userId: string,
  notFoundMsg = "Not found"
): Promise<T> {
  const doc = await model.findOne({ _id: id, user: userId } as FilterQuery<T>);
  if (!doc) throw ApiError.notFound(notFoundMsg);
  return doc;
}

/** Paginate a filter query and return items + meta. */
export async function paginate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  opts: { page: number; limit: number; sort?: Record<string, 1 | -1> }
): Promise<{ items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const { page, limit, sort } = opts;
  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort(sort ?? { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    model.countDocuments(filter),
  ]);
  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
