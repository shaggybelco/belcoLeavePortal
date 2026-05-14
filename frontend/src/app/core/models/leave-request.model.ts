export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  employeeComment?: string;
  managerComment?: string;
  reviewedByName?: string;
  createdAt: string;
}

export interface CreateLeaveRequestRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  employeeComment?: string;
}

export interface ReviewLeaveRequestRequest {
  action: 'Approved' | 'Rejected';
  managerComment?: string;
}
