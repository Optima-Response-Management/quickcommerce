<?php

declare(strict_types=1);

/*
 * Quickcommerce same-origin API proxy.
 *
 * Browser:
 *   https://quickcommerce.optimaresponse.com/api/...
 *
 * Upstream:
 *   https://quickcommerce-v795.onrender.com/api/...
 *
 * Never accept the upstream URL from a query parameter.
 */

const UPSTREAM_BASE = 'https://quickcommerce-v795.onrender.com/api';

if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'The server does not have the PHP cURL extension enabled.',
    ]);

    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$allowedMethods = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
];

if (!in_array($method, $allowedMethods, true)) {
    http_response_code(405);
    header('Allow: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    exit;
}

/*
 * Resolve the incoming path and permit only /api routes.
 */
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$incomingPath = parse_url($requestUri, PHP_URL_PATH);

if (!is_string($incomingPath)) {
    http_response_code(400);
    exit('Invalid request path');
}

if (
    !preg_match('~^/api(?:/|$)~', $incomingPath) ||
    str_contains($incomingPath, '\\') ||
    preg_match('~(?:^|/)\.\.(?:/|$)~', $incomingPath)
) {
    http_response_code(404);
    exit('Not found');
}

$upstreamPath = substr($incomingPath, 4);

if ($upstreamPath === '') {
    $upstreamPath = '/';
}

/*
 * Keep the destination fixed. Never forward a user-provided hostname.
 */
$upstreamUrl = UPSTREAM_BASE . $upstreamPath;

if (!empty($_SERVER['QUERY_STRING'])) {
    $upstreamUrl .= '?' . $_SERVER['QUERY_STRING'];
}

/*
 * Forward only relevant request headers.
 * The Cookie header is necessary for HttpOnly authentication.
 */
$forwardHeaders = [
    'Accept',
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-CSRF-Token',
    'X-Requested-With',
];

$headers = [];

foreach ($forwardHeaders as $name) {
    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));

    if ($name === 'Content-Type') {
        $value = $_SERVER['CONTENT_TYPE'] ?? '';
    } elseif ($name === 'Authorization') {
        $value = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';
    } else {
        $value = $_SERVER[$serverKey] ?? '';
    }

    if ($value !== '') {
        $headers[] = $name . ': ' . $value;
    }
}

/*
 * Forward Origin when present. The backend can still apply its
 * configured origin policy.
 */
if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $headers[] = 'Origin: ' . $_SERVER['HTTP_ORIGIN'];
}

$ch = curl_init($upstreamUrl);

if ($ch === false) {
    http_response_code(500);
    exit('Could not initialize API proxy');
}

$responseHeaders = [];

curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,

    CURLOPT_HEADERFUNCTION => function ($curl, string $line) use (&$responseHeaders): int {
        $length = strlen($line);
        $trimmed = trim($line);

        if ($trimmed === '') {
            return $length;
        }

        // Ignore interim response status lines and start fresh.
        if (preg_match('~^HTTP/\S+\s+\d+~i', $trimmed)) {
            $responseHeaders = [];
            return $length;
        }

        $separator = strpos($trimmed, ':');

        if ($separator !== false) {
            $name = strtolower(trim(substr($trimmed, 0, $separator)));
            $value = trim(substr($trimmed, $separator + 1));

            $responseHeaders[$name][] = $value;
        }

        return $length;
    },
]);

/*
 * Forward request body.
 * For multipart uploads, rebuild fields and file parts from PHP's
 * parsed request data. For other methods, forward the raw body.
 */
$contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    if (str_contains($contentType, 'multipart/form-data')) {
        $postFields = $_POST;

        foreach ($_FILES as $fieldName => $fileInfo) {
            if (
                isset($fileInfo['tmp_name']) &&
                is_string($fileInfo['tmp_name']) &&
                is_uploaded_file($fileInfo['tmp_name'])
            ) {
                $postFields[$fieldName] = new CURLFile(
                    $fileInfo['tmp_name'],
                    $fileInfo['type'] ?: 'application/octet-stream',
                    $fileInfo['name'] ?: 'upload.bin'
                );
            }
        }

        // Let cURL generate the multipart Content-Type and boundary.
        $headers = array_values(array_filter(
            $headers,
            static fn ($header) => stripos($header, 'Content-Type:') !== 0
        ));

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } else {
        $body = file_get_contents('php://input');

        if ($body !== false && $body !== '') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    }
}

/*
 * Execute the upstream request.
 */
$responseBody = curl_exec($ch);

if ($responseBody === false) {
    error_log('Quickcommerce proxy failure: ' . curl_error($ch));

    curl_close($ch);

    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'The API server could not be reached.',
    ]);

    exit;
}

$statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

/*
 * Forward the upstream status and selected response headers.
 * Set-Cookie must be preserved, but an upstream Domain attribute
 * must not be forwarded if it belongs to the Render host.
 */
http_response_code($statusCode);

$allowedResponseHeaders = [
    'content-type',
    'cache-control',
    'content-disposition',
    'retry-after',
    'x-request-id',
];

foreach ($allowedResponseHeaders as $name) {
    if (!empty($responseHeaders[$name])) {
        foreach ($responseHeaders[$name] as $value) {
            header($name . ': ' . $value, false);
        }
    }
}

if (!empty($responseHeaders['set-cookie'])) {
    foreach ($responseHeaders['set-cookie'] as $cookie) {
        // Remove a Domain attribute so the browser stores the cookie
        // for quickcommerce.optimaresponse.com, not the Render host.
        $cookie = preg_replace(
            '/;\s*Domain=[^;]*/i',
            '',
            $cookie
        );

        header('Set-Cookie: ' . $cookie, false);
    }
}

if ($method !== 'HEAD') {
    echo $responseBody;
}