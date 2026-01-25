# Deployment Guide for AlgoLindo Vendra

## Quick Deploy on New EC2 Instance

### 1. Launch EC2 Instance
- AMI: Amazon Linux 2023
- Instance Type: t2.micro or better
- Storage: 8GB minimum
- **Security Group**: Make sure to open port 80 (HTTP) and 22 (SSH)

### 2. Connect to Your Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/algoLindoVendra-alv.git
cd algoLindoVendra-alv
```

### 4. Create RDS PostgreSQL Database (Required)

1. Go to **AWS Console → RDS → Create database**
2. Select **PostgreSQL** + **Free tier**
3. Set database identifier: `algolindo-db`
4. Set master username: `postgres`
5. Set a secure password
6. In **Additional configuration**, set initial database name: `algolindo`
7. Click **Create database** (wait 5-10 minutes)
8. Configure Security Group to allow port 5432 from your EC2

### 5. Configure Environment Variables

```bash
export RDS_HOSTNAME="your-db.xxxxx.region.rds.amazonaws.com"
export RDS_DB_NAME="algolindo"
export RDS_USERNAME="postgres"
export RDS_PASSWORD="your-secure-password"
export RDS_PORT="5432"

# Optional: Add to ~/.bashrc for persistence
echo 'export RDS_HOSTNAME="..."' >> ~/.bashrc
echo 'export RDS_PASSWORD="..."' >> ~/.bashrc
```

### 6. Run the Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

That's it! The script will automatically:
- Install all dependencies (Node.js 20, Python, Nginx, PM2)
- Set up the backend (Django)
- Build and start the frontend (Next.js)
- Configure Nginx as a reverse proxy
- Set up PM2 to auto-restart on reboot

### 5. Access Your App
After deployment completes, the script will show you the URL:
```
http://ec2-XX-XX-XX-XX.region.compute.amazonaws.com
```

---

## Manual Deployment (If Script Fails)

If you prefer to deploy manually or the script fails:

### Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
pip install gunicorn

# Set environment variables
export ALLOWED_HOSTS="your-hostname,your-ip,localhost"
export DEBUG="False"

# Run migrations
python backend/manage.py migrate
python backend/manage.py collectstatic --noinput

# Start with PM2
pm2 start "venv/bin/gunicorn --bind 0.0.0.0:8000 backend.wsgi:application" --name "django-backend"
```

### Frontend Setup
```bash
# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Build frontend
cd frontend
npm install
npm run build

# Start with PM2
sudo npm install -g pm2
pm2 start npm --name "nextjs-app" -- start
```

### Nginx Configuration
```bash
# Create config file
sudo nano /etc/nginx/conf.d/myapp.conf
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-hostname your-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Note: trailing slash is important!
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Add to `/etc/nginx/nginx.conf` inside the `http` block:
```nginx
server_names_hash_bucket_size 128;
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### PM2 Auto-Startup
```bash
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# Run the sudo command it outputs
pm2 save
```

---

## Common Issues & Solutions

### Port 8000 Already in Use
```bash
# Find and kill the process
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Django Shows "Bad Request (400)"
Check `ALLOWED_HOSTS` is set correctly with your hostname and IP:
```bash
export ALLOWED_HOSTS="ec2-xx-xx.compute.amazonaws.com,1.2.3.4,localhost"
```

### Nginx Won't Start
Check for syntax errors:
```bash
sudo nginx -t
```

### Frontend API Errors
Make sure `/api` uses relative paths (already fixed in `lib/api.ts`)

### PM2 Not Starting on Reboot
Re-run PM2 startup:
```bash
pm2 unstartup systemd
pm2 startup systemd -u ec2-user --hp /home/ec2-user
# Run the sudo command
pm2 save
```

---

## Useful Commands

### Check App Status
```bash
pm2 status
pm2 logs
sudo systemctl status nginx
```

### Restart Services
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Update Code
```bash
git pull
source venv/bin/activate
pip install -r backend/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

cd frontend
npm install
npm run build

pm2 restart all
```

---

## AWS Security Group Configuration

Make sure these ports are open:
- **Port 22**: SSH (for connecting)
- **Port 80**: HTTP (for web traffic)
- **Port 443**: HTTPS (optional, for SSL)

Add inbound rules in EC2 Console → Security Groups → Edit inbound rules

---

## Environment Variables

The app uses these environment variables:
- `ALLOWED_HOSTS`: Comma-separated list of allowed hostnames/IPs
- `DEBUG`: Set to "True" for development, "False" for production

Set them before running PM2 commands for Django.

---

## Next Steps (Optional)

1. **Add HTTPS with Let's Encrypt**
   ```bash
   sudo yum install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Set up a custom domain** instead of using the EC2 hostname

3. **Configure database backups** (currently using SQLite)

4. **Set up monitoring** with PM2 Plus or CloudWatch
