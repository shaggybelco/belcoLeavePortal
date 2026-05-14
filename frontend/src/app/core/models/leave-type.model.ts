export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  isActive: boolean;
}

export interface CreateLeaveTypeRequest {
  name: string;
  defaultDays: number;
}

export interface UpdateLeaveTypeRequest {
  name: string;
  defaultDays: number;
  isActive: boolean;
}
