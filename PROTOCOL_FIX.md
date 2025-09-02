# 🚨 Protocol Fix - SFTP Not Supported

## Issue
```
Error: protocol: invalid parameter - you provided "sftp". 
Try "ftp", "ftps", or "ftps-legacy" instead.
```

## Root Cause
The SamKirkland/FTP-Deploy-Action doesn't support SFTP protocol. It only supports:
- `ftp` - Standard FTP
- `ftps` - FTP over SSL/TLS 
- `ftps-legacy` - Legacy FTPS

## ✅ Solution Applied
Reverted back to standard FTP:
```yaml
protocol: ftp
port: 21
```

## 🔍 Why The Authentication Failed Before
The original authentication failure (530 Login authentication failed) was likely due to:
1. **Wrong password format** - special characters or spaces
2. **Username format** - might need full format like `dev@charlitexmobile.com`
3. **Server configuration** - may require passive mode or specific settings

## 🚀 Next Steps After This Fix

### If FTP Still Fails with Authentication:
1. **Try FTPS** (more secure):
   ```yaml
   protocol: ftps
   port: 21
   ```

2. **Check username format**:
   - Current: `dev`
   - Try: `dev@charlitexmobile.com`
   - Or check exact format in cPanel

3. **Verify password** in cPanel:
   - Test by resetting FTP password
   - Ensure no special characters cause issues

## 🔧 Alternative Protocols to Try

### Option 1: Standard FTP (Applied)
```yaml
protocol: ftp
port: 21
```

### Option 2: FTPS (Secure FTP)
```yaml
protocol: ftps
port: 21
```

### Option 3: FTPS Legacy
```yaml
protocol: ftps-legacy
port: 21
```

## 📋 Current Configuration
- **Protocol**: FTP (standard)
- **Port**: 21
- **Server**: ftp.charlitexmobile.com
- **Username**: dev
- **Password**: [secret]
- **Directory**: /public_html/

## 🎯 Status
- Protocol fixed ✅
- Ready for deployment test ✅
- May need credential adjustment if auth fails ⚠️
