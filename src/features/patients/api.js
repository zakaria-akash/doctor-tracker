import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/client";

// Shared key prefixes let mutations refresh every affected patient view.
export const patientKeys = {
  all: ["patients"],
  lists: () => [...patientKeys.all, "list"],
  list: (params) => [...patientKeys.lists(), params],
  detail: (id) => [...patientKeys.all, "detail", id],
};

// Cancel stale requests and retain the previous page while a new one loads.
export const patientsQuery = (params = {}) =>
  queryOptions({
    queryKey: patientKeys.list(params),
    queryFn: ({ signal }) => http("patients", { params, signal }),
    placeholderData: keepPreviousData,
  });

// Do not request a detail record until the selected patient has an ID.
export const patientQuery = (id) =>
  queryOptions({
    queryKey: patientKeys.detail(id),
    queryFn: ({ signal }) => http(`patients/${id}`, { signal }),
    enabled: Boolean(id),
  });

// Patient writes may also change doctor counts, filter options and analytics.
function refreshAffectedViews(queryClient) {
  return Promise.all(
    [patientKeys.all, ["doctors"], ["meta"], ["analytics"]].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => http(`patients/${id}`, { method: "PATCH", body: values }),
    onSuccess: () => refreshAffectedViews(queryClient),
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => http(`patients/${id}`, { method: "DELETE" }),
    // Snapshot matching list caches so a failed deletion restores exactly what was visible.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      const snapshots = queryClient.getQueriesData({ queryKey: patientKeys.lists() });
      queryClient.setQueriesData({ queryKey: patientKeys.lists() }, (old) => {
        if (!Array.isArray(old?.data) || !old.data.some((patient) => patient.id === id)) return old;
        return {
          ...old,
          data: old.data.filter((patient) => patient.id !== id),
          meta: old.meta && { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        };
      });
      return { snapshots };
    },
    // Restore cached lists when the backend rejects the optimistic deletion.
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    // Refetch authoritative totals and cross-resource counts whether the delete succeeded or failed.
    onSettled: () => refreshAffectedViews(queryClient),
  });
}
