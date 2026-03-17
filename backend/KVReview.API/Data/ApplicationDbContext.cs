using Microsoft.EntityFrameworkCore;
using KVReview.API.Models;

namespace KVReview.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<KolProfile> KolProfiles { get; set; } = null!;
    public DbSet<Restaurant> Restaurants { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<KolSocialMetric> KolSocialMetrics { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // PostGIS Extension is enabled globally on the database via UseNetTopologySuite

        // User Enum mapping
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<KolTier>();
        modelBuilder.HasPostgresEnum<BookingStatus>();

        // KolProfile
        modelBuilder.Entity<KolProfile>()
            .HasOne(k => k.User)
            .WithOne()
            .HasForeignKey<KolProfile>(k => k.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<KolProfile>()
            .Property(k => k.Location)
            .HasColumnType("geography(Point, 4326)");

        modelBuilder.Entity<KolProfile>()
            .HasIndex(k => k.Location)
            .HasMethod("gist");

        modelBuilder.Entity<KolProfile>()
            .HasIndex(k => new { k.Tier, k.AvgEngagementRate })
            .IsDescending(false, true);

        // Restaurant
        modelBuilder.Entity<Restaurant>()
            .HasOne(r => r.User)
            .WithOne()
            .HasForeignKey<Restaurant>(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Restaurant>()
            .Property(r => r.Location)
            .HasColumnType("geography(Point, 4326)");

        modelBuilder.Entity<Restaurant>()
            .HasIndex(r => r.Location)
            .HasMethod("gist");

        // Bookings
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Restaurant)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.KolProfile)
            .WithMany(k => k.Bookings)
            .HasForeignKey(b => b.KolId)
            .OnDelete(DeleteBehavior.Restrict);

        // Partial Index for active bookings
        modelBuilder.Entity<Booking>()
            .HasIndex(b => new { b.RestaurantId, b.CreatedAt })
            .HasFilter("status IN ('pending', 'accepted')");

        // Reviews
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Booking)
            .WithOne(b => b.Review)
            .HasForeignKey<Review>(r => r.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // KolSocialMetrics composite key
        modelBuilder.Entity<KolSocialMetric>()
            .HasKey(m => new { m.KolId, m.Platform });
    }
}
