"""Convierte los CSV de data/csv (la fuente de verdad) en los JSON que lee la web.

Uso: python3 tools/build_data.py   (desde la raíz del repositorio; necesita numpy para el mapa)
"""
import csv, json, math, os, random

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(R, 'data', 'csv')
OUT = os.path.join(R, 'data')

FAMILIAS = ['Estilos', 'Modernidad', 'Economía y trabajo', 'Ciencia y conocimiento', 'Humano y técnica', 'Lenguaje y teoría',
            'Colonia y orden mundial', 'Política y verdad', 'Creencias', 'Épocas']
L = lambda s: [x.strip() for x in (s or '').split(' ; ') if x.strip()]

def num(s):
    try: return int(s)
    except (TypeError, ValueError): return None

def fase(a):
    if a is None: return None
    return 0 if a < 1700 else 1 if a < 1966 else 2 if a < 1995 else 3

terms = []
for r in csv.DictReader(open(os.path.join(CSV, 'terminos.csv'), encoding='utf-8')):
    a = num(r['anio'])
    fuentes = []
    for f in L(r['fuentes']):
        t, _, u = f.partition(' | ')
        fuentes.append({'titulo': t.strip(), 'url': u.strip()})
    terms.append({
        'id': r['id'], 'lema': r['lema'], 'variantes': L(r['variantes']), 'area': r['area'], 'familia': r['familia'], 'base': r['base'],
        'valor': L(r['valor']), 'porQue': r['por_que_valor'], 'grado': num(r['grado']) or 1, 'anio': a, 'anioTipo': r['anio_tipo'],
        'primerUso': {'anio': num(r['primer_uso_anio']), 'detalle': r['primer_uso_detalle']} if (r['primer_uso_anio'] or r['primer_uso_detalle']) else None,
        'figuras': L(r['figuras']), 'obra': r['obra'], 'nucleo': r['nucleo'], 'estatuto': r['estatuto'], 'conexiones': L(r['conexiones']),
        'estado': r['estado'], 'fuentes': fuentes, 'nota': r['nota'], 'fase': fase(a),
        'decada': None if a is None or a < 1700 else (a // 10) * 10,
    })
ids = {t['id'] for t in terms}

rels = [r for r in csv.DictReader(open(os.path.join(CSV, 'relaciones.csv'), encoding='utf-8')) if r['origen'] in ids and r['destino'] in ids]

hitos, sin_fuente = [], 0
for r in csv.DictReader(open(os.path.join(CSV, 'hitos.csv'), encoding='utf-8')):
    if not r['fuente_url']:  # un hito sin fuente queda en el CSV, pero no se publica hasta verificarlo
        sin_fuente += 1; continue
    hitos.append({'anio': num(r['anio']), 'anioFin': num(r['anio_fin']), 'hito': r['hito'], 'area': r['area'],
                  'terminos': [x for x in L(r['terminos']) if x in ids], 'estado': r['estado'],
                  'fuente': {'titulo': r['fuente_titulo'], 'url': r['fuente_url']} if r['fuente_url'] else None, 'nota': r['nota']})

# Posiciones del mapa: cada familia tiene su ancla en un anillo; repulsión entre todos, atracción por las conexiones
# y un muelle hacia el ancla de la familia (Fruchterman-Reingold con enfriamiento). Determinista (semilla fija).
def layout(K=30, RAD=420, G=0.10, IT=500):
    import numpy as np
    rnd = np.random.default_rng(7)
    n = len(terms); idx = {t['id']: i for i, t in enumerate(terms)}
    fams = [f for f in FAMILIAS if any(t['familia'] == f for t in terms)]
    anc = {}
    for k, f in enumerate(fams):
        ang = -math.pi / 2 + 2 * math.pi * k / len(fams)
        anc[f] = np.array([math.cos(ang) * RAD * 1.25, math.sin(ang) * RAD])
    A = np.array([anc[t['familia']] for t in terms])
    P = A + rnd.normal(0, 30, (n, 2))
    E = np.array([(idx[r['origen']], idx[r['destino']]) for r in rels]).reshape(-1, 2)
    temp = K * 3
    for it in range(IT):
        D = P[:, None, :] - P[None, :, :]
        d = np.sqrt((D ** 2).sum(-1)) + 1e-6
        rep = (D / d[..., None] * (K * K / d)[..., None]).sum(1)
        att = np.zeros_like(P)
        if len(E):
            v = P[E[:, 1]] - P[E[:, 0]]; L_ = np.linalg.norm(v, axis=1, keepdims=True) + 1e-6
            f = v / L_ * (L_ ** 2 / K) * 0.5
            np.add.at(att, E[:, 0], f); np.add.at(att, E[:, 1], -f)
        disp = rep + att + (A - P) * G * K
        Ln = np.linalg.norm(disp, axis=1, keepdims=True) + 1e-9
        P += disp / Ln * np.minimum(Ln, temp)
        temp = max(1.0, temp * 0.985)
    return {t['id']: [round(float(P[i, 0]), 1), round(float(P[i, 1]), 1)] for i, t in enumerate(terms)}

try:
    pos = layout()
    for t in terms: t['xy'] = pos[t['id']]
except ImportError:
    print('Sin numpy: el mapa usará la disposición automática.')

json.dump(terms, open(os.path.join(OUT, 'terminos.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump([{'o': r['origen'], 'd': r['destino'], 't': r['tipo']} for r in rels], open(os.path.join(OUT, 'relaciones.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump(hitos, open(os.path.join(OUT, 'hitos.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(terms), 'términos ·', len(rels), 'relaciones ·', len(hitos), 'hitos publicados ·', sin_fuente, 'hitos sin fuente (no se publican)')
