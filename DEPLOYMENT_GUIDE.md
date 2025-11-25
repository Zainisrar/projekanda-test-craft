# Quick Deployment Guide

## Current Status
✅ Production build completed  
✅ Deployment scripts created

## Next Steps

Since automated SSH is encountering connection issues, please follow these manual steps:

### Step 1: Connect to Your Server

Open a new terminal and run:
```bash
ssh root@72.60.41.227
```
Password: `Sheikhjefrizal210879&&`

### Step 2: Set Up Server (Run these commands on the server)

```bash
# Install Nginx
apt update && apt install -y nginx

# Create application directory
mkdir -p /var/www/projekanda
chmod 755 /var/www/projekanda

# Create Nginx configuration
cat > /etc/nginx/sites-available/projekanda << 'EOF'
server {
    listen 80;
    server_name 72.60.41.227;
    root /var/www/projekanda;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/projekanda /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Set permissions
chown -R www-data:www-data /var/www/projekanda
chmod -R 755 /var/www/projekanda

# Exit server
exit
```

### Step 3: Deploy Your Application (Run on your local machine)

```bash
cd /Users/mac/projekanda-test-craft
rsync -avz --delete dist/ root@72.60.41.227:/var/www/projekanda/
```

Or use the deploy script:
```bash
./deploy.sh
```

### Step 4: Verify

Open your browser and go to:
```
http://72.60.41.227
```

## Alternative: Use SCP Instead of Rsync

If you don't have rsync or prefer scp:
```bash
scp -r dist/* root@72.60.41.227:/var/www/projekanda/
```

## Security Recommendations (After Deployment)

1. Change root password:
   ```bash
   ssh root@72.60.41.227
   passwd
   ```

2. Create a non-root user for future deployments

3. Set up SSH key authentication

## Troubleshooting

- **Connection refused**: Check that port 22 is open in AWS security group
- **Permission denied**: Verify you're using the correct password
- **502 Bad Gateway**: Check Nginx error logs: `tail -f /var/log/nginx/error.log`
- **404 Not Found**: Verify files are in `/var/www/projekanda/`
