# Top Out brand

Top Out uses the one QS Mind brand: the geodesic sphere with its upper-right face filled with Top Out's metal, **Rose gold** (`#E8A598 → #B76E79`). Copper is QS Mind's only. The one slogan: **كل رقم له مصدر** / **Every number has a source**.

These files are Top Out's own copy of the brand, kept in this repo. The QS Mind house kit and the full guide live in the website repo (`qs-mind/website`, `brand/`). Change the brand there first, then copy the files here.

## Files

Hand-structured, transparent SVGs with no fonts and no fixed size; text is drawn as shapes.

```
favicon/favicon.svg
lockup/top-out-lockup-white.svg
lockup/top-out-lockup.svg
mark/top-out-mark-white.svg
mark/top-out-mark.svg
```

- `mark/` the sphere: `-mark.svg` ink lines for light grounds, `-mark-white.svg` white lines for dark grounds.
- `lockup/` mark + "QS Mind | Top Out" (`-ar` files: كيو إس مايند | توب أوت).
- `favicon/favicon.svg` the full mark; switches ink/white with light and dark mode.

App icons, favicons and PNGs in this repo are rendered from these files.

## Rules

- One mark at every size: resize the full mark. There is no simplified small mark.
- Ink files on light grounds, white files on dark grounds.
- The face stays upper right in Top Out's metal. Never rotate the sphere, add shadows or glow, or put it on a tile. (The only opaque ground is the Stone `#F2EEE7` square that iOS and Android force on home-screen icons.)
- Clear space around the mark: one quarter of its width.
- The product name always sits next to a product mark.
- Arabic text uses Thmanyah Sans; titles turn on its swash letters (`swsh`). Font files never go into a repo.
