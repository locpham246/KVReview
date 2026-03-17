using KVReview.API.Data;
using KVReview.API.DTOs.Kol;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using NetTopologySuite.Geometries;
using System.Text.Json;

namespace KVReview.API.Services;

public class KolService
{
    private readonly ApplicationDbContext _db;
    private readonly IDistributedCache _cache;

    public KolService(ApplicationDbContext db, IDistributedCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<List<KolProfileDto>> SearchAsync(KolSearchQueryDto query)
    {
        var kolQuery = _db.KolProfiles
            .Include(k => k.SocialMetrics)
            .AsQueryable();

        // Geo filter
        if (query.Lat.HasValue && query.Lng.HasValue)
        {
            var point = new Point(query.Lng.Value, query.Lat.Value) { SRID = 4326 };
            var radiusMeters = query.RadiusKm * 1000;
            kolQuery = kolQuery.Where(k => k.Location != null && k.Location.IsWithinDistance(point, radiusMeters));
        }

        // Platform filter
        if (!string.IsNullOrEmpty(query.Platform))
        {
            var p = query.Platform.ToLower();
            kolQuery = kolQuery.Where(k => k.Platforms.Contains(p));
        }

        // Price filter
        if (query.MinPrice.HasValue)
            kolQuery = kolQuery.Where(k => k.BasePrice >= query.MinPrice.Value);
        if (query.MaxPrice.HasValue)
            kolQuery = kolQuery.Where(k => k.BasePrice <= query.MaxPrice.Value);

        // Tier filter
        if (!string.IsNullOrEmpty(query.Tier) && Enum.TryParse<KolTier>(query.Tier.ToLower(), out var tier))
            kolQuery = kolQuery.Where(k => k.Tier == tier);

        var kols = await kolQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        Point? refPoint = (query.Lat.HasValue && query.Lng.HasValue)
            ? new Point(query.Lng!.Value, query.Lat!.Value) { SRID = 4326 }
            : null;

        return kols.Select(k => MapToDto(k, refPoint)).ToList();
    }

    public async Task<KolProfileDto?> GetByIdAsync(Guid kolId)
    {
        var kol = await _db.KolProfiles
            .Include(k => k.SocialMetrics)
            .FirstOrDefaultAsync(k => k.UserId == kolId);

        return kol == null ? null : MapToDto(kol, null);
    }

    public async Task<List<KolRankingItemDto>> GetRankingAsync()
    {
        const string cacheKey = "kol_ranking";
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<List<KolRankingItemDto>>(cached)!;

        var kols = await _db.KolProfiles
            .Include(k => k.SocialMetrics)
            .Where(k => k.AvgEngagementRate.HasValue)
            .OrderByDescending(k => k.AvgEngagementRate)
            .Take(50)
            .ToListAsync();

        var result = kols.Select((k, idx) => new KolRankingItemDto
        {
            UserId = k.UserId,
            DisplayName = k.DisplayName,
            BasePrice = k.BasePrice,
            Tier = k.Tier?.ToString(),
            AvgEngagementRate = k.AvgEngagementRate,
            TotalFollowers = k.SocialMetrics.Sum(m => m.FollowersCount),
            Rank = idx + 1
        }).ToList();

        var opts = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        };
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), opts);

        return result;
    }

    public async Task<KolProfileDto?> UpdateProfileAsync(Guid userId, UpdateKolProfileDto dto)
    {
        var kol = await _db.KolProfiles.Include(k => k.SocialMetrics).FirstOrDefaultAsync(k => k.UserId == userId);
        if (kol == null) return null;

        if (dto.DisplayName != null) kol.DisplayName = dto.DisplayName;
        if (dto.Bio != null) kol.Bio = dto.Bio;
        if (dto.Platforms != null) kol.Platforms = dto.Platforms;

        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
            kol.Location = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };

        RecalculatePricing(kol);
        await _db.SaveChangesAsync();

        // Invalidate ranking cache
        await _cache.RemoveAsync("kol_ranking");

        return MapToDto(kol, null);
    }

    /// <summary>
    /// base_price = sum(followers) * 0.001 * (1 + avgEngagement/100) * tierMultiplier
    /// </summary>
    public static void RecalculatePricing(KolProfile kol)
    {
        if (!kol.SocialMetrics.Any()) return;

        var totalFollowers = kol.SocialMetrics.Sum(m => m.FollowersCount);
        var avgEngagement = kol.SocialMetrics.Average(m => (double)m.EngagementRate);

        // Determine tier
        kol.Tier = totalFollowers switch
        {
            < 10_000 => KolTier.nano,
            < 100_000 => KolTier.micro,
            < 1_000_000 => KolTier.macro,
            _ => KolTier.mega
        };

        kol.AvgEngagementRate = (decimal)avgEngagement;

        double tierMult = kol.Tier switch
        {
            KolTier.nano => 1.0,
            KolTier.micro => 1.5,
            KolTier.macro => 2.5,
            KolTier.mega => 4.0,
            _ => 1.0
        };

        kol.BasePrice = (decimal)(totalFollowers * 0.001 * (1 + avgEngagement / 100) * tierMult);
    }

    private static KolProfileDto MapToDto(KolProfile k, Point? refPoint) => new()
    {
        UserId = k.UserId,
        DisplayName = k.DisplayName,
        Bio = k.Bio,
        Platforms = k.Platforms,
        BasePrice = k.BasePrice,
        Tier = k.Tier?.ToString(),
        AvgEngagementRate = k.AvgEngagementRate,
        Latitude = k.Location?.Y,
        Longitude = k.Location?.X,
        DistanceKm = (refPoint != null && k.Location != null)
            ? Math.Round(k.Location.Distance(refPoint) / 1000, 2)
            : null,
        Metrics = k.SocialMetrics.Select(m => new KolMetricDto
        {
            Platform = m.Platform,
            FollowersCount = m.FollowersCount,
            EngagementRate = m.EngagementRate,
            Reach30D = m.Reach30D
        }).ToList()
    };
}
