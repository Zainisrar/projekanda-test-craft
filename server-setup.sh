#!/bin/bash

# Server Setup Script
# Run this script ON THE AWS SERVER to set up Nginx and configure the application

set -e  # Exit on error

echo "🔧 Setting up AWS server for frontend deployment..."

# Update system
echo "📦 Updating package manager..."
apt update

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/projekanda
chmod 755 /var/www/projekanda

# Create Nginx configuration
echo "⚙️  Configuring Nginx..."
cat > /etc/nginx/sites-available/projekanda << 'EOF'
server {
    listen 80;
    server_name 72.60.41.227;

    root /var/www/projekanda;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/projekanda /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx

# Set proper permissions
chown -R www-data:www-data /var/www/projekanda
chmod -R 755 /var/www/projekanda

# Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw reload || true
fi

echo "✅ Server setup completed successfully!"
echo "🌐 Server is ready to receive deployments"
echo ""
echo "Next steps:"
echo "1. From your local machine, run: ./deploy.sh"
echo "2. Your application will be live at: http://72.60.41.227"
