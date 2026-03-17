using KVReview.API.Data;
using KVReview.API.DTOs.Review;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KVReview.API.Services;

public class ReviewService
{
    private readonly ApplicationDbContext _db;

    public ReviewService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewDto> CreateAsync(Guid restaurantId, CreateReviewDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Restaurant)
            .FirstOrDefaultAsync(b => b.Id == dto.BookingId)
            ?? throw new KeyNotFoundException("Booking không tồn tại.");

        if (booking.RestaurantId != restaurantId)
            throw new UnauthorizedAccessException("Bạn không có quyền review booking này.");

        if (booking.Status != BookingStatus.completed)
            throw new InvalidOperationException("Chỉ booking đã hoàn thành mới có thể được review.");

        if (await _db.Reviews.AnyAsync(r => r.BookingId == dto.BookingId))
            throw new InvalidOperationException("Booking này đã được review rồi.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating phải từ 1 đến 5.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BookingId = dto.BookingId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return new ReviewDto
        {
            Id = review.Id,
            BookingId = review.BookingId,
            RestaurantName = booking.Restaurant?.Name ?? "",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<List<ReviewDto>> GetByKolAsync(Guid kolId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.Booking)
                .ThenInclude(b => b!.Restaurant)
            .Where(r => r.Booking!.KolId == kolId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            BookingId = r.BookingId,
            RestaurantName = r.Booking?.Restaurant?.Name ?? "",
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();
    }
}
