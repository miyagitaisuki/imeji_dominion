#!/usr/bin/env python3
"""Chuyển bộ thẻ Anki (.apkg, định dạng anki21b) thành data/n2/NN.json.

Dùng:
  pip install zstandard
  python3 scripts/import-anki.py N2.apkg                # chỉ sinh dữ liệu chữ
  python3 scripts/import-anki.py N2.apkg --media        # đồng thời giải nén mp3/jpg vào assets/n2/media/

Chỉ các file media mà thẻ thật sự dùng mới được chép ra.
"""
import argparse, io, json, os, re, shutil, sqlite3, sys, tempfile, zipfile
import zstandard

PER_LESSON = 50
KANJI = r'㐀-鿿々〆ヶ'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def unzstd(b):
    return zstandard.ZstdDecompressor().stream_reader(io.BytesIO(b)).read()


def furigana(s):
    """Anki `食[た]べる` (hoặc lỗi `食「た」べる`) -> `{食|た}べる`; bỏ khoảng trắng phân tách."""
    s = re.sub(r'([%s]+)[\[「]([^\]」]+)[\]」]' % KANJI, r'{\1|\2}', s)
    # bỏ khoảng trắng nằm cạnh ký tự không phải ASCII hoặc dấu ngoặc ruby
    s = re.sub(r'\s+(?=[^\x00-\x7f]|\{)|(?<=[^\x00-\x7f]|\})\s+', '', s)
    return s.strip()


def plain(s):
    """Chuỗi chỉ gồm kana/chữ để so sánh: bỏ ruby."""
    return re.sub(r'\{([^|}]*)\|[^}]*\}', r'\1', s)


def text(html):
    html = re.sub(r'<br\s*/?>', '\n', html)
    html = re.sub(r'<[^>]+>', '', html)
    return html.replace('&nbsp;', ' ').replace('&amp;', '&').strip()


def media_names(apkg_zip):
    raw = apkg_zip.read('media')
    try:
        raw = unzstd(raw)
    except Exception:
        return {k: v for k, v in json.loads(raw).items()}  # định dạng cũ
    names, i = {}, 0

    def varint(p):
        r = sh = 0
        while True:
            b = raw[p]; p += 1
            r |= (b & 0x7f) << sh; sh += 7
            if not b & 0x80:
                return r, p
    idx = 0
    while i < len(raw):
        tag, i = varint(i)
        ln, i = varint(i)
        end = i + ln
        j = i
        while j < end:
            t, j = varint(j)
            if t & 7 == 2:
                l, j = varint(j)
                if t >> 3 == 1:
                    names[str(idx)] = raw[j:j + l].decode()
                j += l
            elif t & 7 == 0:
                _, j = varint(j)
            else:
                break
        idx += 1
        i = end
    return names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('apkg')
    ap.add_argument('--media', action='store_true')
    a = ap.parse_args()

    z = zipfile.ZipFile(a.apkg)
    tmp = tempfile.mkdtemp()
    dbname = 'collection.anki21b' if 'collection.anki21b' in z.namelist() else 'collection.anki21'
    db = os.path.join(tmp, 'c.db')
    data = z.read(dbname)
    open(db, 'wb').write(unzstd(data) if dbname.endswith('b') else data)
    con = sqlite3.connect(db)
    rows = [r[0].split('\x1f') for r in con.execute('select flds from notes order by id')]

    words, used = [], set()
    for n, f in enumerate(rows, 1):
        f += [''] * (10 - len(f))
        img = re.search(r'src="([^"]+)"', f[3])
        wa = re.search(r'\[sound:([^\]]+)\]', f[4])
        ea = re.search(r'\[sound:([^\]]+)\]', f[5])
        ex = furigana(re.sub(r'\[sound:[^\]]+\]', '', f[5]))
        w = {
            'id': 'n2_%04d' % n,
            'word': furigana(f[0]),
            'reading': f[1].strip(),
            'meaning': text(f[2]),
            'pos': text(f[9]) or text(f[8]),
            'example': ex,
            'exampleMeaning': text(f[6]),
            'note': text(f[7]),
        }
        if img: w['image'] = img.group(1)
        if wa: w['audio'] = wa.group(1)
        if ea: w['exampleAudio'] = ea.group(1)
        used.update(w.get(k) for k in ('image', 'audio', 'exampleAudio'))
        words.append(w)
    used.discard(None)

    out = os.path.join(ROOT, 'data', 'n2')
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.json'): os.remove(os.path.join(out, f))
    lessons = []
    for k in range(0, len(words), PER_LESSON):
        chunk = words[k:k + PER_LESSON]
        no = k // PER_LESSON + 1
        json.dump({'lesson': no, 'words': chunk}, open(os.path.join(out, '%02d.json' % no), 'w', encoding='utf-8'),
                  ensure_ascii=False, separators=(',', ':'))
        lessons.append({'no': no, 'count': len(chunk), 'from': k + 1, 'to': k + len(chunk),
                        'sample': [plain(c['word']) for c in chunk[:4]]})
    json.dump({'total': len(words), 'perLesson': PER_LESSON, 'lessons': lessons},
              open(os.path.join(out, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi %d từ, %d bài vào data/n2/' % (len(words), len(lessons)))

    if a.media:
        md = os.path.join(ROOT, 'assets', 'n2', 'media')
        os.makedirs(md, exist_ok=True)
        names, n = media_names(z), 0
        for idx, name in names.items():
            if name in used and idx in z.namelist():
                blob = z.read(idx)
                try: blob = unzstd(blob)
                except Exception: pass
                open(os.path.join(md, name), 'wb').write(blob); n += 1
        print('Đã chép %d/%d file media vào assets/n2/media/' % (n, len(used)))
    shutil.rmtree(tmp)


if __name__ == '__main__':
    main()
