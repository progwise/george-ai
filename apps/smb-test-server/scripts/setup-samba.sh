#!/bin/sh
set -e

echo ">> Setting up Samba users and groups..."

# Create system groups with specific GIDs
addgroup -g 2001 readers || true
addgroup -g 2002 writers || true
addgroup -g 2003 admins || true

# Create users with specific UIDs and add to groups
adduser -u 1001 -G users -D testuser1 || true
adduser -u 1002 -G users -D testuser2 || true
adduser -u 1003 -G users -D readonly || true  
adduser -u 1004 -G users -D admin || true

# Add users to additional groups
adduser testuser1 readers || true
adduser testuser1 writers || true
adduser testuser2 readers || true
adduser testuser2 writers || true
adduser readonly readers || true
adduser admin readers || true
adduser admin writers || true
adduser admin admins || true

# Set system passwords (optional, for local login)
echo "testuser1:password123" | chpasswd
echo "testuser2:password456" | chpasswd
echo "readonly:readonly123" | chpasswd
echo "admin:admin123" | chpasswd

# Add users to Samba password database
echo -e "password123\npassword123" | smbpasswd -a -s testuser1
echo -e "password456\npassword456" | smbpasswd -a -s testuser2
echo -e "readonly123\nreadonly123" | smbpasswd -a -s readonly
echo -e "admin123\nadmin123" | smbpasswd -a -s admin

# Enable Samba users
smbpasswd -e testuser1
smbpasswd -e testuser2
smbpasswd -e readonly
smbpasswd -e admin

echo ">> Samba setup complete!"