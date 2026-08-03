import { ConflictError, NotFoundError } from "../../common/errors";
import { newId } from "../../common/id";
import type { Color } from "../../db/schema";
import { productsRepo } from "../products/products.repo";
import { colorsRepo } from "./colors.repo";
import type { CreateColorInput, UpdateColorInput } from "./colors.schema";

/** Business layer: rules, invariants and cross-domain orchestration. */
export const colorsBiz = {
  async list(): Promise<Color[]> {
    return colorsRepo.findAll();
  },

  async getById(id: string): Promise<Color> {
    const color = await colorsRepo.findById(id);
    if (!color) throw new NotFoundError(`Color '${id}' not found`);

    return color;
  },

  async create(input: CreateColorInput): Promise<Color> {
    const id = input.id ?? newId();

    if (await colorsRepo.findById(id)) {
      throw new ConflictError(`Color '${id}' already exists`);
    }

    return colorsRepo.create({
      id,
      name: input.name,
      hex: normalizeHex(input.hex),
    });
  },

  async update(id: string, patch: UpdateColorInput): Promise<Color> {
    const current = await colorsBiz.getById(id);

    const changes = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.hex !== undefined ? { hex: normalizeHex(patch.hex) } : {}),
    };

    // An empty patch is a no-op: an UPDATE with no columns is a driver error,
    // not something the caller should be punished for.
    if (Object.keys(changes).length === 0) return current;

    const updated = await colorsRepo.update(id, changes);
    if (!updated) throw new NotFoundError(`Color '${id}' not found`);

    return updated;
  },

  async remove(id: string): Promise<Color> {
    await colorsBiz.getById(id);

    // A colour still worn by a product cannot be dropped — the products table
    // holds a foreign key to it.
    const inUse = await productsRepo.countByColorId(id);
    if (inUse > 0) {
      throw new ConflictError(
        `Color '${id}' is used by ${inUse} product(s) and cannot be deleted`,
      );
    }

    const removed = await colorsRepo.remove(id);
    if (!removed) throw new NotFoundError(`Color '${id}' not found`);

    return removed;
  },
};

const normalizeHex = (hex: string): string => hex.trim().toLowerCase();
