# Fast Fleet Repair: landing page

A small site: a landing page with a scroll animation (a broken-down semi, the Fast Fleet Repair service truck
that pulls up, and the semi getting fixed once the service truck reaches it), plus a services page.
Plain HTML, CSS and JavaScript, no build step.

## Run it on your computer

1. Open a terminal in this folder (the one containing `index.html`).
2. Start a local server:
   - macOS / Linux: `python3 -m http.server 8000`
   - Windows: `py -m http.server 8000` (or `python -m http.server 8000`)
   - Or, with Node installed: `npx serve`
3. Open http://localhost:8000 in your browser.
4. Phone preview: press F12, then Ctrl+Shift+M (Cmd+Shift+M on Mac), pick a phone, and reload.
5. On a real phone: connect it to the same Wi-Fi and open `http://YOUR-COMPUTER-IP:8000`.
6. Stop the server with Ctrl+C.

## Put it online

The live site is https://fastfleetrepair.ca, on Spaceship shared hosting (cPanel, LiteSpeed server). The domain
and its free SSL certificate are set up there, and the server already sends http:// visitors to https://.
Email for the domain (info@) runs on Microsoft 365, separately from the hosting.

First upload, or a full update:

1. In this folder run `py make-release.py 1.0.0` (a new version number each time). It writes
   `release/fast-fleet-repair-v1.0.0.zip` with only the files the website needs.
2. Spaceship: Hosting Manager → Go to cPanel → File Manager. Open the site folder: on Spaceship it is named after
   the domain, `fastfleetrepair.ca` (Hosting Manager → Manage → Advanced shows it as the document root).
3. Upload the ZIP into that folder, right-click it → Extract (into the same folder, overwriting old files), then
   delete the ZIP. `index.html` must sit directly in the site folder, next to the `services`, `css`, `js`, `fonts`
   and `brand` folders.
4. Open https://fastfleetrepair.ca and press Ctrl+Shift+R.

Small update (one or two files): in File Manager, open the matching folder inside the site folder (for example
`css`) and upload the changed file over the old one. `.htaccess` is hidden: Settings → Show Hidden Files.

## Folder

```
index.html            landing page and the scene (inline SVG, id="scene")
services/index.html   "Repair services that we provide" page, one card per service (address: /services/)
css/style.css         colours, type and layout for both pages (palette at the top)
js/main.js            the scroll animation (landing page only)
js/site.js            email checklist + popup, smooth in-page links, footer year (both pages)
js/vendor/            GSAP 3.15 + ScrollTrigger (local copies, works offline)
fonts/                Teko (headlines) and Michroma (wordmark)
brand/                logo files (SVG with outlined lettering, PNG) and how to use them: brand/README.md
.htaccess             live server settings: no folder listings, www -> fastfleetrepair.ca, caching
make-release.py       builds the upload ZIP for the live site (see "Put it online")
```

## Edit the details

- Phone: search `index.html` and `services/index.html` for `15147707087` (Call now links) and `+1 (514) 770-7087` (shown on the page).
- Email: search both pages for `info@fastfleetrepair.ca`.
- What customers are asked to include in an email (popup and pre-filled message): the `.mail-tip` list in `index.html`
  and `BODY` at the top of `js/site.js`. Keep the two in step.
- Services: the full cards are in `services/index.html`; the short cards on the landing page link to them by id
  (`#emergency`, `#maintenance`, `#yard`, `#fabrication`).
- Addresses: the pages open as `/` and `/services/`, with no file names. Link to them that way: `services/` from
  the landing page, `../` from the services page. The services page loads its files with `../` in front (for
  example `../css/style.css`). `.htaccess` sends old addresses such as `/services.html` to the clean ones.
- Logo (the Hex Badge): the header/footer lockup and the full badge are SVG symbols, `#ffr-lockup` and
  `#ffr-badge`, in the sprite at the top of `index.html` and `services/index.html` (keep the two copies identical).
  They are placed with `<use>`: the header on both pages (badge), the landing page footer (the lockup cropped
  to the wordmark, no hex), the contact section, the services page head
  and the service truck's door in the hero. The favicon (hex "F" icon) is inline in each page's `<head>`.
- Colours: top of `css/style.css` (`--amber`, `--charcoal`, ...), taken from the business card.
  The amber in the drawing itself is `#F2A51A`.
- Fonts: Teko (headlines, as on the card) and Michroma (wordmark).

## Swapping in final 2D or 3D art

The artwork is placeholder vector art inside `<svg id="scene">`. The animation moves these named parts,
so new art should keep the same ids (or update the selectors in `js/main.js`):

| id / class            | what it is                         | what the animation does          |
|-----------------------|------------------------------------|----------------------------------|
| `#van`                | the service truck                  | drives in and stops              |
| `.van-spin`           | service truck wheels               | spin while driving               |
| `.bar-a`, `.bar-b`    | amber light bar                    | flashes                          |
| `#workLight`          | rear floodlight beam               | lights the engine during repair  |
| `#weld`, `.spark`     | welding flash and sparks           | shown during the repair          |
| `#tractor`            | semi cab, hood and front wheel     | front end sags, then lifts       |
| `#hood`               | semi hood                          | open at start, closes            |
| `#wheelFrontSag`      | flat front tire                    | inflates                         |
| `#smoke`, `#exhaust`  | engine smoke / exhaust             | smoke clears, exhaust starts     |
| `#hazardsFront/Rear`  | hazard lights                      | blink, then switch off           |
| `#beamFront`          | semi headlight beam                | turns on when fixed              |
| `#rays`               | sunburst behind the scene          | brightens at the end             |

Parts that rotate or squash keep their pivot in a `data-origin="x y"` attribute (scene coordinates).
For 3D art, the lightest option on phones is a Blender render played as image frames on scroll.

## Accessibility and fallbacks

- Visitors who prefer reduced motion, or have JavaScript off, see the finished scene with all captions listed.
- Call now and Send an email stay on screen the whole time.

## Licences

- GSAP: free, including commercial use, under GreenSock's standard licence (https://gsap.com/standard-license).
- Teko and Michroma: SIL Open Font License 1.1.
