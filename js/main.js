/*
  Scroll story: the Fast Fleet Repair service truck pulls up to a broken-down semi and fixes it.

  - The scene is one inline SVG (#scene); the "camera" is its viewBox.
  - One GSAP timeline is tied to scroll (ScrollTrigger scrub + pin). The story runs from 0 to about 7.
  - Small loops (smoke, hazard lights, welding sparks, light bar) run on their own.
  - Reduced motion or no JavaScript: nothing is pinned and the scene shows its finished state.
*/
(() => {
  'use strict';

  const root = document.documentElement;
  const ready = () => root.classList.remove('anim-pending');
  if (!window.gsap || !window.ScrollTrigger) { ready(); return; }
  gsap.registerPlugin(ScrollTrigger);

  const svg = document.getElementById('scene');
  if (!svg) { ready(); return; }
  const one = (s) => svg.querySelector(s);
  const all = (s) => Array.from(svg.querySelectorAll(s));

  /* ---------- camera ---------- */
  let BOTTOM = 900;
  const REF_CX = 1700;
  const cam = { cx: REF_CX, w: 1700 };
  const parallax = [[one('#skyline'), 0.5], [one('#poles'), 0.8], [one('#rays'), 0.3]];

  // The captions hang from the top of the screen and the scene sits on the bottom, so on wide, short
  // screens they collide. The camera never zooms in past the width that keeps the art (from SCENE_TOP
  // down) clear of the caption block.
  const captions = document.querySelector('.captions');
  const CAPTION_GAP = 32; // px between the captions and the top of the art
  let SCENE_TOP = 226;    // scene y of the highest art to keep clear (top of the trailer)
  function minCamWidth(r) {
    if (!captions || !r.width || !r.height) return 0;
    const textBottom = captions.getBoundingClientRect().bottom - r.top + CAPTION_GAP;
    const room = Math.max(r.height - textBottom, r.height * 0.3);
    return (BOTTOM - SCENE_TOP) * r.width / room;
  }

  function applyCam() {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const w = Math.max(cam.w, minCamWidth(r)), h = w / (r.width / r.height);
    svg.setAttribute('viewBox', `${cam.cx - w / 2} ${BOTTOM - h} ${w} ${h}`);
    const d = cam.cx - REF_CX;
    parallax.forEach(([layer, depth]) => layer && layer.setAttribute('transform', `translate(${d * (1 - depth)} 0)`));
  }

  // Rotate / scale an element about the point in its data-origin attribute.
  function pivot(el) {
    const [ox, oy] = el.dataset.origin.split(' ').map(Number);
    const s = { rot: 0, sy: 1 };
    s.update = () => el.setAttribute('transform', `translate(${ox} ${oy}) rotate(${s.rot}) scale(1 ${s.sy}) translate(${-ox} ${-oy})`);
    return s;
  }

  const CAMS = {
    landscape: { bottom: 860, top: 226, start: { cx: 1600, w: 1900 }, end: { cx: 1730, w: 1850 } },
    portrait:  { bottom: 950, top: 298, start: { cx: 1800, w: 580 },  end: { cx: 1930, w: 770 } },
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', portrait: '(max-aspect-ratio: 1/1)' }, (ctx) => {
    const { motion, portrait } = ctx.conditions;
    if (!motion) { ready(); return; }

    root.classList.add('anim');
    const K = portrait ? CAMS.portrait : CAMS.landscape;
    BOTTOM = K.bottom;
    SCENE_TOP = K.top;
    Object.assign(cam, K.start);
    applyCam();

    /* ---------- starting (broken-down) state ---------- */
    const van = one('#van');
    const hoodP = pivot(one('#hood'));             hoodP.rot = -48;    hoodP.update();
    const tractorP = pivot(one('#tractor'));       tractorP.rot = 1.4; tractorP.update();
    const sagP = pivot(one('#wheelFrontSag'));     sagP.sy = 0.875;    sagP.update();
    // When the camera is zoomed out to clear the captions, start the service truck further left so it still drives in.
    const startX = () => (portrait ? -1150 : -1800) - Math.max(0, minCamWidth(svg.getBoundingClientRect()) - K.start.w) / 2;

    gsap.set(all('.van-spin, #smoke .puff, #exhaust .ex, .flash'), { transformOrigin: '50% 50%' });
    gsap.set(all('#smoke, #hazardsFront, #hazardsRear, #vanBeam'), { opacity: 1 });
    gsap.set(all('#beamFront, #exhaust, #workLight, #weld'), { opacity: 0 });
    gsap.set(one('#rays'), { opacity: 0.14 });

    /* ---------- loops ---------- */
    all('#smoke .puff').forEach((p, i) => {
      gsap.timeline({ repeat: -1, delay: i * 0.6 })
        .set(p, { x: 0, y: 0, scale: 0.5, opacity: 0 })
        .to(p, { opacity: 1, duration: 0.8, ease: 'sine.out' }, 0)
        .to(p, { x: -70, y: -200, scale: 2.4, duration: 3.6, ease: 'sine.out' }, 0)
        .to(p, { opacity: 0, duration: 2, ease: 'sine.in' }, 1.6);
    });
    all('#exhaust .ex').forEach((p, i) => {
      gsap.timeline({ repeat: -1, delay: i * 0.55 })
        .set(p, { x: 0, y: 0, scale: 0.6, opacity: 0 })
        .to(p, { opacity: 1, duration: 0.4 }, 0)
        .to(p, { x: -60, y: -140, scale: 2.4, duration: 2.2, ease: 'sine.out' }, 0)
        .to(p, { opacity: 0, duration: 1.4 }, 0.8);
    });
    gsap.to(all('.blink'), { opacity: 0.1, duration: 0.5, ease: 'steps(1)', repeat: -1, yoyo: true });
    gsap.to(one('.bar-a'), { opacity: 0.25, duration: 0.3, ease: 'steps(1)', repeat: -1, yoyo: true });
    gsap.fromTo(one('.bar-b'), { opacity: 0.25 }, { opacity: 1, duration: 0.3, ease: 'steps(1)', repeat: -1, yoyo: true });
    gsap.to(one('#barGlow'), { opacity: 0.45, duration: 0.3, ease: 'steps(1)', repeat: -1, yoyo: true });
    gsap.fromTo(all('.spark'), { y: 0, opacity: 1 },
      { y: () => gsap.utils.random(-80, -30), opacity: 0, duration: 0.38, ease: 'power2.out', repeat: -1, repeatRefresh: true, stagger: 0.04 });
    gsap.to(one('.flash'), { scale: 0.55, opacity: 0.6, duration: 0.09, ease: 'none', repeat: -1, yoyo: true, repeatRefresh: true });

    /* ---------- the scroll story (0 to 7) ---------- */
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#story', start: 'top top',
        end: portrait ? '+=260%' : '+=220%',
        scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });

    // One continuous camera move for the whole story.
    tl.to(cam, { cx: K.end.cx, w: K.end.w, duration: 6.4, ease: 'sine.inOut', onUpdate: applyCam }, 0);

    // 0 - 3.6  service truck drives in and eases to a stop
    const wheelDeg = () => (Math.abs(startX()) / 34) * (180 / Math.PI);
    tl.fromTo(van, { x: startX }, { x: 0, duration: 3.6, ease: 'power3.out' }, 0)
      .fromTo(all('.van-spin'), { rotation: 0 }, { rotation: wheelDeg, duration: 3.6, ease: 'power3.out' }, 0)
      .to(one('#vanBeam'), { opacity: 0, duration: 0.5 }, 3.3);

    // 3.4 - 5.6  floodlight on, welding on the engine, tire back up, smoke clears
    tl.to(one('#workLight'), { opacity: 1, duration: 0.5, ease: 'sine.out' }, 3.4)
      .to(one('#weld'), { opacity: 1, duration: 0.3 }, 3.8)
      .to(sagP, { sy: 1, duration: 1.4, ease: 'sine.inOut', onUpdate: sagP.update }, 3.8)
      .to(tractorP, { rot: 0, duration: 1.4, ease: 'sine.inOut', onUpdate: tractorP.update }, 3.8)
      .to(one('#smoke'), { opacity: 0, duration: 1.2, ease: 'sine.inOut' }, 4.2)
      .to(one('#weld'), { opacity: 0, duration: 0.3 }, 5.3);

    // 5.4 - 7  hood closes, the truck comes back to life
    tl.to(hoodP, { rot: 0, duration: 1, ease: 'power2.inOut', onUpdate: hoodP.update }, 5.3)
      .to(all('#hazardsFront, #hazardsRear'), { opacity: 0, duration: 0.3 }, 6.1)
      .to(all('#beamFront, #exhaust'), { opacity: 1, duration: 0.6, ease: 'sine.out' }, 6.1)
      .to(one('#workLight'), { opacity: 0, duration: 0.5 }, 6.2)
      .to(one('#rays'), { opacity: 0.32, duration: 0.9, ease: 'sine.out' }, 6.1);

    // Captions
    const caps = Array.from(document.querySelectorAll('.cap'));
    gsap.set(caps.slice(1), { opacity: 0, y: 12 });
    const show = (el, at) => tl.to(el, { opacity: 1, y: 0, duration: 0.45, ease: 'sine.out' }, at);
    const hide = (el, at) => tl.to(el, { opacity: 0, y: -12, duration: 0.35, ease: 'sine.in' }, at);
    hide(caps[0], 0.9); show(caps[1], 1.25);
    hide(caps[1], 4.0); show(caps[2], 4.4);
    tl.to({}, { duration: 0.4 }, 6.8);

    /* ---------- section snapping below the hero ----------
       Once scrolling settles near the top of a .snap section (or the end of the page), ease it into place.
       Inside the hero or mid-way through a tall section nothing moves. */
    const snapper = ScrollTrigger.create({
      start: 0, end: 'max',
      snap: {
        snapTo: (value) => {
          const range = snapper.end - snapper.start;
          const y = snapper.start + value * range;
          const reach = window.innerHeight * 0.35;
          const points = Array.from(document.querySelectorAll('.snap'), (el) => el.getBoundingClientRect().top + window.scrollY);
          if (!points.length || y < points[0] - window.innerHeight * 0.1) return value;
          points.push(snapper.end);
          const near = points.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
          return Math.abs(near - y) > reach ? value : (near - snapper.start) / range;
        },
        duration: { min: 0.3, max: 0.7 }, delay: 0.12, ease: 'power2.inOut',
      },
    });

    ScrollTrigger.addEventListener('refresh', applyCam);
    window.addEventListener('resize', applyCam);
    ready();

    return () => {
      root.classList.remove('anim');
      ['#hood', '#tractor', '#wheelFrontSag'].forEach((s) => one(s).removeAttribute('transform'));
      window.removeEventListener('resize', applyCam);
      ScrollTrigger.removeEventListener('refresh', applyCam);
    };
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
