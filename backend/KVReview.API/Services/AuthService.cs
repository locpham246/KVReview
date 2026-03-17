using KVReview.API.Data;
using KVReview.API.DTOs.Auth;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KVReview.API.Services;

public class AuthService
{
    private readonly ApplicationDbContext _db;
    private readonly JwtService _jwt;
    private readonly IConfiguration _config;

    // In-memory refresh token store (production: use DB or Redis)
    private static readonly Dictionary<string, (Guid UserId, DateTime Expiry)> _refreshTokens = new();

    public AuthService(ApplicationDbContext db, JwtService jwt, IConfiguration config)
    {
        _db = db;
        _jwt = jwt;
        _config = config;
    }

    public async Task<TokenResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        if (!Enum.TryParse<UserRole>(dto.Role.ToLower(), out var role))
            throw new ArgumentException("Role must be 'restaurant' or 'kol'.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);

        if (role == UserRole.kol)
        {
            var profile = new KolProfile
            {
                UserId = user.Id,
                DisplayName = dto.DisplayName ?? dto.Email.Split('@')[0],
                Bio = dto.Bio,
                BasePrice = 0
            };
            _db.KolProfiles.Add(profile);
        }
        else if (role == UserRole.restaurant)
        {
            var restaurant = new Restaurant
            {
                UserId = user.Id,
                Name = dto.RestaurantName ?? dto.Email.Split('@')[0],
                Address = dto.Address ?? "Chưa cập nhật"
            };
            _db.Restaurants.Add(restaurant);
        }

        await _db.SaveChangesAsync();
        return GenerateTokenResponse(user);
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        return GenerateTokenResponse(user);
    }

    public async Task<TokenResponseDto> RefreshAsync(string refreshToken)
    {
        if (!_refreshTokens.TryGetValue(refreshToken, out var entry))
            throw new UnauthorizedAccessException("Refresh token không hợp lệ.");

        if (entry.Expiry < DateTime.UtcNow)
        {
            _refreshTokens.Remove(refreshToken);
            throw new UnauthorizedAccessException("Refresh token đã hết hạn.");
        }

        var user = await _db.Users.FindAsync(entry.UserId)
            ?? throw new UnauthorizedAccessException("User không tồn tại.");

        _refreshTokens.Remove(refreshToken);
        return GenerateTokenResponse(user);
    }

    private TokenResponseDto GenerateTokenResponse(User user)
    {
        var accessToken = _jwt.GenerateAccessToken(user);
        var refresh = _jwt.GenerateRefreshToken();
        var expiryDays = int.Parse(_config["Jwt:RefreshExpiryDays"] ?? "7");
        var expiryHours = int.Parse(_config["Jwt:ExpiryHours"] ?? "24");

        _refreshTokens[refresh] = (user.Id, DateTime.UtcNow.AddDays(expiryDays));

        return new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refresh,
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours),
            Role = user.Role.ToString(),
            UserId = user.Id
        };
    }
}
