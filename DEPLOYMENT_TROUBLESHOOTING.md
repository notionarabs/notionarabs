# GitHub Actions Deployment Troubleshooting

## Common Issues and Solutions

### 1. SSH Connection Failed

**Error:** `ssh: connect to host ec2-50-19-23-245.compute-1.amazonaws.com port 22: Connection refused`

**Solutions:**
- Check if EC2 instance is running
- Verify security group allows SSH (port 22) from GitHub Actions IPs
- Check if SSH key is correctly formatted in GitHub secrets

### 2. SSH Key Format Error

**Error:** `Load key "/tmp/ssh_key": invalid format`

**Solution:**
- Make sure EC2_SSH_KEY secret includes the full key with headers:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[your key content]
-----END OPENSSH PRIVATE KEY-----
```

### 3. Repository Not Found

**Error:** `fatal: repository 'notion-arabs' does not exist`

**Solution:**
- The workflow now automatically clones the repository if it doesn't exist
- Make sure the repository URL is correct

### 4. Permission Denied

**Error:** `Permission denied (publickey)`

**Solutions:**
- Verify EC2_SSH_KEY secret is correctly formatted
- Check if the SSH key matches the one on EC2 instance
- Ensure the key has proper permissions on EC2

### 5. Deploy Script Not Found

**Error:** `deploy.sh not found`

**Solution:**
- The workflow now checks if deploy.sh exists
- Make sure the file is committed to the repository

## Debugging Steps

### 1. Check GitHub Secrets
Go to: `https://github.com/hazemyasserprg/notion-arabs/settings/secrets/actions`

Verify these secrets exist:
- `EC2_HOST`: `ec2-50-19-23-245.compute-1.amazonaws.com`
- `EC2_USERNAME`: `ubuntu`
- `EC2_SSH_KEY`: Your full private key

### 2. Test SSH Connection Manually
```bash
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com
```

### 3. Check EC2 Security Group
- Ensure port 22 (SSH) is open
- Allow inbound connections from GitHub Actions IP ranges

### 4. Verify EC2 Instance Status
- Check if instance is running
- Verify the instance has internet connectivity

### 5. Check GitHub Actions Logs
- Go to GitHub → Actions tab
- Click on the failed workflow
- Check the detailed logs for specific error messages

## Manual Deployment Fallback

If automatic deployment continues to fail, use manual deployment:

```bash
# Connect to EC2
ssh -i "C:\Users\hazem\.ssh\ec2-key.pem" ubuntu@ec2-50-19-23-245.compute-1.amazonaws.com

# Clone/update repository
cd ~
if [ ! -d "notion-arabs" ]; then
  git clone https://github.com/hazemyasserprg/notion-arabs.git
fi

cd notion-arabs
git pull origin main

# Deploy backend
cd backend
chmod +x deploy.sh
./deploy.sh
```

## Security Group Configuration

Make sure your EC2 security group allows:
- **Port 22 (SSH)**: From GitHub Actions IP ranges
- **Port 5000 (Backend)**: From your application's needs
- **Port 80/443 (HTTP/HTTPS)**: If using web interface

## GitHub Actions IP Ranges

GitHub Actions uses dynamic IP ranges. For production, consider:
- Using a static IP for your EC2 instance
- Configuring a VPN connection
- Using GitHub's recommended IP allowlist
