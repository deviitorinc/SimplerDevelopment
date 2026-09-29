FROM alpine:latest
RUN apk add --no-cache curl && curl -sSL https://dl.min.io/server/minio/release/linux-amd64/minio -o /bin/minio && chmod +x /bin/minio
EXPOSE 9000 9001
ENTRYPOINT ["/bin/minio"]
