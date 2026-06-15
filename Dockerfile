FROM php:8.3-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql pdo_pgsql gd zip mbstring exif pcntl

# Configure PHP upload settings (32MB limits for base64 images and large PNGs)
RUN echo "upload_max_filesize = 32M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 32M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Set ServerName globally to suppress FQDN warnings
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Limit Apache Prefork processes to prevent OOM on Render's 512MB RAM limit
RUN echo '<IfModule mpm_prefork_module>' > /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '    StartServers             2' >> /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '    MinSpareServers          2' >> /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '    MaxSpareServers          4' >> /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '    MaxRequestWorkers        6' >> /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '    MaxConnectionsPerChild   1000' >> /etc/apache2/mods-available/mpm_prefork.conf && \
    echo '</IfModule>' >> /etc/apache2/mods-available/mpm_prefork.conf

# Change Apache document root to Laravel public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configure Apache port using PORT env variable (Render provides this)
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Copy application files
WORKDIR /var/www/html
COPY . .

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Make startup script executable
RUN chmod +x /var/www/html/start.sh

# Expose port (Render sets this dynamically)
EXPOSE 80

# Start command
CMD ["/var/www/html/start.sh"]
