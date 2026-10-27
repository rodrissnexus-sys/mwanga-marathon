# Security fixes for the current live servers

Apply these to the **live** Laravel APIs (`api.mwafem.com` and `api-sw.mwafem.com`)
until the new Vercel site replaces them. Only `routes/api.php` changes, plus one
password change. No frontend change is needed: the dashboards already send the
login token with every request (`src/api/client.js`).

Back up `routes/api.php` on each server before editing.

---

## Fix 1 — Swahili API: event types & schedule can be edited by anyone

File: `api-sw.mwafem.com` → `routes/api.php`, inside `Route::prefix('event-data')`.

Replace the two commented-out groups:

```php
        // Admin-only routes
        // Route::middleware('auth:sanctum')->group(function () {
            Route::post('/', [EventTypeController::class, 'store']);
            Route::put('/{id}', [EventTypeController::class, 'update']);
            Route::delete('/{id}', [EventTypeController::class, 'destroy']);
        // });
```

with:

```php
        // Admin-only routes
        Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
            Route::post('/', [EventTypeController::class, 'store']);
            Route::put('/{id}', [EventTypeController::class, 'update']);
            Route::delete('/{id}', [EventTypeController::class, 'destroy']);
        });
```

and the same for the schedule block (`ScheduleDayController`):

```php
        // Admin-only routes
        Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
            Route::post('/', [ScheduleDayController::class, 'store']);
            Route::put('/{id}', [ScheduleDayController::class, 'update']);
            Route::delete('/{id}', [ScheduleDayController::class, 'destroy']);
        });
```

## Fix 2 — Both APIs: registrations list is public

File: `routes/api.php` on **both** servers, inside `Route::prefix('marathon')`.

Replace:

```php
    Route::get('/registrations', [RegistrationController::class, 'getAllRegistrations']);
```

with:

```php
    Route::get('/registrations', [RegistrationController::class, 'getAllRegistrations'])
        ->middleware(['auth:sanctum', 'role:moderator']);
```

(`role:moderator` lets both moderators and admins through — see `CheckRole`.)

## Fix 3 — Both APIs: any logged-in account can edit dropdowns and event data

On **both** servers, in the `dropdowns` block (events, shirt-sizes,
collection-venues, countries, genders) and — on the **English** server — the
`event-data` block, change every

```php
Route::middleware('auth:sanctum')->group(function () {
```

inside those blocks to

```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
```

Leave the top-level `Route::middleware('auth:sanctum')->group(...)` (the one
holding `/user` and `/logout`) unchanged.

## Fix 4 — Admin password is written in the code

`database/seeders/AdminUserSeeder.php` contains the password for
`info@mwafem.com`. If that account still uses it, log in to each dashboard and
change it (Dashboard → User Management → edit), or on the server:

```bash
php artisan tinker
>>> $u = App\Models\User::where('email','info@mwafem.com')->first();
>>> $u->password = Hash::make('NEW-STRONG-PASSWORD'); $u->save();
```

## After editing

On each server:

```bash
php artisan route:clear
php artisan route:cache   # only if the site already used route caching
```

## Check it worked

From any computer (no login), all of these must now return **401**:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://api.mwafem.com/api/marathon/registrations
curl -s -o /dev/null -w "%{http_code}\n" https://api-sw.mwafem.com/api/marathon/registrations
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Accept: application/json" https://api-sw.mwafem.com/api/event-data/event-types
```

Then log in to each dashboard and confirm the Registrations and Dashboard pages
still load.
