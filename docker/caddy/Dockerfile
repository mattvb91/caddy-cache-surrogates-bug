FROM caddy:2.5.1-builder-alpine

RUN xcaddy build --with github.com/darkweak/souin/plugins/caddy@b74ed599284fc5e5481dd547cdac9ae47a5f527d \
    --with github.com/darkweak/souin@b74ed599284fc5e5481dd547cdac9ae47a5f527d

# See https://caddyserver.com/docs/conventions#file-locations for details
ENV XDG_CONFIG_HOME /config
ENV XDG_DATA_HOME /data

VOLUME /config
VOLUME /data

EXPOSE 80
EXPOSE 2019

WORKDIR /srv