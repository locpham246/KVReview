using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace KVReview.API.Models;

public enum KolTier
{
    nano,
    micro,
    macro,
    mega
}

[Table("kol_profiles")]
public class KolProfile
{
    [Key]
    [Column("user_id")]
    public Guid UserId { get; set; }

    public User? User { get; set; }

    [Required]
    [Column("display_name")]
    [StringLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("platforms", TypeName = "varchar(50)[]")]
    public string[] Platforms { get; set; } = Array.Empty<string>();

    [Required]
    [Column("base_price", TypeName = "decimal(12, 2)")]
    public decimal BasePrice { get; set; } = 0.00m;

    [Column("location")]
    public Point? Location { get; set; }

    [Column("avg_engagement_rate", TypeName = "decimal(5, 2)")]
    public decimal? AvgEngagementRate { get; set; }

    [Column("tier")]
    public KolTier? Tier { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<KolSocialMetric> SocialMetrics { get; set; } = new List<KolSocialMetric>();
}
