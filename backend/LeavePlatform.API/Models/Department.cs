namespace LeavePlatform.API.Models;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }

    public ICollection<User> Users { get; set; } = [];
}
