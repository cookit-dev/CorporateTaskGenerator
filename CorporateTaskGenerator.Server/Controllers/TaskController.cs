using CorporateTaskGenerator.Server.Database;
using CorporateTaskGenerator.Server.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Task = CorporateTaskGenerator.Server.Models.Task;

namespace CorporateTaskGenerator.Server.Controllers
{
    [ApiController]
    //[Authorize] // Require authentication for all actions
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TaskController> _logger;

        public TaskController(AppDbContext context, ILogger<TaskController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/task/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Task>> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    _logger.LogInformation("Task with id {TaskId} not found.", id);
                    return NotFound();
                }

                _logger.LogInformation("Successfully retrieved task with id {TaskId}.", id);
                return task;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving the task with id {TaskId}.", id);
                return StatusCode(500, "An error occurred while retrieving the task.");
            }
        }

        // GET: api/task
        [HttpGet]
        public IActionResult GetTasks(int page = 1, int pageSize = 10, string? sortBy = null, string? sortDir = "asc", string? search = null)
        {
            try
            {
                _logger.LogInformation("Retrieving tasks. Page: {Page}, PageSize: {PageSize}, SortBy: {SortBy}, SortDir: {SortDir}, Search: {Search}", page, pageSize, sortBy, sortDir, search);

                var query = _context.Tasks.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    _logger.LogInformation("Applying search filter: {Search}", search);
                    query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));
                }

                if (!string.IsNullOrEmpty(sortBy))
                {
                    bool descending = sortDir?.ToLower() == "desc";
                    _logger.LogInformation("Applying sorting. SortBy: {SortBy}, Descending: {Descending}", sortBy, descending);
                    query = sortBy switch
                    {
                        "title" => descending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
                        "priority" => descending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
                        "dueDate" => descending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
                        "status" => descending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
                        "userId" => descending ? query.OrderByDescending(t => t.UserId) : query.OrderBy(t => t.UserId),
                        _ => query
                    };
                }

                var total = query.Count();
                _logger.LogInformation("Total tasks after filtering: {Total}", total);

                var tasks = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                _logger.LogInformation("Returning {Count} tasks for page {Page}.", tasks.Count, page);

                return Ok(new { total, tasks });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving tasks.");
                return StatusCode(500, "An error occurred while retrieving tasks.");
            }
        }


        // POST: api/task
        [HttpPost]
        public async Task<ActionResult<Task>> CreateTask([FromBody] Task task)
        {
            try
            {
                _logger.LogInformation("Creating a new task with title: {Title}, userId: {UserId}", task.Title, task.UserId);

                // trim white spce
                if (task.Description != null)
                {
                    task.Description = task.Description.Trim();
                }
                task.Title = task.Title.Trim();

                if (task.Priority.ToString().Equals("High", StringComparison.OrdinalIgnoreCase))
                {
                    TaskEvent.OnHighPriorityTaskChanged(new HighPriorityTaskEventArgs
                    {
                        TaskId = task.Id,
                        Title = task.Title,
                        UserId = task.UserId,
                        Action = "Created"
                    });
                }

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Task created successfully with id: {TaskId}", task.Id);

                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a task.");
                return StatusCode(500, "An error occurred while creating the task.");
            }
        }

        // DELETE: api/task/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Attempting to delete task with id {TaskId}.", id);
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    _logger.LogWarning("Task with id {TaskId} not found for deletion.", id);
                    return NotFound();
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Task with id {TaskId} deleted successfully.", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting the task with id {TaskId}.", id);
                return StatusCode(500, "An error occurred while deleting the task.");
            }
        }

        // PUT: api/task/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] Task updatedTask)
        {
            try
            {
                if (id != updatedTask.Id)
                {
                    _logger.LogWarning("UpdateTask: Mismatched id in route ({RouteId}) and body ({BodyId}).", id, updatedTask.Id);
                    return BadRequest();
                }

                _logger.LogInformation("UpdateTask: Attempting to update task with id {TaskId}.", id);
                _context.Entry(updatedTask).State = EntityState.Modified;

                try
                {
                    if (updatedTask.Priority.ToString().Equals("High", StringComparison.OrdinalIgnoreCase))
                    {
                        TaskEvent.OnHighPriorityTaskChanged(new HighPriorityTaskEventArgs
                        {
                            TaskId = updatedTask.Id,
                            Title = updatedTask.Title,
                            UserId = updatedTask.UserId,
                            Action = "Updated"
                        });
                    }

                    await _context.SaveChangesAsync();
                    _logger.LogInformation("UpdateTask: Successfully updated task with id {TaskId}.", id);
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    if (!TaskExists(id))
                    {
                        _logger.LogWarning("UpdateTask: Task with id {TaskId} not found during update.", id);
                        return NotFound();
                    }
                    else
                    {
                        _logger.LogError(ex, "UpdateTask: Concurrency exception while updating task with id {TaskId}.", id);
                        throw;
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating the task with id {TaskId}.", id);
                return StatusCode(500, "An error occurred while updating the task.");
            }
        }

        // GET: api/task/status-summary
        [HttpGet("status-summary")]
        public IActionResult GetTaskStatusSummary()
        {
            try
            {
                var summary = _context.Tasks
                    .GroupBy(t => t.Status)
                    .Select(g => new { status = g.Key.ToString(), count = g.Count() })
                    .ToList();

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving task status summary.");
                return StatusCode(500, "An error occurred while retrieving task status summary.");
            }
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}