namespace LeavePlatform.API.DTOs.Department;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int UserCount { get; set; }
}
