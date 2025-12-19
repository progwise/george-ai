FROM ghcr.io/servercontainers/samba:smbd-wsdd2-latest

WORKDIR /app

# Copy scripts first (use paths relative to repo root for CI builds)
COPY apps/smb-test-server/scripts/setup-testdata.sh ./setup-testdata.sh
COPY apps/smb-test-server/scripts/setup-samba.sh ./setup-samba.sh

# Set proper permissions
RUN chmod +x ./setup-samba.sh && \
    chmod +x ./setup-testdata.sh

# Run test data setup
RUN /bin/sh ./setup-testdata.sh && \
    chown -R root:root /shares && \
    chmod -R 755 /shares && \
    chown root:root /

# Some additional test files added
COPY apps/smb-test-server/test-files /shares/documents

# Run samba setup (this must happen after the base image sets up samba)
RUN /bin/sh ./setup-samba.sh

# Copy our custom smb.conf to a temporary location
COPY apps/smb-test-server/config/smb.conf /container/config/samba/smb.conf

EXPOSE 445 139 137/udp 138/udp