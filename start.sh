#!/bin/sh

# Run Laravel migrations and database seeds
php artisan migrate --seed --force

# Start Apache web server in the foreground
exec apache2-foreground
