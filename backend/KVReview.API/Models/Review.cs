using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KVReview.API.Models;

[Table("reviews")]
public class Review
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("booking_id")]
    public Guid BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [Column("rating")]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
