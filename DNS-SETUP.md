# DNS Setup for api.notionarabs.com

## ✅ What's Done

1. ✅ Updated backend CORS to allow `api.notionarabs.com`
2. ✅ Added custom domain to Heroku
3. ✅ Got DNS target from Heroku

## 🔧 DNS Configuration Required

You need to add a **CNAME record** in your DNS provider (where you manage notionarabs.com):

### DNS Record Details:

- **Type:** CNAME
- **Name/Host:** `api`
- **Value/Target:** `whispering-cabbage-jhdlgz65bi6bnq2h8rtbulm9.herokudns.com`
- **TTL:** 3600 (or default)

### Where to Add This:

1. Go to your DNS provider (e.g., Cloudflare, Google Domains, GoDaddy, Namecheap, etc.)
2. Find your domain `notionarabs.com`
3. Add a new CNAME record with the details above
4. Save the changes

### Examples by Provider:

#### Cloudflare:
1. Login to Cloudflare
2. Select your domain `notionarabs.com`
3. Go to DNS → Records
4. Click "Add record"
5. Type: CNAME
6. Name: `api`
7. Target: `whispering-cabbage-jhdlgz65bi6bnq2h8rtbulm9.herokudns.com`
8. Save

#### Google Domains:
1. Login to Google Domains
2. Select `notionarabs.com`
3. Go to DNS → Custom records
4. Add: Type CNAME, Name `api`, Data `whispering-cabbage-jhdlgz65bi6bnq2h8rtbulm9.herokudns.com`
5. Save

#### GoDaddy:
1. Login to GoDaddy
2. Go to DNS Management for `notionarabs.com`
3. Add new CNAME record
4. Host: `api`, Points to: `whispering-cabbage-jhdlgz65bi6bnq2h8rtbulm9.herokudns.com`

## ⏱️ DNS Propagation

After adding the DNS record:
- DNS can take anywhere from **5 minutes to 48 hours** to propagate
- Usually takes 15-30 minutes
- You can check status with: `dig api.notionarabs.com` or `nslookup api.notionarabs.com`

## ✅ Verify DNS Setup

Once DNS propagates, Heroku will automatically provision SSL certificate.

Check status:
```powershell
heroku domains -a notion-arabs
```

The SNI Endpoint column should show "✓ Secure" when ready.

## 🚀 After DNS is Configured

Your API will be available at:
```
https://api.notionarabs.com
```

Update your frontend to use this URL instead of the Heroku URL.

## 📋 Quick Commands

```powershell
# Check domain status
heroku domains -a notion-arabs

# Wait for domain activation
heroku domains:wait api.notionarabs.com -a notion-arabs

# View domain info
heroku domains:info api.notionarabs.com -a notion-arabs

# Check if DNS is resolving
nslookup api.notionarabs.com

# Remove domain (if needed)
# heroku domains:remove api.notionarabs.com -a notion-arabs
```

