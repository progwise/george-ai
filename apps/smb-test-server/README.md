# SMB Test Server

A Docker-based SMB (Samba) test server for development and testing purposes. This server provides multiple file shares with different permission levels and test data to simulate a corporate file sharing environment.

## Quick Start

**Test basic connectivity:**

```bash
smbclient -L //gai-smb-test -p 445 -U testuser1
```

_Note: The SMB server auto-starts when working in devcontainer._

## Server Configuration

### Available Shares

| Share Name    | Path                  | Access Level | Description                          |
| ------------- | --------------------- | ------------ | ------------------------------------ |
| `public`      | `/shares/public`      | Read-only    | Company-wide announcements, policies |
| `documents`   | `/shares/documents`   | Read/Write   | General documents, reports           |
| `private`     | `/shares/private`     | Admin only   | Confidential files                   |
| `engineering` | `/shares/engineering` | Read/Write   | Engineering department files         |
| `marketing`   | `/shares/marketing`   | Read/Write   | Marketing department files           |

### Test Users

| Username    | Password      | Groups                   | Access Level              |
| ----------- | ------------- | ------------------------ | ------------------------- |
| `testuser1` | `password123` | readers, writers         | Read/Write to most shares |
| `testuser2` | `password456` | readers, writers         | Read/Write to most shares |
| `readonly`  | `readonly123` | readers                  | Read-only access          |
| `admin`     | `admin123`    | readers, writers, admins | Full access to all shares |

## Testing Commands

### 1. Check if Server is Running

Test basic connectivity and list available shares:

```bash
# List all shares (will prompt for password)
smbclient -L //gai-smb-test -p 445 -U testuser1

# List shares with inline password (for automation)
smbclient -L //gai-smb-test -p 445 -U testuser1%password123
```

Expected output should show all available shares: `public`, `documents`, `private`, `engineering`, `marketing`.

### 2. Connect to Specific Shares

#### Connect to Public Share (Read-only)

```bash
# Interactive connection
smbclient //gai-smb-test/public -p 445 -U testuser1

# With inline password
smbclient //gai-smb-test/public -p 445 -U testuser1%password123
```

#### Connect to Documents Share (Read/Write)

```bash
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123
```

#### Connect to Engineering Share

```bash
smbclient //gai-smb-test/engineering -p 445 -U testuser1%password123
```

### 3. Basic SMB Commands

Once connected to a share, you can use these commands:

```bash
# List files and directories
ls

# Change directory
cd subdirectory

# Download a file
get filename.txt

# Upload a file (if you have write access)
put localfile.txt remotefile.txt

# Show current directory
pwd

# Get file info
stat filename.txt

# Exit
quit
```

### 4. Test Different Access Levels

#### Test Read-only Access

```bash
# Connect as readonly user to documents share
smbclient //gai-smb-test/documents -p 445 -U readonly%readonly123

# Try to upload (should fail)
# put somefile.txt
```

#### Test Admin Access to Private Share

```bash
# Only admin can access private share
smbclient //gai-smb-test/private -p 445 -U admin%admin123
```

#### Test Failed Access

```bash
# This should fail - readonly user cannot access private share
smbclient //gai-smb-test/private -p 445 -U readonly%readonly123
```

### 5. Scripted Testing

Create a test script to verify all functionality:

```bash
#!/bin/bash
# test-smb-server.sh

echo "=== Testing SMB Server Connectivity ==="

# Test 1: Server is running and shares are listed
echo "1. Testing server connectivity..."
if smbclient -L //gai-smb-test -p 445 -U testuser1%password123 > /dev/null 2>&1; then
    echo "✅ Server is running and accessible"
else
    echo "❌ Server is not accessible"
    exit 1
fi

# Test 2: Can connect to public share
echo "2. Testing public share access..."
if echo "ls" | smbclient //gai-smb-test/public -p 445 -U testuser1%password123 > /dev/null 2>&1; then
    echo "✅ Public share accessible"
else
    echo "❌ Cannot access public share"
fi

# Test 3: Can connect to documents share
echo "3. Testing documents share access..."
if echo "ls" | smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 > /dev/null 2>&1; then
    echo "✅ Documents share accessible"
else
    echo "❌ Cannot access documents share"
fi

# Test 4: Admin can access private share
echo "4. Testing private share access (admin)..."
if echo "ls" | smbclient //gai-smb-test/private -p 445 -U admin%admin123 > /dev/null 2>&1; then
    echo "✅ Private share accessible by admin"
else
    echo "❌ Admin cannot access private share"
fi

# Test 5: Regular user cannot access private share
echo "5. Testing private share access denial..."
if echo "ls" | smbclient //gai-smb-test/private -p 445 -U testuser1%password123 > /dev/null 2>&1; then
    echo "❌ Private share accessible by regular user (security issue!)"
else
    echo "✅ Private share properly restricted"
fi

echo "=== Test Complete ==="
```

### 6. Test Data Structure

The server includes comprehensive test data:

```bash
# Explore the test data structure
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 -c "ls"

# Navigate to nested directories
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 -c "cd projects; ls"

# Download sample files for testing
smbclient //gai-smb-test/public -p 445 -U testuser1%password123 -c "get public_document.txt"
```

### 7. File Type Testing

The server contains various file types for testing file conversion:

```bash
# List different file types
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 -c "ls reports/"

# Download different file types
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 -c "get reports/quarterly_report_1.docx"
smbclient //gai-smb-test/engineering -p 445 -U testuser1%password123 -c "get code/sample_script.py"
```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   ```bash
   # Check if container is running
   docker ps | grep smb

   # Check container logs
   docker logs smb-test-server
   ```

2. **Authentication Failed**

   - Verify username/password combinations from the table above
   - Ensure you're using the correct port (10445)

3. **Permission Denied**

   - Check if the user has access to the specific share
   - Verify user group membership in the configuration

4. **Share Not Found**
   ```bash
   # List available shares to verify names
   smbclient -L //gai-smb-test -p 445 -U testuser1%password123
   ```

### Debugging Commands

```bash
# Check SMB protocol versions supported
smbclient -L //gai-smb-test -p 445 -U testuser1%password123 --option='client min protocol=SMB2'

# Verbose connection for debugging
smbclient //gai-smb-test/documents -p 445 -U testuser1%password123 -d 3

# Test with different authentication methods
smbclient //gai-smb-test/documents -p 445 -U testuser1 --no-pass
```

## Integration with George AI

This test server is designed to work with the George AI SMB crawler. The default credentials used in the crawler are:

- **Username:** `testuser1`
- **Password:** `password123`

### Testing SMB Crawler

Use these URIs to test the SMB crawler:

```
//gai-smb-test/public
//gai-smb-test/documents
//gai-smb-test/documents/projects
//gai-smb-test/engineering/code
//gai-smb-test/marketing/campaigns
```

Example crawler configuration:

- **URI:** `//gai-smb-test/documents`
- **Max Depth:** `3`
- **Max Pages:** `50`

## File Structure

```
smb-test-server/
├── README.md              # This file
├── Dockerfile             # SMB server container
├── config/
│   └── smb.conf           # Samba configuration
└── scripts/
    ├── setup-samba.sh     # User and group setup
    └── setup-testdata.sh  # Test data generation
```

## Development

To modify the server configuration:

1. Edit `config/smb.conf` for share settings
2. Edit `scripts/setup-samba.sh` for user management
3. Edit `scripts/setup-testdata.sh` for test data
4. Rebuild the container: `docker-compose up --build`

---

**Note:** This is a development/testing server only. Do not use in production environments.
