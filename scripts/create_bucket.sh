#!/usr/bin/env -S bash -e

AWS_ACCESS_KEY_ID=accessKey1 AWS_SECRET_ACCESS_KEY=secretKey1 aws \
    s3api \
    --endpoint "http://localhost:8020" \
    create-bucket \
    --acl private \
    --bucket authentik-media
