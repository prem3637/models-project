import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersDb, SystemUser } from './usersDb';

export const useUsers = () => {
  return useQuery<SystemUser[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return usersDb.getAll();
    }
  });
};

export const useUser = (id: string, enabled = true) => {
  return useQuery<SystemUser | undefined, Error>({
    queryKey: ['user', id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return usersDb.getById(id);
    },
    enabled: enabled && !!id,
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation<SystemUser, Error, Omit<SystemUser, 'id' | 'createdAt'>>({
    mutationFn: async (data) => {
      await new Promise(r => setTimeout(r, 600));
      return usersDb.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation<SystemUser, Error, { id: string; data: Partial<Omit<SystemUser, 'id' | 'createdAt'>> }>({
    mutationFn: async ({ id, data }) => {
      await new Promise(r => setTimeout(r, 600));
      return usersDb.update(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await new Promise(r => setTimeout(r, 500));
      usersDb.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
};
