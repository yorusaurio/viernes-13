# Viernes 13

Experiencia privada para Viviana. Una sala de escucha, una dedicatoria y un álbum de recuerdos.

La canción es **Viernes 13** de Marcos Menchaca (2019). La reproducción usa el embed oficial de Spotify. No hay un archivo de audio inventado ni una barra de progreso simulada: el avance, el tiempo y la duración salen del reproductor real.

## Abrirla en local

El embed de Spotify necesita una página servida por HTTP. Desde esta carpeta:

```bash
python -m http.server 8765
```

Después abre `http://localhost:8765`.

## Cambiar las fotografías

Sustituye los archivos en `assets/images/memories/` conservando el nombre:

```text
photo-01.jpg
photo-02.jpg
photo-03.jpg
photo-04.jpg
photo-05.jpg
photo-06.jpg
photo-07.jpg
photo-08.jpg
photo-09.jpg
photo-10.jpg
```

Las imágenes actuales son placas vacías, numeradas, para ocupar el lugar hasta que estén las fotos reales. No hace falta modificar el HTML. Las fotografías se muestran completas, sin recorte forzado.

Si un archivo falta, el marco muestra un espacio sobrio en lugar del icono roto.

## Añadir un audio autorizado

En `js/player.js`, dentro de `TRACK`, deja la ruta del archivo si tienes derecho a usarlo:

```js
audioSrc: "assets/audio/viernes-13.mp3"
```

Con esa ruta, los controles propios —play, pausa, progreso, tiempos, volumen y reinicio— manejan ese archivo. Si la dejas vacía, manda Spotify.

## Compartir por WhatsApp

Al publicar, cambia estas metas en `index.html` por la dirección absoluta:

```html
<meta property="og:image" content="https://tu-dominio/assets/images/og.jpg">
<meta property="og:url" content="https://tu-dominio/">
```

WhatsApp ignora las rutas relativas. La imagen de vista previa está en `assets/images/og.jpg`.

## Estructura

```text
index.html
css/          styles, player, animations, responsive
js/           main, player, gallery, animations, interactions
assets/       portada, placas, iconos, favicon y vista previa
```
