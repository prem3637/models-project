import { mockDb, RBCModel, FilterParams } from './mockDb';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const modelsService = {
  getModels: async (filters?: FilterParams): Promise<RBCModel[]> => {
    await delay(600); // simulate API loading
    return mockDb.getAll(filters);
  },

  getModelById: async (id: string): Promise<RBCModel> => {
    await delay(400);
    const model = mockDb.getById(id);
    if (!model) throw new Error('Model not found');
    return model;
  },

  createModel: async (model: Omit<RBCModel, 'id' | 'createdAt'>): Promise<RBCModel> => {
    await delay(800);
    return mockDb.create(model);
  },

  updateModel: async ({ id, data }: { id: string; data: Partial<Omit<RBCModel, 'id' | 'createdAt'>> }): Promise<RBCModel> => {
    await delay(800);
    return mockDb.update(id, data);
  },

  deleteModel: async (id: string): Promise<void> => {
    await delay(700);
    return mockDb.delete(id);
  }
};
