"""authentik storage backends"""
from storages.backends.s3 import S3Storage as BaseS3Storage
from storages.utils import clean_name


# pylint: disable=abstract-method
class S3Storage(BaseS3Storage):
    """S3 storage backend"""

    # This is a fix for https://github.com/jschneier/django-storages/pull/839
    # pylint: disable=arguments-differ,no-member
    def url(self, name, parameters=None, expire=None, http_method=None):
        # Preserve the trailing slash after normalizing the path.
        name = self._normalize_name(clean_name(name))
        params = parameters.copy() if parameters else {}
        if expire is None:
            expire = self.querystring_expire

        params["Bucket"] = self.bucket.name
        params["Key"] = name
        url = self.bucket.meta.client.generate_presigned_url(
            "get_object",
            Params=params,
            ExpiresIn=expire,
            HttpMethod=http_method,
        )

        if self.custom_domain:
            # Key parameter can't be empty. Use "/" and remove it later.
            params["Key"] = "/"
            root_url_signed = self.bucket.meta.client.generate_presigned_url(
                "get_object", Params=params, ExpiresIn=expire
            )
            # Remove signing parameter and previously added key "/".
            root_url = self._strip_signing_parameters(root_url_signed)[:-1]
            # Replace bucket domain with custom domain.
            custom_url = "{}//{}/".format(self.url_protocol, self.custom_domain)
            url = url.replace(root_url, custom_url)

        if self.querystring_auth:
            return url
        return self._strip_signing_parameters(url)
