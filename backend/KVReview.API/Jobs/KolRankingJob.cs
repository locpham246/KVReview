using Hangfire;
using KVReview.API.Data;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace KVReview.API.Jobs;

/// <summary>
/// Hangfire Recurring Job — chạy mỗi giờ.
/// Tính toán lại:
///   1. Tier của KOL (Nano / Micro / Macro / Mega) dựa trên tổng followers.
///   2. Base price dựa trên công thức: followers × 0.001 × (1 + ER/100) × TierMultiplier.
///   3. Xóa cache Redis để lần truy vấn tiếp theo sẽ rebuild với dữ liệu mới nhất.
/// </summary>
public class KolRankingJob
{
    private readonly ApplicationDbContext _db;
    private readonly IDistributedCache _cache;
    private readonly ILogger<KolRankingJob> _logger;

    // Cache keys phải khớp với KolService.cs
    private const string RankingCacheKey = "kol_ranking";
    private const string SearchCachePrefix = "kol_search:";

    public KolRankingJob(
        ApplicationDbContext db,
        IDistributedCache cache,
        ILogger<KolRankingJob> logger)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Entry point được Hangfire gọi. Đăng ký trong Program.cs với cron "0 * * * *" (mỗi giờ).
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("[KolRankingJob] Starting at {Time}", DateTime.UtcNow);
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var kols = await _db.KolProfiles
            .Include(k => k.SocialMetrics)
            .ToListAsync();

        int updatedCount = 0;

        foreach (var kol in kols)
        {
            if (!kol.SocialMetrics.Any()) continue;

            var totalFollowers = kol.SocialMetrics.Sum(m => m.FollowersCount);
            var avgER = kol.SocialMetrics.Average(m => m.EngagementRate);

            var newTier = CalculateTier(totalFollowers);
            var newPrice = CalculateBasePrice(totalFollowers, avgER, newTier);

            // Chỉ update nếu thực sự có thay đổi
            if (kol.Tier != newTier || Math.Abs(kol.BasePrice - newPrice) > 1000)
            {
                kol.Tier = newTier;
                kol.BasePrice = newPrice;
                updatedCount++;
            }
        }

        if (updatedCount > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("[KolRankingJob] Updated {Count} KOL pricing/tier.", updatedCount);

            // Invalidate cache: xóa ranking và tất cả search cache
            // KolService sẽ tự rebuild cache ở lần request đầu tiên sau đó
            await _cache.RemoveAsync(RankingCacheKey);
            _logger.LogInformation("[KolRankingJob] Invalidated Redis cache key: {Key}", RankingCacheKey);
        }
        else
        {
            _logger.LogInformation("[KolRankingJob] No significant changes detected. Skipping cache invalidation.");
        }

        sw.Stop();
        _logger.LogInformation("[KolRankingJob] Finished in {Elapsed}ms.", sw.ElapsedMilliseconds);
    }

    /// <summary>
    /// Phân tier KOL theo tổng followers trên tất cả các nền tảng.
    /// </summary>
    private static KolTier CalculateTier(decimal totalFollowers) => totalFollowers switch
    {
        < 10_000           => KolTier.Nano,
        < 100_000          => KolTier.Micro,
        < 1_000_000        => KolTier.Macro,
        _                  => KolTier.Mega,
    };

    /// <summary>
    /// Công thức tính giá base của một buổi booking KOL.
    /// Tier multiplier phản ánh sức ảnh hưởng cấp bậc của KOL.
    /// </summary>
    private static decimal CalculateBasePrice(decimal followers, decimal avgER, KolTier tier)
    {
        var multiplier = tier switch
        {
            KolTier.Nano  => 1.0m,
            KolTier.Micro => 1.5m,
            KolTier.Macro => 2.5m,
            KolTier.Mega  => 4.0m,
            _             => 1.0m,
        };

        var price = followers * 0.001m * (1 + avgER / 100m) * multiplier;

        // Làm tròn đến nghìn đồng
        return Math.Round(price / 1000, 0) * 1000;
    }
}
