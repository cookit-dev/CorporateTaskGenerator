using System;

namespace CorporateTaskGenerator.Server.Events;

public static class TaskEvent
{
    public static event EventHandler<HighPriorityTaskEventArgs>? HighPriorityTaskChanged;

    public static void OnHighPriorityTaskChanged(HighPriorityTaskEventArgs args)
    {
        HighPriorityTaskChanged?.Invoke(null, args);
    }
}