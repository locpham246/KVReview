using System.Security.Claims;
using KVReview.API.DTOs.Restaurant;
using KVReview.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KVReview.API.Controllers;

[ApiController]
[Route("api/restaurants")]
[Authorize(Roles = "restaurant")]
public class RestaurantController : ControllerBase
{
    private readonly RestaurantService _restaurantService;

    public RestaurantController(RestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    /// <summary>Lấy profile nhà hàng hiện tại</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _restaurantService.GetByUserIdAsync(userId);
        if (result == null) return NotFound(new { message = "Profile nhà hàng không tồn tại." });
        return Ok(result);
    }

    /// <summary>Cập nhật profile nhà hàng</summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateRestaurantDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _restaurantService.UpdateAsync(userId, dto);
        if (result == null) return NotFound(new { message = "Profile nhà hàng không tồn tại." });
        return Ok(result);
    }
}
