# Search Console and advertising setup

FilePebble has 19 tools, original examples and FAQs on every tool page, contact and terms pages, canonical metadata, and a generated sitemap. These are useful foundations, not a guarantee of search rankings, traffic or ad-network approval. No advertising or tracking scripts are installed.

## Google Search Console

1. Open https://search.google.com/search-console and sign in with the owner's Google account.
2. Add a **Domain property** for filepebble.com, without a protocol or path.
3. Copy the exact DNS verification record supplied by Google. In the Cloudflare zone for filepebble.com, add a TXT record using Google's specified name (normally @) and value. Do not substitute an example token or remove existing records.
4. Return to Search Console and verify. Keep the record afterward; verification is checked periodically.
5. Under Sitemaps, submit https://filepebble.com/sitemap-index.xml. Confirm that Google can retrieve it.
6. Use URL Inspection for the homepage and important tool pages. Check the declared canonical and indexing status, and request indexing where available. Submission does not guarantee indexing.
7. Review impressions, searches and clicks once data appears. Build improvements around searches that bring relevant visitors rather than adding duplicate tool pages.

Alternative: a **URL-prefix property** for https://filepebble.com/ can use Google's HTML tag verification. Add only its content token as PUBLIC_GOOGLE_SITE_VERIFICATION in the production Pages build environment and rebuild. The layout renders the tag when a valid token is supplied. This cannot verify a Domain property. Do not add placeholder tokens.

Official instructions: https://support.google.com/webmasters/answer/9008080

## AdSense site review

1. Create or use the owner's AdSense account at https://adsense.google.com/start/ and supply the owner's real account/payment information directly to Google.
2. Add filepebble.com under Sites and follow Google's current verification instructions.
3. If Google offers the **meta tag** verification method, add the account ID supplied by Google as PUBLIC_GOOGLE_ADSENSE_ACCOUNT in the production Pages build environment. Use ca-pub- followed by the actual 16 digits, then rebuild. This emits account metadata only: it does not load advertising scripts or show ads.
4. Confirm the live tag, finish verification in AdSense and request review. Resolve Google's feedback if the site is not approved. The current implementation does not submit an application on the owner's behalf.
5. If Google requests ads.txt, publish the exact authorised seller line from the owner's account. No invented publisher ID or placeholder ads.txt is included.

Google reviews original useful content and usability. A number of tools or pages alone does not ensure approval.

Official instructions:
- https://support.google.com/adsense/answer/12169212
- https://support.google.com/adsense/answer/7299563

## Before serving ads

Use a separate implementation change once the account and requirements are known:

- Update the privacy page to identify Google and any other advertising providers, cookie/device-data use and applicable user controls. The current no-trackers wording must change when scripts are added.
- Configure the consent flow appropriate to the actual traffic. Google requires a certified TCF-integrated CMP for personalised ads in the EEA, UK and Switzerland. Review current requirements and test accept, reject and manage-options behaviour.
- Add narrow CSP permissions for the actual scripts, frames, images and network endpoints. Do not broadly disable the current policy.
- Keep ad code outside the file-processing editors and workers. Never send input text, filenames, documents or generated outputs as analytics/ad targeting data.
- Start with clearly labelled placements away from upload, process and download buttons. Test mobile layouts, keyboard navigation, layout shift, real downloads and file processing with consent both granted and denied.
- Use the actual account's authorised ads.txt entry if required. Verify ad serving and policy status in AdSense.

Official privacy and consent requirements:
- https://support.google.com/adsense/answer/1348695
- https://support.google.com/adsense/answer/13554116

## Current owner actions

- Verify the Search Console property and submit the sitemap.
- Supply the actual AdSense account ID if using meta-tag verification.
- Optionally provide a dedicated public support email; current support uses the public GitHub project.

These identifiers are public verification metadata, not passwords. Never commit Google account credentials, Cloudflare API tokens or payment details.
