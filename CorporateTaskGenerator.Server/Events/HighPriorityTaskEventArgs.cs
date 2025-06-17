using System;

namespace CorporateTaskGenerator.Server.Events;

public class HighPriorityTaskEventArgs : EventArgs
{
    public int TaskId { get; set; }
    public string Title { get; set; } = "";
    public int UserId { get; set; }
    public string Action { get; set; } = "";
}