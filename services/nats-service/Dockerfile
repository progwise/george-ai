FROM nats:2.12-alpine

# Copy NATS server configuration with JetStream enabled
COPY nats-server.conf /etc/nats/nats-server.conf

# Use the config file
CMD ["--config", "/etc/nats/nats-server.conf"]
