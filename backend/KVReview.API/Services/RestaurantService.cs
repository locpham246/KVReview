using KVReview.API.Data;
using KVReview.API.DTOs.Restaurant;
using KVReview.API.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace KVReview.API.Services;

public class RestaurantService
{
    private readonly ApplicationDbContext _db;

    public RestaurantService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<RestaurantProfileDto?> GetByUserIdAsync(Guid userId)
    {
        var r = await _db.Restaurants.FirstOrDefaultAsync(r => r.UserId == userId);
        return r == null ? null : MapToDto(r);
    }

    public async Task<RestaurantProfileDto?> UpdateAsync(Guid userId, UpdateRestaurantDto dto)
    {
        var r = await _db.Restaurants.FirstOrDefaultAsync(r => r.UserId == userId);
        if (r == null) return null;

        if (dto.Name != null) r.Name = dto.Name;
        if (dto.Address != null) r.Address = dto.Address;
        if (dto.CuisineType != null) r.CuisineType = dto.CuisineType;

        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
            r.Location = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };

        await _db.SaveChangesAsync();
        return MapToDto(r);
    }

    private static RestaurantProfileDto MapToDto(Restaurant r) => new()
    {
        UserId = r.UserId,
        Name = r.Name,
        Address = r.Address,
        CuisineType = r.CuisineType,
        AvgRating = r.AvgRating,
        Latitude = r.Location?.Y,
        Longitude = r.Location?.X
    };
}
