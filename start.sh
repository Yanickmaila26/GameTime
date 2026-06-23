#!/bin/sh

# Run Laravel migrations and database seeds
php artisan migrate --seed --force

# Link storage folder
php artisan storage:link --force

# Clear application cache (prevents stale Base64 blobs accumulating in the DB cache table)
php artisan cache:clear

# Start Apache web server in the foreground
exec apache2-foreground
