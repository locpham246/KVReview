using KVReview.API.Data;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KVReview.API.Workers;

/// <summary>
/// Worker Service chạy nền liên tục.
/// Mỗi 6 tiếng sẽ "thu thập" chỉ số tương tác mới nhất từ các nền tảng MXH
/// và lưu lại vào bảng KolSocialMetrics.
/// Trong thực tế sẽ gọi TikTok API / Instagram Graph API / YouTube Data API.
/// </summary>
public class SocialMetricsWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SocialMetricsWorker> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    public SocialMetricsWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<SocialMetricsWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SocialMetricsWorker started. Interval: {Interval}h", Interval.TotalHours);

        // Delay ngắn khi khởi động để DB migration kịp hoàn thành trước
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshMetricsAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error occurred while refreshing social metrics.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task RefreshMetricsAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Lấy tất cả KOL profile đang active
        var kolProfiles = await db.KolProfiles
            .Include(k => k.SocialMetrics)
            .Where(k => k.SocialMetrics.Any())
            .AsNoTracking()
            .ToListAsync(ct);

        _logger.LogInformation("Refreshing metrics for {Count} KOL profiles...", kolProfiles.Count);

        foreach (var kol in kolProfiles)
        {
            foreach (var metric in kol.SocialMetrics)
            {
                // Simulate fetching from social platform API.
                // Thực tế sẽ gọi: await _tiktokClient.GetMetricsAsync(kol.UserId, ct);
                var (newFollowers, newER) = SimulateFetchFromPlatform(metric.Platform, metric.FollowersCount);

                // Chỉ update nếu có thay đổi đáng kể (>1% để tránh ghi DB liên tục)
                if (Math.Abs(newFollowers - metric.FollowersCount) > metric.FollowersCount * 0.01m
                    || Math.Abs(newER - metric.EngagementRate) > 0.1m)
                {
                    await db.KolSocialMetrics
                        .Where(m => m.Id == metric.Id)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(m => m.FollowersCount, newFollowers)
                            .SetProperty(m => m.EngagementRate, newER)
                            .SetProperty(m => m.UpdatedAt, DateTime.UtcNow),
                        ct);

                    _logger.LogDebug(
                        "Updated metrics for KOL {KolId} on {Platform}: {Followers} followers, {ER}% ER",
                        kol.UserId, metric.Platform, newFollowers, newER);
                }
            }
        }

        _logger.LogInformation("Metrics refresh completed.");
    }

    /// <summary>
    /// Giả lập kết quả từ Social Platform API.
    /// Followers tăng/giảm nhẹ ngẫu nhiên, ER dao động trong khoảng thực tế.
    /// </summary>
    private static (decimal followers, decimal engagementRate) SimulateFetchFromPlatform(
        string platform, decimal currentFollowers)
    {
        var rng = Random.Shared;
        // Tăng 0–2% mỗi lần chạy (giả lập tăng trưởng tự nhiên)
        var growth = (decimal)(1 + rng.NextDouble() * 0.02);
        var newFollowers = Math.Round(currentFollowers * growth);

        // ER dao động theo từng platform: TikTok cao hơn Instagram
        var baseER = platform.ToLower() switch
        {
            "tiktok"    => rng.NextDouble() * 5 + 4,   // 4–9%
            "instagram" => rng.NextDouble() * 3 + 2,   // 2–5%
            "youtube"   => rng.NextDouble() * 4 + 3,   // 3–7%
            "facebook"  => rng.NextDouble() * 2 + 1,   // 1–3%
            _           => rng.NextDouble() * 3 + 2,
        };

        return (newFollowers, Math.Round((decimal)baseER, 2));
    }
}
