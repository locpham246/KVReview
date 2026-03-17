using System.Text;
using Hangfire;
using Hangfire.PostgreSql;
using KVReview.API.Data;
using KVReview.API.Jobs;
using KVReview.API.Services;
using KVReview.API.Workers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ─── Database (PostgreSQL + PostGIS) ───────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseNetTopologySuite()));

// ─── Redis Cache ────────────────────────────────────────────────────────────
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "kvreview:";
});

// ─── Hangfire ───────────────────────────────────────────────────────────────
// Dùng chính PostgreSQL đang có để lưu job queue (schema: hangfire)
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(connectionString)));

// Hangfire Server: số process workers, queue mặc định
builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 5;            // 5 job workers chạy song song
    options.Queues = new[] { "critical", "default", "low" };
});

// ─── Background Worker Service (.NET built-in) ──────────────────────────────
// SocialMetricsWorker chạy song song với Hangfire, không phụ thuộc vào nhau
builder.Services.AddHostedService<SocialMetricsWorker>();

// ─── JWT Authentication ─────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// ─── CORS ───────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost",
                "http://frontend:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ─── Application Services ────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<KolService>();
builder.Services.AddScoped<RestaurantService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReviewService>();

// Hangfire Jobs cũng cần register để DI có thể inject đúng
builder.Services.AddScoped<KolRankingJob>();

// ─── Controllers + Swagger ──────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "KVReview API",
        Version = "v1",
        Description = "Marketplace kết nối nhà hàng với KOL ẩm thực"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Enter: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ─── Build App ──────────────────────────────────────────────────────────────
var app = builder.Build();

// ─── Auto-migrate on startup ─────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "KVReview API v1");
        c.RoutePrefix = "swagger";
    });
}

// ─── Hangfire Dashboard ───────────────────────────────────────────────────────
// Truy cập tại: http://localhost:8080/hangfire
// Trong production nên thêm Authorization filter để bảo mật dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    DashboardTitle = "KVReview — Job Dashboard",
    // Cho phép xem mà không cần auth (chỉ dùng cho development/demo)
    Authorization = []
});

// ─── Register Recurring Jobs ──────────────────────────────────────────────────
// Chạy mỗi giờ: 0 * * * *  → Cron expression
RecurringJob.AddOrUpdate<KolRankingJob>(
    recurringJobId: "kol-ranking-update",
    methodCall: job => job.ExecuteAsync(),
    cronExpression: "0 * * * *",    // Every hour at minute 0
    options: new RecurringJobOptions
    {
        TimeZone = TimeZoneInfo.Utc
    });

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
