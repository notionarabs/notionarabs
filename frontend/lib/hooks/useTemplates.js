import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// Query keys
export const templateKeys = {
  all: ['templates'],
  lists: () => [...templateKeys.all, 'list'],
  list: (filters) => [...templateKeys.lists(), { filters }],
  details: () => [...templateKeys.all, 'detail'],
  detail: (id) => [...templateKeys.details(), id],
  categories: () => [...templateKeys.all, 'categories'],
  featured: () => [...templateKeys.all, 'featured'],
  byCreator: (creatorId) => [...templateKeys.all, 'creator', creatorId],
};

// Templates queries
export const useTemplates = (params = {}) => {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/templates', { params });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useTemplate = (id) => {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useFeaturedTemplates = () => {
  return useQuery({
    queryKey: templateKeys.featured(),
    queryFn: async () => {
      const response = await api.get('/templates?limit=6&sortBy=downloads&sortOrder=desc');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: templateKeys.categories(),
    queryFn: async () => {
      const response = await api.get('/templates/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Template mutations
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData) => {
      const response = await api.post('/templates', templateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...templateData }) => {
      const response = await api.put(`/templates/${id}`, templateData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      queryClient.setQueryData(templateKeys.detail(variables.id), data);
    },
  });
};

export const useDownloadTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateId) => {
      const response = await api.post(`/templates/${templateId}/download`);
      return response.data;
    },
    onSuccess: (data, templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.featured() });
    },
  });
};
