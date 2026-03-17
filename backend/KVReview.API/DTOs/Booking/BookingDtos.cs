namespace KVReview.API.DTOs.Booking;

public class CreateBookingDto
{
    public Guid KolId { get; set; }
    public decimal PriceOffered { get; set; }
    public DateTime ScheduledDate { get; set; }
}

public class BookingDetailDto
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public Guid KolId { get; set; }
    public string KolDisplayName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal PriceOffered { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public ReviewSummaryDto? Review { get; set; }
}

public class UpdateBookingStatusDto
{
    /// <summary>accepted | cancelled | completed</summary>
    public string Status { get; set; } = string.Empty;
}

public class ReviewSummaryDto
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
