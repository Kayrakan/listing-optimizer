FROM php:8.3-cli
WORKDIR /var/www/html
COPY . .
RUN apt-get update && apt-get install -y libzip-dev unzip && docker-php-ext-install pdo_mysql
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
