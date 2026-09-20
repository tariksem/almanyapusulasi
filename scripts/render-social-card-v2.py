#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import List, Tuple
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
LOGO = Path('assets/brand/almanya-pusulasi-logo.png')

NAVY = '#102A43'
NAVY2 = '#153B5F'
BLUE = '#1F4E79'
GOLD = '#D89B2B'
GOLD_SOFT = '#F5E5B9'
TEXT = '#172033'
MUTED = '#5F6B7A'
BG = '#F6F8FB'
SURFACE = '#FFFFFF'
SOFT = '#F9FAFB'
BORDER = '#E2E8F0'
PALE_BLUE = '#EAF2F8'
GREEN = '#047857'
FOOTER = '#0B1220'

BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

META = {
    'chancenkarte': ('GÖÇ & KARİYER', 'score'),
    'kinderzuschlag': ('AİLE & DESTEK', 'checklist'),
    'brutto-netto': ('İŞ & GELİR', 'salary'),
    'banka': ('FİNANS', 'compare'),
    'kindergeld-takvim': ('AİLE & ÇOCUK', 'calendar'),
    'wohngeld': ('KİRA & DESTEK', 'wohngeld'),
    'kindergeld-turkiye': ('AİLE & TÜRKİYE', 'crossborder'),
    'emeklilik': ('EMEKLİLİK', 'timeline'),
    'nebenkosten': ('KİRA & FATURALAR', 'invoice'),
    'kira-butcesi': ('KİRA & BÜTÇE', 'budget'),
}

def F(path: str, size: int):
    return ImageFont.truetype(path, size)

def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def text_width(draw, text, font):
    b = draw.textbbox((0,0), text, font=font)
    return b[2]-b[0]

def wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> List[str]:
    words = text.split()
    lines, current = [], ''
    for word in words:
        cand = word if not current else current + ' ' + word
        if text_width(draw, cand, font) <= max_width:
            current = cand
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def gradient(img: Image.Image, y0: int, y1: int, c0: Tuple[int,int,int], c1: Tuple[int,int,int]):
    px = img.load()
    for y in range(y0, y1):
        t = (y-y0)/max(1,(y1-y0-1))
        c = tuple(round(c0[i]*(1-t)+c1[i]*t) for i in range(3))
        for x in range(W):
            px[x,y] = c

def draw_header(img, d):
    d.rectangle((0,0,W,112), fill=SURFACE)
    d.line((0,111,W,111), fill=BORDER, width=1)
    logo = Image.open(LOGO).convert('RGBA')
    logo.thumbnail((66,66), Image.Resampling.LANCZOS)
    img.paste(logo, (54,23), logo)
    d.text((136,28), 'Almanya Pusulası', font=F(BOLD,30), fill=NAVY)
    d.text((136,67), "Almanya'da karar vermek için Türkçe araçlar.", font=F(REGULAR,15), fill=MUTED)
    rounded(d,(833,32,1025,80),24,PALE_BLUE)
    d.text((861,46),'ÜCRETSİZ ARAÇ',font=F(BOLD,16),fill=BLUE)

def draw_hero(img, d, category, headline):
    gradient(img,112,520,(16,42,67),(31,78,121))
    # subtle geometry
    d.ellipse((770,70,1160,450), outline=(255,255,255), width=2)
    d.ellipse((850,145,1125,420), outline=(216,155,43), width=2)
    rounded(d,(54,154,54+text_width(d,category,F(BOLD,17))+34,196),21,GOLD)
    d.text((71,166),category,font=F(BOLD,17),fill=FOOTER)

    f=F(BOLD,60)
    lines=wrap(d,headline,f,880)
    y=230
    for i,line in enumerate(lines[:3]):
        fill=GOLD_SOFT if i==len(lines[:3])-1 and len(lines)>1 else SURFACE
        d.text((54,y),line,font=f,fill=fill)
        y+=72
    d.rectangle((54,470,166,478),fill=GOLD)

def draw_section_label(d, text, y):
    d.text((54,y),text,font=F(BOLD,19),fill=NAVY)
    d.line((54,y+36,1026,y+36),fill=BORDER,width=1)

def pill(d, x,y,w,text,fill=PALE_BLUE,fg=BLUE):
    rounded(d,(x,y,x+w,y+44),22,fill)
    tw=text_width(d,text,F(BOLD,15))
    d.text((x+(w-tw)/2,y+12),text,font=F(BOLD,15),fill=fg)

def draw_check(d,x,y,label,active=True):
    rounded(d,(x,y,x+38,y+38),12, GREEN if active else BORDER)
    if active:
        d.line((x+10,y+20,x+17,y+27),fill='white',width=4)
        d.line((x+17,y+27,x+29,y+11),fill='white',width=4)
    d.text((x+52,y+5),label,font=F(BOLD,20),fill=TEXT)

def panel_score(d, box, bullets):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'PUAN ÖN KONTROLÜ',font=F(BOLD,18),fill=MUTED)
    cx=x0+260; cy=y0+226; r=132
    d.arc((cx-r,cy-r,cx+r,cy+r),190,350,fill=BORDER,width=24)
    d.arc((cx-r,cy-r,cx+r,cy+r),190,304,fill=GOLD,width=24)
    d.text((cx-58,cy-48),'6+',font=F(BOLD,66),fill=NAVY)
    d.text((cx-77,cy+34),'KRİTER',font=F(BOLD,17),fill=MUTED)
    yy=y0+380
    for b in bullets[:3]:
        draw_check(d,x0+28,yy,b[:34],True); yy+=58

def panel_checklist(d, box, bullets):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'BAŞVURU ÖNCESİ',font=F(BOLD,18),fill=MUTED)
    yy=y0+92
    for b in bullets[:3]:
        draw_check(d,x0+32,yy,b[:36],True); yy+=82
    rounded(d,(x0+28,y1-122,x1-28,y1-34),22,'#F8FAFC',BORDER,1)
    d.text((x0+50,y1-96),'Sonuç: Ön değerlendirme',font=F(BOLD,20),fill=NAVY)
    d.text((x0+50,y1-67),'Resmî karar yerine geçmez',font=F(REGULAR,16),fill=MUTED)

def panel_salary(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'MAAŞ AKIŞI',font=F(BOLD,18),fill=MUTED)
    stages=[('BRÜT','4.000 €',BLUE),('KESİNTİ','−1.420 €',GOLD),('NET','≈ 2.580 €',GREEN)]
    yy=y0+94
    for i,(a,b,c) in enumerate(stages):
        rounded(d,(x0+28,yy,x1-28,yy+84),22,PALE_BLUE if i<2 else '#E7F6EF')
        d.text((x0+52,yy+18),a,font=F(BOLD,17),fill=MUTED)
        d.text((x1-240,yy+15),b,font=F(BOLD,29),fill=c)
        yy+=106
    d.text((x0+30,y1-60),'Örnek gösterim • kişisel hesap farklıdır',font=F(REGULAR,14),fill=MUTED)

def panel_compare(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'HESAP TÜRÜ',font=F(BOLD,18),fill=MUTED)
    mid=(x0+x1)//2
    for left,title,tag in [(x0+28,'Girokonto','GÜNLÜK'),(mid+10,'Basiskonto','TEMEL')]:
        rounded(d,(left,y0+82,left+240,y1-34),24,SOFT,BORDER,1)
        d.text((left+18,y0+104),title,font=F(BOLD,24),fill=NAVY)
        pill(d,left+18,y0+148,108,tag)
        for j,t in enumerate(['Kart','Ödeme','Hesap']):
            d.ellipse((left+22,y0+220+j*62,left+34,y0+232+j*62),fill=GOLD)
            d.text((left+48,y0+210+j*62),t,font=F(BOLD,18),fill=TEXT)

def panel_calendar(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'2026 ÖDEME TAKVİMİ',font=F(BOLD,18),fill=MUTED)
    rounded(d,(x0+28,y0+82,x1-28,y0+160),22,NAVY)
    d.text((x0+52,y0+102),'ENDZIFFER',font=F(BOLD,18),fill='white')
    d.text((x1-132,y0+93),'7',font=F(BOLD,42),fill=GOLD_SOFT)
    days=['3','7','12','16','20','24','28','—','—']
    cols=3
    sx=x0+32; sy=y0+202
    for i,v in enumerate(days):
        xx=sx+(i%cols)*152; yy=sy+(i//cols)*88
        rounded(d,(xx,yy,xx+124,yy+64),18,SOFT,BORDER,1)
        d.text((xx+52,yy+17),v,font=F(BOLD,24),fill=NAVY if v!='—' else MUTED)

def panel_wohngeld(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'3 TEMEL FAKTÖR',font=F(BOLD,18),fill=MUTED)
    items=[('GELİR','€'),('HANE','3'),('KİRA','⌂')]
    yy=y0+100
    for name,val in items:
        rounded(d,(x0+28,yy,x1-28,yy+92),22,SOFT,BORDER,1)
        d.text((x0+52,yy+20),name,font=F(BOLD,21),fill=NAVY)
        d.text((x1-108,yy+16),val,font=F(BOLD,30),fill=GOLD)
        yy+=112
    d.text((x0+30,y1-56),'Birlikte değerlendirilir',font=F(BOLD,17),fill=MUTED)

def panel_crossborder(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'SINIR ÖTESİ DURUM',font=F(BOLD,18),fill=MUTED)
    rounded(d,(x0+38,y0+92,x0+200,y0+176),22,PALE_BLUE)
    rounded(d,(x1-200,y0+92,x1-38,y0+176),22,'#FFF4D3')
    d.text((x0+82,y0+111),'DE',font=F(BOLD,32),fill=BLUE)
    d.text((x1-152,y0+111),'TR',font=F(BOLD,32),fill='#8A5A00')
    d.line((x0+218,y0+134,x1-218,y0+134),fill=GOLD,width=8)
    d.polygon([(x1-220,y0+122),(x1-194,y0+134),(x1-220,y0+146)],fill=GOLD)
    yy=y0+232
    for t in ['Çalışma durumu','Sigorta','Çocuğun ikameti']:
        draw_check(d,x0+38,yy,t,True); yy+=68

def panel_timeline(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'EMEKLİLİK YOLU',font=F(BOLD,18),fill=MUTED)
    x=x0+72; y=y0+130
    d.line((x,y,x,y1-80),fill=BORDER,width=8)
    items=[('PRİM','Çalışma süreleri'),('RENTE','Alman sistemi'),('TR','Türkiye bağlantısı')]
    for i,(a,b) in enumerate(items):
        yy=y+i*118
        d.ellipse((x-15,yy-15,x+15,yy+15),fill=GOLD if i<2 else BLUE)
        d.text((x+38,yy-20),a,font=F(BOLD,22),fill=NAVY)
        d.text((x+38,yy+12),b,font=F(REGULAR,17),fill=MUTED)

def panel_invoice(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'ABRECHNUNG KONTROLÜ',font=F(BOLD,18),fill=MUTED)
    rows=[('Heizung',72),('Wasser',44),('Hausmeister',36),('Sonuç',82)]
    yy=y0+100
    for name,val in rows:
        d.text((x0+34,yy),name,font=F(BOLD,18),fill=TEXT)
        rounded(d,(x0+188,yy+3,x1-40,yy+25),11,BORDER)
        rounded(d,(x0+188,yy+3,x0+188+int((x1-x0-228)*val/100),yy+25),11,GOLD if name!='Sonuç' else GREEN)
        yy+=76

def panel_budget(d, box):
    x0,y0,x1,y1=box
    rounded(d,box,28,SURFACE,BORDER,2)
    d.text((x0+28,y0+26),'TAŞINMA BÜTÇESİ',font=F(BOLD,18),fill=MUTED)
    labels=[('Warmmiete','1×',BLUE),('Kaution','3×',GOLD),('Başlangıç','+',GREEN)]
    yy=y0+92
    for name,val,c in labels:
        rounded(d,(x0+28,yy,x1-28,yy+86),22,SOFT,BORDER,1)
        d.text((x0+50,yy+19),name,font=F(BOLD,20),fill=NAVY)
        d.text((x1-112,yy+15),val,font=F(BOLD,30),fill=c)
        yy+=106
    d.text((x0+30,y1-57),'Toplam nakit ihtiyacını gör',font=F(BOLD,17),fill=MUTED)

def draw_panel(d, kind, bullets):
    box=(510,570,1026,1080)
    {
        'score': lambda: panel_score(d,box,bullets),
        'checklist': lambda: panel_checklist(d,box,bullets),
        'salary': lambda: panel_salary(d,box),
        'compare': lambda: panel_compare(d,box),
        'calendar': lambda: panel_calendar(d,box),
        'wohngeld': lambda: panel_wohngeld(d,box),
        'crossborder': lambda: panel_crossborder(d,box),
        'timeline': lambda: panel_timeline(d,box),
        'invoice': lambda: panel_invoice(d,box),
        'budget': lambda: panel_budget(d,box),
    }[kind]()

def draw_bullets(d, bullets):
    draw_section_label(d,'BU ARAÇTA',570)
    y=630
    for idx,b in enumerate(bullets[:3],1):
        rounded(d,(54,y,92,y+38),12,GOLD)
        d.text((67,y+7),str(idx),font=F(BOLD,16),fill=FOOTER)
        lines=wrap(d,b,F(BOLD,19),340)
        d.text((110,y+1),lines[0],font=F(BOLD,19),fill=TEXT)
        if len(lines)>1:
            d.text((110,y+30),lines[1],font=F(REGULAR,17),fill=MUTED)
            y+=88
        else:
            y+=70

def draw_footer(d, cta):
    # Trust strip
    rounded(d,(54,1125,1026,1205),24,SURFACE,BORDER,1)
    d.text((80,1150),'Kaynak odaklı',font=F(BOLD,16),fill=NAVY)
    d.ellipse((235,1158,243,1166),fill=GOLD)
    d.text((265,1150),'Türkçe',font=F(BOLD,16),fill=NAVY)
    d.ellipse((355,1158,363,1166),fill=GOLD)
    d.text((385,1150),'Ücretsiz araç',font=F(BOLD,16),fill=NAVY)

    rounded(d,(54,1230,704,1310),24,GOLD)
    d.text((84,1252),cta,font=F(BOLD,23),fill=FOOTER)
    d.text((665,1248),'→',font=F(BOLD,32),fill=FOOTER)
    d.text((758,1242),'almanyapusulasi.de',font=F(BOLD,20),fill=NAVY)
    d.text((758,1275),'Bilgi → kontrol → karar',font=F(REGULAR,14),fill=MUTED)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--slug',required=True)
    p.add_argument('--headline',required=True)
    p.add_argument('--bullet',action='append',default=[])
    p.add_argument('--cta',required=True)
    p.add_argument('--url',required=True)
    p.add_argument('--output',required=True)
    args=p.parse_args()

    if not LOGO.exists():
        raise SystemExit(f'Canonical logo missing: {LOGO}')
    if args.slug not in META:
        raise SystemExit(f'Unknown social card slug: {args.slug}')

    category,kind=META[args.slug]
    img=Image.new('RGB',(W,H),BG)
    d=ImageDraw.Draw(img)
    draw_header(img,d)
    draw_hero(img,d,category,args.headline)
    draw_bullets(d,args.bullet)
    draw_panel(d,kind,args.bullet)
    draw_footer(d,args.cta)

    out=Path(args.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    img.save(out,'PNG',optimize=True)
    print(f'Rendered {out} using exact canonical logo {LOGO} and deterministic brand UI.')

if __name__=='__main__':
    main()
