using CorporateTaskGenerator.Server.Models;
using Microsoft.EntityFrameworkCore;
using Task = CorporateTaskGenerator.Server.Models.Task;

namespace CorporateTaskGenerator.Server.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Task> Tasks { get; set; }
        public DbSet<User> Users { get; set; }
    }
}