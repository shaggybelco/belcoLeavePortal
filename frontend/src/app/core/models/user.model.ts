export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Employee' | 'Manager' | 'Admin';
  department?: string;
  departmentId?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
  managerId?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
  managerId?: string;
  isActive: boolean;
}
