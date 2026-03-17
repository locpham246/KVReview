namespace KVReview.API.DTOs.Auth;

public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    /// <summary>restaurant | kol</summary>
    public string Role { get; set; } = "restaurant";

    // For KOL registration
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }

    // For Restaurant registration
    public string? RestaurantName { get; set; }
    public string? Address { get; set; }
    public string? CuisineType { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class TokenResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
