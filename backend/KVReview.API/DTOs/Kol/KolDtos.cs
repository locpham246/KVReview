namespace KVReview.API.DTOs.Kol;

public class KolProfileDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string[] Platforms { get; set; } = Array.Empty<string>();
    public decimal BasePrice { get; set; }
    public string? Tier { get; set; }
    public decimal? AvgEngagementRate { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public List<KolMetricDto> Metrics { get; set; } = new();
    public double? DistanceKm { get; set; }
}

public class KolMetricDto
{
    public string Platform { get; set; } = string.Empty;
    public int FollowersCount { get; set; }
    public decimal EngagementRate { get; set; }
    public int? Reach30D { get; set; }
}

public class KolSearchQueryDto
{
    public double? Lat { get; set; }
    public double? Lng { get; set; }
    public double RadiusKm { get; set; } = 10;
    public string? Platform { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Tier { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class KolRankingItemDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string? Tier { get; set; }
    public decimal? AvgEngagementRate { get; set; }
    public int TotalFollowers { get; set; }
    public int Rank { get; set; }
}

public class UpdateKolProfileDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string[]? Platforms { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
