import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from './modelsService';
import { RBCModel, FilterParams } from './mockDb';

export interface WorldCity {
  country: string;
  geonameid: number;
  name: string;
  subcountry: string;
}

export const useWorldCities = () => {
  return useQuery<WorldCity[], Error>({
    queryKey: ['worldCities'],
    queryFn: async () => {
      const url = 'https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch world cities data');
      }
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useModels = (filters?: FilterParams) => {
  return useQuery<RBCModel[], Error>({
    queryKey: ['models', filters],
    queryFn: () => modelsService.getModels(filters),
  });
};

export const useModel = (id: string, enabled = true) => {
  return useQuery<RBCModel, Error>({
    queryKey: ['model', id],
    queryFn: () => modelsService.getModelById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();
  return useMutation<RBCModel, Error, Omit<RBCModel, 'id' | 'createdAt'>>({
    mutationFn: modelsService.createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  return useMutation<RBCModel, Error, { id: string; data: Partial<Omit<RBCModel, 'id' | 'createdAt'>> }>({
    mutationFn: modelsService.updateModel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['model', data.id] });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: modelsService.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};
