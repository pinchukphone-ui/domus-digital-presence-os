FROM postgres:16.14-alpine3.24@sha256:57c72fd2a128e416c7fcc499958864df5301e940bca0a56f58fddf30ffc07777

# The upstream image bundles gosu 1.19 built with Go 1.24.6. It is only used
# to drop privileges in the entrypoint. Alpine's su-exec provides the same
# exec-style privilege transition without embedding the vulnerable Go stdlib.
RUN apk add --no-cache 'su-exec=0.3-r0' \
    && sed -i 's/exec gosu postgres/exec \/sbin\/su-exec postgres/' /usr/local/bin/docker-entrypoint.sh \
    && rm -f /usr/local/bin/gosu /usr/local/bin/su-exec \
    && test "$(grep -c '/sbin/su-exec postgres' /usr/local/bin/docker-entrypoint.sh)" -eq 1 \
    && test -x /sbin/su-exec
