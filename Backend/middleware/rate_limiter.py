# C:\Users\aanus\Desktop\Maximally AI Shipathon\Backend\middleware\rate_limiter.py
from functools import wraps
from flask import request, jsonify
from collections import defaultdict, deque
import time
import threading

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(deque)
        self.lock = threading.Lock()
    
    def is_allowed(self, key, limit=100, window=3600):
        now = time.time()
        with self.lock:
            requests = self.requests[key]
            while requests and requests[0] <= now - window:
                requests.popleft()
            if len(requests) >= limit:
                return False
            requests.append(now)
            return True

rate_limiter = RateLimiter()

def limit_requests(limit=100, window=3600):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            client_ip = (
                request.headers.get('X-Forwarded-For', request.remote_addr)
                or request.environ.get('HTTP_X_REAL_IP')
            )
            if not rate_limiter.is_allowed(client_ip, limit, window):
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'limit': limit,
                    'window_seconds': window
                }), 429
            return f(*args, **kwargs)
        return decorated
    return decorator
