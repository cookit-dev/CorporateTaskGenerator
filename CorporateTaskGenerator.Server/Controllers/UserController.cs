using CorporateTaskGenerator.Server.Database;
using CorporateTaskGenerator.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CorporateTaskGenerator.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            // Check if a user with the same username already exists (case-insensitive)
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == user.Username.ToLower());

            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this username already exists." });
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Find user by username (case-insensitive)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

            if (user == null || user.Password != request.Password)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // For demo: return user info (never return password in production)
            return Ok(new { user.Id, user.Username });
        }

        // DTO for login
        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}