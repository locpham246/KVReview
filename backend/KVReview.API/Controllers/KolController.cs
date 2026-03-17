using System.Security.Claims;
using KVReview.API.DTOs.Kol;
using KVReview.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KVReview.API.Controllers;

[ApiController]
[Route("api/kols")]
public class KolController : ControllerBase
{
    private readonly KolService _kolService;

    public KolController(KolService kolService)
    {
        _kolService = kolService;
    }

    /// <summary>Tìm kiếm KOL theo khu vực, platform, giá, tier</summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Search([FromQuery] KolSearchQueryDto query)
    {
        var result = await _kolService.SearchAsync(query);
        return Ok(result);
    }

    /// <summary>Top 50 KOL ranking (cached 1h)</summary>
    [HttpGet("ranking")]
    public async Task<IActionResult> GetRanking()
    {
        var result = await _kolService.GetRankingAsync();
        return Ok(result);
    }

    /// <summary>Chi tiết profile một KOL</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _kolService.GetByIdAsync(id);
        if (result == null) return NotFound(new { message = "KOL không tìm thấy." });
        return Ok(result);
    }

    /// <summary>KOL cập nhật profile của mình</summary>
    [HttpPut("profile")]
    [Authorize(Roles = "kol")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateKolProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _kolService.UpdateProfileAsync(userId, dto);
        if (result == null) return NotFound(new { message = "Profile KOL không tồn tại." });
        return Ok(result);
    }
}
