namespace LeavePlatform.API.Models;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public required string Action { get; set; }
    public required string EntityType { get; set; }
    public required string EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
