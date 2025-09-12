#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx unzip

# Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clone repo
cd /opt
git clone ${repo_url} app || true
cd app

# Write env
echo "${env_vars}" | base64 -d > .env

npm install --quiet

# Build admin
cd src/interface/frontend/admin
npm install --quiet || true
npm run build || true
cd /opt/app

# Start proxies and API with pm2-like simple systemd units
cat >/etc/systemd/system/assertiva.service <<EOF
[Unit]
Description=Assertiva Proxy
After=network.target

[Service]
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node src/backend/proxies/assertiva-proxy.js
Restart=always
Environment=PORT=${assertiva_port}

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/safeweb.service <<EOF
[Unit]
Description=Safeweb Proxy
After=network.target

[Service]
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node src/backend/proxies/safeweb-proxy.js
Restart=always
Environment=SAFEWEB_PROXY_PORT=${safeweb_port}

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/api.service <<EOF
[Unit]
Description=API Server
After=network.target

[Service]
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node src/main/server.js
Restart=always
Environment=NODE_ENV=production
Environment=API_PORT=${api_port}
Environment=FRONTEND_ORIGIN=${frontend_origin}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable assertiva.service safeweb.service api.service
systemctl start assertiva.service safeweb.service api.service

# Nginx reverse proxy for /api to EC2 localhost api_port and serve admin from /opt/app/dist/admin
cat >/etc/nginx/sites-available/default <<NGX
server {
  listen 80;
  server_name _;

  location /api/ {
    proxy_pass http://127.0.0.1:${api_port}/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
  }

  location /admin/ {
    alias /opt/app/dist/admin/;
    try_files $uri $uri/ /admin/index.html;
  }
}
NGX

systemctl restart nginx
echo "Provisioning completed"

