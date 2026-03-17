using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace KVReview.API.Models;

[Table("restaurants")]
public class Restaurant
{
    [Key]
    [Column("user_id")]
    public Guid UserId { get; set; }

    public User? User { get; set; }

    [Required]
    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("address")]
    public string Address { get; set; } = string.Empty;

    [Column("location")]
    public Point? Location { get; set; }

    [Column("cuisine_type")]
    [StringLength(100)]
    public string? CuisineType { get; set; }

    [Column("avg_rating", TypeName = "decimal(3, 2)")]
    [Range(1.0, 5.0)]
    public decimal? AvgRating { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
