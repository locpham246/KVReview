using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KVReview.API.Models;

[Table("kol_social_metrics")]
public class KolSocialMetric
{
    [Column("kol_id")]
    public Guid KolId { get; set; }

    public KolProfile? KolProfile { get; set; }

    [Required]
    [Column("platform")]
    [StringLength(50)]
    public string Platform { get; set; } = string.Empty;

    [Required]
    [Column("followers_count")]
    public int FollowersCount { get; set; } = 0;

    [Required]
    [Column("engagement_rate", TypeName = "decimal(5, 2)")]
    public decimal EngagementRate { get; set; } = 0;

    [Column("reach_30d")]
    public int? Reach30D { get; set; } = 0;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
