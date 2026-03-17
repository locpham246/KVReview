# KVReview — Hướng dẫn khởi động

## Yêu cầu
- Docker Desktop đang chạy
- .NET 8 SDK (để tạo migration)

## Bước 1: Khởi động DB và Redis
```powershell
cd c:\Antigravity\KVReview
docker-compose up -d db redis
```

## Bước 2: Tạo EF Core Migration (cần .NET SDK)
```powershell
cd c:\Antigravity\KVReview\backend\KVReview.API
# Nếu dotnet tooling chưa có:
# winget install Microsoft.DotNet.SDK.8
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```

> Nếu không có .NET SDK local, migration sẽ tự chạy qua `db.Database.Migrate()` 
> trong Program.cs khi API container khởi động (do auto-migrate).

## Bước 3: Build và chạy toàn bộ
```powershell
cd c:\Antigravity\KVReview
docker-compose up --build
```

## Endpoints sau khi chạy
| Service           | URL                                    |
|-------------------|----------------------------------------|
| Frontend (web)    | http://localhost                       |
| Swagger UI        | http://localhost/swagger               |
| API trực tiếp     | http://localhost:8080/swagger          |
| PostgreSQL        | localhost:5432                         |
| Redis             | localhost:6379                         |

## Test API flow (Swagger)
1. `POST /api/auth/register` → body: `{"email":"r@test.com","password":"Abc12345","role":"restaurant","restaurantName":"Test Restaurant","address":"Quận 1"}`
2. `POST /api/auth/register` → body: `{"email":"k@test.com","password":"Abc12345","role":"kol","displayName":"Food KOL 01"}`
3. `GET /api/kols` (dùng token của restaurant) → tìm kiếm KOL
4. `POST /api/bookings` → tạo booking
5. `PATCH /api/bookings/{id}/status` (token KOL) → body: `{"status":"accepted"}`
6. `PATCH /api/bookings/{id}/status` (token restaurant) → body: `{"status":"completed"}`
7. `POST /api/reviews` → đánh giá KOL
