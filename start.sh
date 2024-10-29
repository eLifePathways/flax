#!/bin/bash
# Use wait-for-it to ensure the server is ready
# /usr/local/bin/wait-for-it.sh server:${SERVER_PORT:-3000} --timeout=180 --strict -- true

# Now start supervisord to manage all processes
/usr/bin/supervisord -c /etc/supervisord.conf
