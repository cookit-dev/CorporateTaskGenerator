using CorporateTaskGenerator.Server.Database;
using CorporateTaskGenerator.Server.Middleware;
using Microsoft.EntityFrameworkCore;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
using CorporateTaskGenerator.Server.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });


// Configure SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFile("Logs/app-{Date}.log");

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//      .AddJwtBearer(options =>
//      {
//          options.TokenValidationParameters = new TokenValidationParameters
//          {
//              ValidateIssuer = true,
//              ValidateAudience = true,
//              ValidateLifetime = true,
//              ValidateIssuerSigningKey = true,
//              ValidIssuer = "yourIssuer",
//              ValidAudience = "yourAudience",
//              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("yourSuperSecretKey"))
//          };
//      });

TaskEvent.HighPriorityTaskChanged += (sender, args) =>
{
    var logger = builder.Services.BuildServiceProvider().GetRequiredService<ILoggerFactory>().CreateLogger("HighPriorityTaskLogger");
    logger.LogCritical("CRITICAL EVENT: High priority task {Action}. TaskId: {TaskId}, Title: {Title}, UserId: {UserId}",
        args.Action, args.TaskId, args.Title, args.UserId);
};


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();