using KVReview.API.Data;
using KVReview.API.DTOs.Booking;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KVReview.API.Services;

public class BookingService
{
    private readonly ApplicationDbContext _db;

    public BookingService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<BookingDetailDto> CreateAsync(Guid restaurantId, CreateBookingDto dto)
    {
        var kol = await _db.KolProfiles.FindAsync(dto.KolId)
            ?? throw new KeyNotFoundException("KOL không tồn tại.");

        if (dto.PriceOffered < kol.BasePrice)
            throw new InvalidOperationException($"Giá đề nghị phải >= base price của KOL ({kol.BasePrice:C}).");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            RestaurantId = restaurantId,
            KolId = dto.KolId,
            PriceOffered = dto.PriceOffered,
            ScheduledDate = dto.ScheduledDate,
            Status = BookingStatus.pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return await GetDetailAsync(booking.Id);
    }

    public async Task<List<BookingDetailDto>> GetListAsync(Guid userId, string role)
    {
        var query = _db.Bookings
            .Include(b => b.Restaurant)
            .Include(b => b.KolProfile)
            .Include(b => b.Review)
            .AsQueryable();

        if (role == "restaurant")
            query = query.Where(b => b.RestaurantId == userId);
        else if (role == "kol")
            query = query.Where(b => b.KolId == userId);

        var bookings = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return bookings.Select(MapToDto).ToList();
    }

    public async Task<BookingDetailDto> GetDetailAsync(Guid bookingId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Restaurant)
            .Include(b => b.KolProfile)
            .Include(b => b.Review)
            .FirstOrDefaultAsync(b => b.Id == bookingId)
            ?? throw new KeyNotFoundException("Booking không tìm thấy.");

        return MapToDto(booking);
    }

    public async Task<BookingDetailDto> UpdateStatusAsync(Guid bookingId, Guid userId, string role, UpdateBookingStatusDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Restaurant)
            .Include(b => b.KolProfile)
            .Include(b => b.Review)
            .FirstOrDefaultAsync(b => b.Id == bookingId)
            ?? throw new KeyNotFoundException("Booking không tìm thấy.");

        if (!Enum.TryParse<BookingStatus>(dto.Status.ToLower(), out var newStatus))
            throw new ArgumentException("Status không hợp lệ.");

        // Authorization logic
        if (newStatus == BookingStatus.accepted || newStatus == BookingStatus.cancelled)
        {
            if (role != "kol" || booking.KolId != userId)
                throw new UnauthorizedAccessException("Chỉ KOL mới được accept/reject booking.");
        }
        else if (newStatus == BookingStatus.completed)
        {
            if (role != "restaurant" || booking.RestaurantId != userId)
                throw new UnauthorizedAccessException("Chỉ nhà hàng mới được đánh dấu hoàn thành.");
            if (booking.Status != BookingStatus.accepted)
                throw new InvalidOperationException("Chỉ booking đã accepted mới có thể completed.");
        }

        booking.Status = newStatus;
        await _db.SaveChangesAsync();

        return MapToDto(booking);
    }

    private static BookingDetailDto MapToDto(Booking b) => new()
    {
        Id = b.Id,
        RestaurantId = b.RestaurantId,
        RestaurantName = b.Restaurant?.Name ?? "",
        KolId = b.KolId,
        KolDisplayName = b.KolProfile?.DisplayName ?? "",
        Status = b.Status.ToString(),
        PriceOffered = b.PriceOffered,
        ScheduledDate = b.ScheduledDate,
        CreatedAt = b.CreatedAt,
        Review = b.Review == null ? null : new ReviewSummaryDto
        {
            Rating = b.Review.Rating,
            Comment = b.Review.Comment
        }
    };
}
