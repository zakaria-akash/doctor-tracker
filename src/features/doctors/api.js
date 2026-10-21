import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/client";

// Prefixes make it possible to invalidate all affected views after a write.
export const doctorKeys = {
  all: ["doctors"],
  lists: () => [...doctorKeys.all, "list"],
  list: (params) => [...doctorKeys.lists(), params],
  detail: (id) => [...doctorKeys.all, "detail", id],
  patients: (doctorId, params) => [...doctorKeys.all, doctorId, "patients", params],
};

export const metaKeys = { all: ["meta"], options: () => [...metaKeys.all, "options"] };

// Passing TanStack's signal aborts stale searches; previous pages stay visible during navigation.
export const doctorsQuery = (params = {}) =>
  queryOptions({
    queryKey: doctorKeys.list(params),
    queryFn: ({ signal }) => http("doctors", { params, signal }),
    placeholderData: keepPreviousData,
  });

// Detail queries wait until an ID exists; patient lists keep their previous page visible.
export const doctorQuery = (id) =>
  queryOptions({
    queryKey: doctorKeys.detail(id),
    queryFn: ({ signal }) => http(`doctors/${id}`, { signal }),
    enabled: Boolean(id),
  });

export const doctorPatientsQuery = (doctorId, params = {}) =>
  queryOptions({
    queryKey: doctorKeys.patients(doctorId, params),
    queryFn: ({ signal }) => http(`doctors/${doctorId}/patients`, { params, signal }),
    enabled: Boolean(doctorId),
    placeholderData: keepPreviousData,
  });

export const optionsQuery = () =>
  queryOptions({
    queryKey: metaKeys.options(),
    queryFn: ({ signal }) => http("meta/options", { signal }),
  });

// Refresh related collections, dropdown options and dashboard data after mutations.
function refreshPatientViews(queryClient) {
  return Promise.all(
    [["doctors"], ["patients"], ["meta"], ["analytics"]].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

// Creating a doctor can change the list, filter options and dashboard totals.
export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => http("doctors", { method: "POST", body: values }),
    onSuccess: () =>
      Promise.all(
        [doctorKeys.all, metaKeys.all, ["analytics"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}

// Patient changes also refresh doctor counts and all related patient views.
export function useAddDoctorPatient(doctorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => http(`doctors/${doctorId}/patients`, { method: "POST", body: values }),
    onSuccess: () => refreshPatientViews(queryClient),
  });
}

export function useDeleteDoctorPatient(doctorId) {
  const queryClient = useQueryClient();
  return useMutation({
    // The backend permanently deletes this patient record, not just its doctor association.
    mutationFn: (patientId) =>
      http(`doctors/${doctorId}/patients/${patientId}`, { method: "DELETE" }),
    onSuccess: () => refreshPatientViews(queryClient),
  });
}
