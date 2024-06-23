FROM node:18 AS builder

WORKDIR /app

COPY . .

RUN node --version && npm config set color false && \
    npm install && \
    npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/happyning-frontend/ /usr/share/nginx/html/

ARG VERSION
ENV VERSION $VERSION

RUN sed -i "s|index  index.html index.htm;|try_files \$uri \$uri/ /index.html;|g" /etc/nginx/conf.d/default.conf

CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]