# vendor/

Third-party browser libraries, committed so pages do not depend on a public CDN at runtime.

| Library | Version | File(s) | Source |
| --- | --- | --- | --- |
| @supabase/supabase-js | 2.49.1 | `supabase-js-2.49.1/supabase.js` (+ `591.supabase.js`, a stub that is never used in browsers) | `npm pack @supabase/supabase-js@2.49.1`, `dist/umd/` (same file the `jsdelivr` field pointed to) |
| peerjs | 1.5.2 | `peerjs-1.5.2/peerjs.min.js` | `npm pack peerjs@1.5.2`, `dist/` |

Checksums are in `SHA256SUMS.txt` (verify with `cd vendor && sha256sum -c SHA256SUMS.txt`).

## Updating
1. `npm pack <package>@<new-version>` and copy the same files into a new versioned folder.
2. Update `SHA256SUMS.txt` and the table above.
3. Replace the path in the HTML pages (`grep -rn "vendor/" *.html`) and delete the old folder.

Not vendored: Jitsi `external_api.js` (must come from the Jitsi server) and the Tailwind runtime CDN used by `classroom.html` (to be replaced by a build step).
