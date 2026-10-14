"""Genera PostLab en un solo archivo HTML de doble clic (W19): toda la web dentro, sin servidor y sin conexión.

Uso: python3 tools/build_html.py [salida.html]      (por defecto, dist/PostLab.html)

Cómo lo hace, sin tocar el código de la web:
- Los datos (data/*.json) van dentro, en bloques <script type="application/json">, y main.js los lee de ahí en vez de pedirlos.
- Los módulos de JavaScript van como direcciones data: en un mapa de importación; las rutas relativas
  ('./lib.js', '../vendor/…') se cambian por nombres fijos (@pl/js/lib.js) que el mapa resuelve.
- D3 y el motor del episodio van como scripts clásicos; las tipografías y los iconos, como data: dentro del CSS y del HTML.
- Los enlaces de descarga de los CSV apuntan a la web pública, porque un archivo suelto no puede servirlos.
"""
import base64, json, os, posixpath, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = 'https://oasa10.github.io/PostLab/'


def leer(ruta, modo='r'):
    with open(os.path.join(RAIZ, ruta), modo, **({} if 'b' in modo else {'encoding': 'utf-8'})) as f:
        return f.read()


def data_url(ruta, tipo):
    return f'data:{tipo};base64,' + base64.b64encode(leer(ruta, 'rb')).decode('ascii')


def sin_cierre(js):
    # que ningún texto cierre el <script> antes de tiempo
    return js.replace('</script', '<\\/script').replace('<!--', '<\\!--')


# ---------- módulos: cada archivo de assets/js y los ESM de vendor, con sus importaciones resueltas
MODULOS = {}
for base, _, archivos in os.walk(os.path.join(RAIZ, 'assets', 'js')):
    for a in archivos:
        if a.endswith('.js'):
            MODULOS[os.path.relpath(os.path.join(base, a), RAIZ).replace(os.sep, '/')] = None
for a in os.listdir(os.path.join(RAIZ, 'assets', 'vendor')):
    if a.endswith('.esm.min.js'):
        MODULOS['assets/vendor/' + a] = None

clave = lambda ruta: '@pl/' + ruta[len('assets/'):]
PATRON = re.compile(r"""(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}/[^'"]+)\2""")


def resolver(ruta, js):
    def cambio(m):
        destino = posixpath.normpath(posixpath.join(posixpath.dirname(ruta), m.group(3)))
        if destino not in MODULOS:
            raise SystemExit(f'{ruta}: no encuentro {m.group(3)} ({destino})')
        return f'{m.group(1)}{m.group(2)}{clave(destino)}{m.group(2)}'
    return PATRON.sub(cambio, js)


DATOS = sorted(a for a in os.listdir(os.path.join(RAIZ, 'data')) if a.endswith('.json'))
mapa = {}
for ruta in MODULOS:
    js = resolver(ruta, leer(ruta))
    if ruta == 'assets/js/main.js':
        viejo = "const get = u => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(u); return r.json(); });"
        if viejo not in js:
            raise SystemExit('main.js ha cambiado: revisa cómo se cargan los datos')
        js = js.replace(viejo, "const get = u => new Promise((ok, mal) => { const el = document.getElementById('datos:' + u); if (!el) return mal(new Error(u)); ok(JSON.parse(el.textContent)); });")
    if ruta == 'assets/js/views/acerca.js':
        js = js.replace("href: 'data/", f"href: '{WEB}data/")
    mapa[clave(ruta)] = 'data:text/javascript;base64,' + base64.b64encode(js.encode('utf-8')).decode('ascii')

# ---------- CSS con las tipografías dentro
css = ''
for ruta in ['assets/vendor/episodio/episodio.css', 'assets/css/postlab.css']:
    t = leer(ruta)
    t = re.sub(r"url\('\.\./fonts/([^']+)'\)", lambda m: "url('" + data_url('assets/fonts/' + m.group(1), 'font/woff2') + "')", t)
    css += f'/* {ruta} */\n{t}\n'

# ---------- el HTML
html = leer('index.html')
html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
html = html.replace('<link rel="icon" href="assets/img/icono.svg" type="image/svg+xml">',
                    f'<link rel="icon" href="{data_url("assets/img/icono.svg", "image/svg+xml")}" type="image/svg+xml">')
html = html.replace('<link rel="apple-touch-icon" href="assets/img/icono-180.png">',
                    f'<link rel="apple-touch-icon" href="{data_url("assets/img/icono-180.png", "image/png")}">')
html = re.sub(r'\s*<link rel="stylesheet" href="assets/vendor/episodio/episodio.css">', '', html)
html = html.replace('<link rel="stylesheet" href="assets/css/postlab.css">', '<style>\n' + css + '</style>')
clasicos = ''
for ruta in ['assets/vendor/d3-7.9.0.min.js', 'assets/vendor/episodio/episodio.js']:
    patron = f'<script src="{ruta}" defer></script>'
    if patron not in html:
        raise SystemExit(f'index.html ha cambiado: no encuentro {patron}')
    html = html.replace(patron, f'<script>/* {ruta} */\n{sin_cierre(leer(ruta))}\n</script>')
datos = ''.join(f'\n  <script type="application/json" id="datos:data/{a}">{sin_cierre(leer("data/" + a))}</script>' for a in DATOS)
importmap = '<script type="importmap">' + json.dumps({'imports': mapa}) + '</script>'
html = html.replace('<script type="module" src="assets/js/main.js"></script>',
                    importmap + datos + f'\n  <script type="module">import "{clave("assets/js/main.js")}";</script>')
html = html.replace('href="data/csv/', f'href="{WEB}data/csv/')
html = html.replace('<meta name="color-scheme"', '<meta name="generator" content="PostLab · tools/build_html.py (un solo archivo)">\n  <meta name="color-scheme"', 1)

salida = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'dist', 'PostLab.html')
os.makedirs(os.path.dirname(os.path.abspath(salida)), exist_ok=True)
with open(salida, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'{salida}: {os.path.getsize(salida) / 1e6:.2f} MB, {len(mapa)} módulos y {len(DATOS)} archivos de datos dentro')
