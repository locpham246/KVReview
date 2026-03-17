namespace KVReview.API.DTOs.Review;

public class CreateReviewDto
{
    public Guid BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
