import { apiGet, apiPost, apiPut, apiDelete } from '@/servies/api';

/**
 * Fetch all employees for a store
 */
export const fetchEmployees = async (storeId) => {
  const response = await apiGet(`/store/${storeId}/employees`);
  return response;
};

/**
 * Invite an employee by email + role
 */
export const inviteEmployee = async (storeId, { email, roleId }) => {
  const response = await apiPost(`/store/${storeId}/employees`, { email, roleId });
  return response;
};

/**
 * Update employee role or status
 */
export const updateEmployee = async (storeId, employeeId, data) => {
  const response = await apiPut(`/store/${storeId}/employees/${employeeId}`, data);
  return response;
};

/**
 * Suspend an employee
 */
export const suspendEmployee = async (storeId, employeeId) => {
  const response = await apiPost(`/store/${storeId}/employees/${employeeId}/suspend`);
  return response;
};

/**
 * Reactivate a suspended employee
 */
export const reactivateEmployee = async (storeId, employeeId) => {
  const response = await apiPost(`/store/${storeId}/employees/${employeeId}/reactivate`);
  return response;
};

/**
 * Remove an employee from the store (membership only, preserves global User)
 */
export const removeEmployee = async (storeId, employeeId) => {
  const response = await apiDelete(`/store/${storeId}/employees/${employeeId}`);
  return response;
};
