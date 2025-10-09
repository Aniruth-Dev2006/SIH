# Deployment Checklist

## Pre-Deployment

### Security
- [ ] Change SESSION_SECRET to a strong random string
- [ ] Implement password hashing (bcrypt)
- [ ] Add rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Add input sanitization for all forms
- [ ] Remove console.log statements from production code
- [ ] Set secure cookies in production
- [ ] Add helmet.js for security headers

### Database
- [ ] Set up MongoDB Atlas or production MongoDB instance
- [ ] Create database backups strategy
- [ ] Set up indexes for frequently queried fields
- [ ] Configure connection pooling
- [ ] Set up database monitoring

### Environment
- [ ] Create production .env file
- [ ] Set NODE_ENV=production
- [ ] Configure production database URL
- [ ] Set up proper logging service
- [ ] Configure error tracking (e.g., Sentry)

### Code Quality
- [ ] Run linter (ESLint)
- [ ] Fix all warnings
- [ ] Remove unused dependencies
- [ ] Optimize database queries
- [ ] Add proper error handling for all routes

### Testing
- [ ] Test all authentication flows
- [ ] Test all CRUD operations
- [ ] Test file uploads (if implemented)
- [ ] Test on different browsers
- [ ] Test mobile responsiveness
- [ ] Load testing

### Documentation
- [ ] Update README.md with production setup
- [ ] Document API endpoints
- [ ] Create user manual
- [ ] Document deployment process

## Deployment Steps

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create your-app-name
```

4. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

5. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-here
```

6. **Deploy**
```bash
git push heroku main
```

7. **Seed Database (Optional)**
```bash
heroku run npm run seed
```

### Option 2: VPS Deployment (Ubuntu)

1. **Connect to VPS**
```bash
ssh user@your-server-ip
```

2. **Update System**
```bash
sudo apt update
sudo apt upgrade -y
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

4. **Install MongoDB**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

5. **Install PM2**
```bash
sudo npm install -g pm2
```

6. **Clone Repository**
```bash
cd /var/www
sudo git clone your-repository-url sih1
cd sih1
```

7. **Install Dependencies**
```bash
sudo npm install --production
```

8. **Create .env File**
```bash
sudo nano .env
# Add your environment variables
```

9. **Seed Database**
```bash
npm run seed
```

10. **Start with PM2**
```bash
pm2 start server.js --name "sih-alumni"
pm2 save
pm2 startup
```

11. **Set Up Nginx (Reverse Proxy)**
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/sih1
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/sih1 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

12. **Set Up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 3: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/communityDB
    depends_on:
      - mongo
  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

3. **Build and Run**
```bash
docker-compose up -d
```

## Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure application monitoring (e.g., New Relic, Datadog)
- [ ] Set up log aggregation (e.g., Loggly, Papertrail)
- [ ] Configure alerts for errors and downtime

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Implement caching strategy
- [ ] Optimize images and assets
- [ ] Enable HTTP/2

### Backup
- [ ] Schedule automated database backups
- [ ] Test backup restoration process
- [ ] Set up off-site backup storage

### Maintenance
- [ ] Create maintenance page
- [ ] Document rollback procedure
- [ ] Set up staging environment
- [ ] Create deployment runbook

## Production Environment Variables

Create a `.env` file with:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=your-very-secure-random-secret-min-32-chars
SESSION_MAX_AGE=86400000
ALLOWED_ORIGINS=https://yourdomain.com
```

## Rollback Plan

If deployment fails:

1. **Quick Rollback**
```bash
git revert HEAD
git push heroku main
# or
pm2 restart sih-alumni
```

2. **Full Rollback**
```bash
git reset --hard <previous-commit-hash>
git push -f heroku main
```

3. **Database Rollback**
```bash
mongorestore --uri="your-mongodb-uri" --dir=backup-directory
```

## Health Check Endpoints

Add to your app:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/status', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    server: 'running', 
    database: dbStatus,
    uptime: process.uptime()
  });
});
```

## Monitoring Commands

### PM2
```bash
pm2 status                 # Check app status
pm2 logs sih-alumni       # View logs
pm2 restart sih-alumni    # Restart app
pm2 stop sih-alumni       # Stop app
pm2 delete sih-alumni     # Delete app from PM2
```

### MongoDB
```bash
mongosh                    # Connect to MongoDB
db.stats()                # Database statistics
db.serverStatus()         # Server status
```

### Nginx
```bash
sudo systemctl status nginx
sudo nginx -t             # Test configuration
sudo systemctl reload nginx
```

## Support and Maintenance

### Regular Tasks
- Weekly: Review error logs
- Monthly: Update dependencies (npm update)
- Quarterly: Security audit (npm audit)
- Yearly: Review and update documentation

### Emergency Contacts
- Server Admin: [Contact]
- Database Admin: [Contact]
- Developer: [Contact]
