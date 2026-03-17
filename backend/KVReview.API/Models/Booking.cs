using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KVReview.API.Models;

public enum BookingStatus
{
    pending,
    accepted,
    completed,
    cancelled
}

[Table("bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("restaurant_id")]
    public Guid RestaurantId { get; set; }

    public Restaurant? Restaurant { get; set; }

    [Required]
    [Column("kol_id")]
    public Guid KolId { get; set; }

    public KolProfile? KolProfile { get; set; }

    [Required]
    [Column("status")]
    public BookingStatus Status { get; set; } = BookingStatus.pending;

    [Required]
    [Column("price_offered", TypeName = "decimal(12, 2)")]
    public decimal PriceOffered { get; set; }

    [Required]
    [Column("scheduled_date")]
    public DateTime ScheduledDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Review? Review { get; set; }
}
