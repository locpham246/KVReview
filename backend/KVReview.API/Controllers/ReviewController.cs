using System.Security.Claims;
using KVReview.API.DTOs.Review;
using KVReview.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KVReview.API.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>Nhà hàng tạo review sau khi booking completed</summary>
    [HttpPost]
    [Authorize(Roles = "restaurant")]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var result = await _reviewService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetByKol), new { kolId = Guid.Empty }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Lấy tất cả reviews của một KOL</summary>
    [HttpGet("kol/{kolId:guid}")]
    public async Task<IActionResult> GetByKol(Guid kolId)
    {
        var result = await _reviewService.GetByKolAsync(kolId);
        return Ok(result);
    }
}
