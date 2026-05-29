#!/bin/sh

# Run Laravel migrations and database seeds
php artisan migrate --seed --force

# Link storage folder
php artisan storage:link --force

# Start Apache web server in the foreground
exec apache2-foreground
