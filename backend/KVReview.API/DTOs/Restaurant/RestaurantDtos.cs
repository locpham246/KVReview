namespace KVReview.API.DTOs.Restaurant;

public class RestaurantProfileDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? CuisineType { get; set; }
    public decimal? AvgRating { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class UpdateRestaurantDto
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? CuisineType { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
