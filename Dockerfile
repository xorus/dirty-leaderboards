FROM php:8.0-apache
COPY --from=composer:2.1 /usr/bin/composer /usr/local/bin/composer

RUN apt-get update && apt-get install -y git unzip


COPY . /var/www/html/
WORKDIR /var/www/html/
RUN composer install

RUN mv /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini
# set default timezone
RUN sed -ri -e 's!;date.timezone =!date.timezone = "Europe/Paris"!g' /usr/local/etc/php/php.ini
RUN a2enmod actions rewrite



#CMD [ "php", "./your-script.php" ]