FROM nginx:alpine
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    gzip on;
    gzip_types application/javascript text/css image/svg+xml application/json;
    location = /index.html { add_header Cache-Control "no-cache"; }
    location ~* \.(js|svg|png|woff2?)$ { add_header Cache-Control "public, max-age=31536000"; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
COPY . /usr/share/nginx/html
EXPOSE 80
