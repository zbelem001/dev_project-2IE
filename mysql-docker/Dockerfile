FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=motdepasse_root
ENV MYSQL_DATABASE=db_biblio
COPY schema.sql /docker-entrypoint-initdb.d/ 