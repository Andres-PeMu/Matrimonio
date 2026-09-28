# Fondo floral

`public/floral-paper.webp` es el recurso usado por la aplicación. El original está en `public/floral-paper.png`.

Generado con la habilidad imagegen y su herramienta integrada, sin una dependencia de generación en tiempo de ejecución. Se convirtió a WebP (ancho máximo 1600 px, calidad 82) para reducir transferencia. No representa fotografías reales de los novios.

Prompt utilizado:

> Use case: photorealistic-natural. Asset type: decorative wedding website background, landscape 1536x1024. Primary request: an elegant romantic classic wedding stationery backdrop, inspired by Regency gardens. Ivory handmade paper empty center occupying 65% of image, delicate real blush and cream roses with tiny white flowers and muted olive eucalyptus leaves softly framing the left and right edges, particularly corners, gentle warm natural afternoon light, faint paper fibers, restrained antique gold detail. Premium editorial wedding aesthetic, cream beige dusty rose palette. No people, no text, no letters, no logos, no watermark. Center must be clean light ivory for overlay typography. Save output as a project asset.

## Sobre de papel y sello AF

Recursos finales utilizados por el componente `Envelope`:

- `public/envelope/wax-seal-af.webp`: sello de cera marfil con monograma AF, 480 × 480 px y transparencia. Se generó con la herramienta integrada de imagegen usando la fotografía aportada por el usuario como referencia. El monograma AF es decorativo y no modifica los nombres guardados en Supabase.
- `public/envelope/ivory-paper.webp`: textura de papel de algodón marfil, 640 × 640 px. Se generó con la herramienta integrada de imagegen y se aplica a las solapas independientes de CSS. La conversión a WebP optimiza la descarga.

Prompt del sello:

> Create a standalone photorealistic wedding wax seal asset inspired closely by the wax seal in this reference. Remove the entire envelope and paper background, isolate ONLY the complete seal on a genuinely transparent alpha background. Square composition, seal occupies about 85 percent of canvas, full irregular organic hand-poured rounded outline visible, no cropping. Ivory / warm pearl cream sealing wax, subtle natural satin sheen, thick gently wavy rim and two deeply embossed concentric fine rings, realistic handmade imperfections and soft upper-left light. Preserve the beautiful classic interwoven monogram but ensure it reads exactly one capital A and one capital F, with the F upright in elegant thin serif and A in flowing calligraphy overlay, recessed pale taupe engraved letters, no ampersand and no duplicate A. Match the elegant realistic material of the reference, not gold, not a cartoon, not a flat icon, no extra words, no envelope. Crisp detailed high resolution PNG with transparent background and very subtle contact shadow close to the seal.

Prompt del papel:

> Square seamless photographic texture of warm ivory cotton paper for a luxury wedding envelope. Extreme closeup overhead view of fine intertwined cream-colored paper fibers and subtle pressed grain, matching elegant thick uncoated stationery. Uniform pale ivory #f1e7d4, low contrast, soft even light with just enough shadow to reveal tactile fibers. Flat sheet filling frame edge to edge, tileable. No text, no objects, no folds, no wax seal, no flowers, no stains, no vignette, no border. Natural organic paper fibers, not fabric. The texture will be rendered small as the material of animated envelope flaps on a website.

Los corazones y los iconos de navegación y estadísticas proceden de `lucide-react` (licencia ISC). Se importan individualmente. El marcador de Leaflet utiliza el SVG de Lucide Heart con la misma licencia para evitar cargar un renderizador React adicional en el mapa. Los iconos puramente decorativos están ocultos a lectores de pantalla.
