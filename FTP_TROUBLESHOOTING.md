# 🚨 FTP Authentication Failure - Troubleshooting Guide

## Error Analysis
```
> USER ***
< 331 User *** OK. Password required
> PASS ###
< 530 Login authentication failed
```

**Status**: Username accepted ✅, Password rejected ❌

## 🔍 Possible Causes & Solutions

### 1. **Wrong Password** (Most Common)
**Issue**: Password might be incorrect or has special characters
**Solutions**:
- Double-check cPanel password
- Try logging into cPanel manually to verify
- Check for extra spaces or special characters

### 2. **Wrong Username Format**
**Current**: `dev`
**Possible Formats**:
- `dev@charlitexmobile.com`
- `charlitex_dev`
- Full cPanel username (check cPanel)

### 3. **FTP vs SFTP Protocol Issue**
**Error suggests**: "server only supports SFTP"
**Solution**: Switch from FTP to SFTP

### 4. **Server Configuration**
**Possible Issues**:
- FTP disabled on server
- IP restrictions
- Port blocked (21 for FTP, 22 for SFTP)

## ✅ Step-by-Step Fix

### Step 1: Verify Credentials in cPanel
1. Login to your HostPapa cPanel
2. Go to **File Manager** or **FTP Accounts**
3. Confirm:
   - Exact FTP server address
   - Correct username format
   - Password (test by changing if needed)

### Step 2: Try SFTP Instead of FTP
Update the pipeline to use SFTP (more secure and commonly supported):

```yaml
protocol: sftp
port: 22
```

### Step 3: Test FTP Connection Manually
Try connecting with an FTP client (FileZilla) to verify credentials work.

### Step 4: Check Server Requirements
Some hosts require:
- Passive mode
- Specific port numbers
- SSL/TLS encryption

## 🔧 Quick Fixes to Try

### Fix 1: Switch to SFTP
Most reliable solution - update pipeline configuration.

### Fix 2: Update Username Format
Try full email format: `dev@charlitexmobile.com`

### Fix 3: Password Reset
Reset FTP password in cPanel and update secret.

### Fix 4: Alternative Deployment
Use cPanel File Manager for manual upload if FTP continues failing.

## 🎯 Next Steps
1. Verify credentials in cPanel ✋
2. Try SFTP configuration 🔄
3. Test manual FTP connection 🧪
4. Update GitHub secrets if needed 🔐
