import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, values }) => http(`patients/${id}`, { method: "PATCH", body: values }),
    onSuccess: async (response, { id }) => {
      // Reassignment refreshes both doctors' lists; replace the detail snapshot immediately too.
      queryClient.setQueryData(patientKeys.detail(id), response);
      await refreshAffectedViews(queryClient);
      // Server-rendered doctor profiles and dashboard statistics have a separate Next router cache.
      router.refresh();
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  // Nested doctor panels and the global directory show the same records and must move together.
  const matchesLists = (query) =>
    (query.queryKey[0] === "patients" && query.queryKey[1] === "list") ||
    (query.queryKey[0] === "doctors" && query.queryKey[2] === "patients");
  return useMutation({
    mutationFn: (id) => http(`patients/${id}`, { method: "DELETE" }),
    // Snapshot matching list caches so a failed deletion restores exactly what was visible.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ predicate: matchesLists });
      const snapshots = queryClient.getQueriesData({ predicate: matchesLists });
      queryClient.setQueriesData({ predicate: matchesLists }, (old) => {
        if (!Array.isArray(old?.data) || !old.data.some((patient) => patient.id === id)) return old;
        return {
          ...old,
          data: old.data.filter((patient) => patient.id !== id),
          meta: old.meta && { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        };
      });
      return { snapshots };
    },
    // Restore only the failed record, retaining other edits/deletions made while this request ran.
    onError: (_error, id, context) => {
      context?.snapshots.forEach(([key, snapshot]) => {
        const index = snapshot?.data?.findIndex((patient) => patient.id === id) ?? -1;
        if (index < 0) return;
        queryClient.setQueryData(key, (current) => {
          if (!current || current.data.some((patient) => patient.id === id)) return current;
          const data = [...current.data];
          data.splice(Math.min(index, data.length), 0, snapshot.data[index]);
          return {
            ...current,
            data,
            meta: current.meta && { ...current.meta, total: current.meta.total + 1 },
          };
        });
      });
    },
    // A removed record must not remain available to a later cached editor deep link.
    onSuccess: (_response, id) =>
      queryClient.removeQueries({ queryKey: patientKeys.detail(id), exact: true }),
    // Refetch authoritative totals and cross-resource counts whether the delete succeeded or failed.
    onSettled: async () => {
      await refreshAffectedViews(queryClient);
      router.refresh();
    },
  });
}
