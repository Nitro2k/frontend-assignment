import { ConflictError, NotFoundError } from "../../common/errors";
import { newId } from "../../common/id";
import type { Size } from "../../db/schema";
import { productsRepo } from "../products/products.repo";
import { sizesRepo } from "./sizes.repo";
import type { CreateSizeInput, UpdateSizeInput } from "./sizes.schema";

/** Business layer: rules, invariants and cross-domain orchestration. */
export const sizesBiz = {
  async list(): Promise<Size[]> {
    return sizesRepo.findAll();
  },

  async getById(id: string): Promise<Size> {
    const size = await sizesRepo.findById(id);
    if (!size) throw new NotFoundError(`Size '${id}' not found`);

    return size;
  },

  async create(input: CreateSizeInput): Promise<Size> {
    const id = input.id ?? newId();

    if (await sizesRepo.findById(id)) {
      throw new ConflictError(`Size '${id}' already exists`);
    }

    return sizesRepo.create({ id, name: input.name, value: input.value });
  },

  async update(id: string, patch: UpdateSizeInput): Promise<Size> {
    const current = await sizesBiz.getById(id);

    const changes = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.value !== undefined ? { value: patch.value } : {}),
    };

    // An empty patch is a no-op: an UPDATE with no columns is a driver error,
    // not something the caller should be punished for.
    if (Object.keys(changes).length === 0) return current;

    const updated = await sizesRepo.update(id, changes);
    if (!updated) throw new NotFoundError(`Size '${id}' not found`);

    return updated;
  },

  async remove(id: string): Promise<Size> {
    await sizesBiz.getById(id);

    const inUse = await productsRepo.countBySizeId(id);
    if (inUse > 0) {
      throw new ConflictError(
        `Size '${id}' is used by ${inUse} product(s) and cannot be deleted`,
      );
    }

    const removed = await sizesRepo.remove(id);
    if (!removed) throw new NotFoundError(`Size '${id}' not found`);

    return removed;
  },
};
