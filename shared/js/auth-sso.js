/**
 * COSYlanguages Ecosystem Single Sign-On (SSO) Handler
 * Restores sessions from hash tokens and appends session transfer tokens to ecosystem links.
 */

window.CosySSO = window.CosySSO || {};

(function () {
  /**
   * Helper to get or initialize the Supabase client
   */
  function getSupabaseClient() {
    if (window.CosyAuth && window.CosyAuth.client) {
      return window.CosyAuth.client;
    }
    const config = window.COSY_CONFIG || {};
    const url = config.SUPABASE_URL || '';
    const key = config.SUPABASE_ANON_KEY || '';
    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        const client = window.supabase.createClient(url, key);
        if (window.CosyAuth) window.CosyAuth.client = client;
        return client;
      } catch (e) {
        console.error('[CosySSO] Error creating Supabase client:', e);
      }
    }
    return null;
  }

  /**
   * Parses access_token and refresh_token from location hash
   */
  function parseHashTokens(hashStr) {
    if (!hashStr) return null;
    const cleanHash = hashStr.startsWith('#') ? hashStr.substring(1) : hashStr;
    if (!cleanHash.includes('access_token=') || !cleanHash.includes('refresh_token=')) {
      return null;
    }
    const params = new URLSearchParams(cleanHash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      return { access_token, refresh_token };
    }
    return null;
  }

  /**
   * Restores user session if tokens are in window.location.hash
   */
  async function restoreSessionFromHash() {
    const tokens = parseHashTokens(window.location.hash);
    if (!tokens) return false;

    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      });

      if (!error && data && data.session) {
        // Clean URL hash fragment seamlessly after session restore
        const cleanUrl = window.location.pathname + window.location.search;
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, cleanUrl);
        } else {
          window.location.hash = '';
        }

        if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('/login')) {
          await autoRedirectFromLogin(supabase, data.session.user);
        }

        return true;
      } else if (error) {
        console.warn('[CosySSO] setSession error:', error.message);
      }
    } catch (err) {
      console.error('[CosySSO] Exception in restoreSessionFromHash:', err);
    }
    return false;
  }

  /**
   * Appends session transfer tokens to ecosystem link URL
   */
  // Session tokens may only be transferred to trusted COSY app origins.
  // GitHub Pages hosts the COSY ecosystem under paths on this shared origin.
  function isTrustedEcosystemUrl(targetHref) {
    if (!targetHref || typeof targetHref !== 'string') return false;
    try {
      const target = new URL(targetHref, window.location.href);
      if (target.protocol !== 'https:' && target.origin !== window.location.origin) return false;
      const trustedOrigins = new Set([
        window.location.origin,
        'https://cosylanguages.github.io'
      ]);
      return target.protocol === 'https:' && trustedOrigins.has(target.origin);
    } catch (e) {
      return false;
    }
  }

  function buildEcosystemUrlWithTokens(targetHref, accessToken, refreshToken) {
    if (!targetHref || !accessToken || !refreshToken || !isTrustedEcosystemUrl(targetHref)) {
      return targetHref;
    }

    try {
      const target = new URL(targetHref, window.location.href);
      const hashParams = new URLSearchParams(target.hash.startsWith('#') ? target.hash.slice(1) : target.hash);
      hashParams.set('access_token', accessToken);
      hashParams.set('refresh_token', refreshToken);
      target.hash = hashParams.toString();
      return target.href;
    } catch (e) {
      return targetHref;
    }
  }

  /**
   * Transfers session tokens only to allowlisted HTTPS COSY ecosystem links.
   */
  async function handleEcosystemClick(e) {
    const anchor = e.target ? e.target.closest('a[href*="COSY"], a[href*="cosy"]') : null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!isTrustedEcosystemUrl(href)) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token || !session.refresh_token) return;

      const newUrl = buildEcosystemUrlWithTokens(href, session.access_token, session.refresh_token);
      if (newUrl !== href) anchor.setAttribute('href', newUrl);
    } catch (err) {
      console.error('[CosySSO] Error appending session transfer tokens:', err);
    }
  }

  /**
   * Export functions on window.CosySSO
   */
  async function autoRedirectFromLogin(supabase, user) {
    if (!user) return;
    let targetPage = 'student.html';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.role) {
        const role = profile.role.toLowerCase();
        if (role === 'founder') targetPage = 'founder.html';
        else if (role === 'teacher') targetPage = 'teacher.html';
        else targetPage = 'student.html';
      }
    } catch (e) {}

    const urlParams = new URLSearchParams(window.location.search);
    const redirectTarget = urlParams.get('redirect');
    // Only follow redirects to another .html page in this same app folder.
    // Anything else (other sites, other repos, deeper paths) is ignored.
    let safeTarget = null;
    if (redirectTarget) {
      try {
        const parsed = new URL(redirectTarget, window.location.href);
        const loginPath = window.location.pathname;
        const folderPath = loginPath.substring(0, loginPath.lastIndexOf('/') + 1);
        if (
          (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          parsed.origin === window.location.origin &&
          parsed.pathname.startsWith(folderPath)
        ) {
          const rel = parsed.pathname.substring(folderPath.length);
          if (rel && !rel.includes('/') && rel.endsWith('.html') && rel !== 'login.html') {
            safeTarget = rel + parsed.search + parsed.hash;
          }
        }
      } catch (e) {}
    }
    window.location.href = safeTarget || targetPage;
  }

  window.CosySSO.parseHashTokens = parseHashTokens;
  window.CosySSO.restoreSessionFromHash = restoreSessionFromHash;
  window.CosySSO.buildEcosystemUrlWithTokens = buildEcosystemUrlWithTokens;
  window.CosySSO.autoRedirectFromLogin = autoRedirectFromLogin;

  // Execute restoreSessionFromHash on script load
  if (typeof window !== 'undefined') {
    restoreSessionFromHash();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', handleEcosystemClick, { capture: true });
      });
    } else {
      document.addEventListener('click', handleEcosystemClick, { capture: true });
    }
  }
})();