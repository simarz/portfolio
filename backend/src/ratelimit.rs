//! Tiny in-memory, per-key sliding-window rate limiter for the contact endpoint.
//!
//! Single-process and dependency-free — fine for a one-instance app. Keys are
//! client IPs (extracted from the proxy's forwarded header in the handler).

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

pub struct RateLimiter {
    max: usize,
    window: Duration,
    hits: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new(max: usize, window: Duration) -> Self {
        Self {
            max,
            window,
            hits: Mutex::new(HashMap::new()),
        }
    }

    /// Records a hit for `key` and returns `true` if it's within the allowed
    /// rate (at most `max` hits per `window`), `false` if the limit is exceeded.
    pub fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut map = self.hits.lock().unwrap_or_else(|e| e.into_inner());

        // Bound memory: if many unique IPs accumulate, drop ones with no recent
        // hits before inserting more.
        if map.len() > 4096 {
            map.retain(|_, times| times.iter().any(|t| now.duration_since(*t) < self.window));
        }

        let times = map.entry(key.to_owned()).or_default();
        times.retain(|t| now.duration_since(*t) < self.window);
        if times.len() >= self.max {
            return false;
        }
        times.push(now);
        true
    }
}
