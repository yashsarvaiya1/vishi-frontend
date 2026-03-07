// hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userService } from '@/services/userService'
import type { CreateUserPayload, UpdateUserPayload, UsersQueryParams } from '@/models/user'


export const USER_KEYS = {
  all:            ['users'] as const,
  list:           (p: object) => ['users', 'list', p] as const,
  detail:         (id: number) => ['users', id] as const,
  participations: (id: number) => ['users', id, 'participations'] as const,  // ← ADDED M4
}


export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: USER_KEYS.list(params ?? {}),
    queryFn:  () => userService.list(params).then((r) => r.data),
  })
}


export function useUser(id: number) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn:  () => userService.get(id).then((r) => r.data),
    enabled:  !!id,
  })
}


export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all })
      toast.success('User created.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to create user.'),
  })
}


export function useUpdateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => userService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all })
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) })
      toast.success('User updated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to update user.'),
  })
}


export function useDeactivateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => userService.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all })
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) })
      toast.success('User deactivated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to deactivate user.'),
  })
}


export function useActivateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => userService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all })
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) })
      toast.success('User activated.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to activate user.'),
  })
}


export function useClearUserPassword(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => userService.clearPassword(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) })
      toast.success('Password cleared. User must set a new one on next login.')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? 'Failed to clear password.'),
  })
}


// M4 — admin view of a specific user's all vishi slots + balances
export function useUserParticipations(id: number) {
  return useQuery({
    queryKey: USER_KEYS.participations(id),
    queryFn:  () => userService.getParticipations(id).then((r) => r.data),
    enabled:  !!id,
  })
}
