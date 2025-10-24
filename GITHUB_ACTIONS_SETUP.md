# GitHub Actions EC2 Deployment Setup

## Prerequisites
- EC2 instance running Ubuntu
- SSH key access to EC2
- GitHub repository with admin access

## Step 1: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### Required Secrets:

1. **EC2_HOST**
   - Value: `ec2-50-19-23-245.compute-1.amazonaws.com`
   - Description: Your EC2 instance hostname

2. **EC2_USERNAME**
   - Value: `ubuntu`
   - Description: EC2 instance username

3. **EC2_SSH_KEY**
   - Value: Copy the entire contents of your SSH private key file
   - Description: Private SSH key for EC2 access
   - File location: `C:\Users\hazem\.ssh\ec2-key.pem`

## Step 2: Prepare EC2 Instance

SSH into your EC2 instance and run:

```bash
# Connect to EC2
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com

# Clone repository (if not already done)
cd ~
git clone https://github.com/hazemyasserprg/notion-arabs.git
cd notion-arabs

# Make sure deploy script is executable
chmod +x backend/deploy.sh

# Test the deployment script
cd backend
./deploy.sh
```

## Step 3: Test Automatic Deployment

1. Make a small change to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab to watch the deployment
4. Check your EC2 instance to verify the deployment

## Step 4: Verify Deployment

Check if your backend is running:
```bash
# On EC2
pm2 status
curl http://localhost:5000/api
```

## Troubleshooting

### Common Issues:

1. **SSH Key Permission Error**
   - Make sure the SSH key in GitHub secrets is properly formatted
   - Include the full key with `-----BEGIN` and `-----END` lines

2. **Git Pull Fails**
   - Make sure the repository is cloned on EC2
   - Check if there are any uncommitted changes on EC2

3. **Deploy Script Fails**
   - Make sure `deploy.sh` is executable: `chmod +x backend/deploy.sh`
   - Check if all dependencies are installed

4. **PM2 Not Found**
   - Install PM2 globally: `sudo npm install -g pm2`

## Security Notes

- Never commit SSH keys to your repository
- Use GitHub Secrets for sensitive information
- Regularly rotate your SSH keys
- Monitor GitHub Actions logs for any issues

## Manual Override

If automatic deployment fails, you can still deploy manually:
```bash
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com
cd ~/notion-arabs
git pull origin main
cd backend
./deploy.sh
```
