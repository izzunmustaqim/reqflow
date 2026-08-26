# ============================================
# Stage 1: Build Frontend Assets
# ============================================
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --prefer-offline

COPY resources/css ./resources/css
COPY resources/js ./resources/js
COPY vite.config.ts tsconfig.json ./
RUN npm run build

# ============================================
# Stage 2: Build PHP Dependencies
# ============================================
FROM composer:2 AS composer-build

WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-req=php

COPY . .
RUN composer dump-autoload --optimize --no-dev

# ============================================
# Stage 3: Production Runtime (PHP-FPM + Nginx)
# ============================================
FROM php:8.4-fpm-alpine AS production

RUN apk add --no-cache \
    nginx \
    supervisor \
    libpq-dev \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_pgsql mbstring xml bcmath opcache \
    && rm -rf /var/cache/apk/*

# Install Redis extension
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis

# Configure OPcache
RUN printf "opcache.enable=1\nopcache.memory_consumption=256\nopcache.interned_strings_buffer=16\nopcache.max_accelerated_files=20000\nopcache.revalidate_freq=0\nopcache.validate_timestamps=0\n" > /usr/local/etc/php/conf.d/opcache.ini

# PHP configuration
RUN printf "upload_max_filesize = 10M\npost_max_size = 12M\nmemory_limit = 256M\n" > /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# Copy built frontend assets
COPY --from=frontend-build /app/public/build ./public/build

# Copy application code
COPY --from=composer-build /app/vendor ./vendor
COPY . .

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Setup Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Storage permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && chown -R www-data:www-data storage bootstrap/cache public/build \
    && chmod -R 775 storage bootstrap/cache

# Application optimizations
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan icons:cache 2>/dev/null || true

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
