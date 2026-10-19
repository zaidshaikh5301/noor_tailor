s = open('src/data/products.ts','r',encoding='utf-8').read()
old = \"  make('img-4126','Unclassified Garment 4126','Kurtas','Kurta-pajama',0,'Fabric unknown','Colour unknown','#808080',['Festive'],'Product details pending visual review. Image requires manual classification for garment type, colour, fabric, and occasion. Price and details to be confirmed.',{fresh:false}),\"
new = \"  make('img-4126','Navy Bandhgala Jacket','Indo-Western','Bandhgala',22900,'Silk blend','Navy','#293648',['Wedding','Reception'],'Navy bandhgala jacket with clean tailored silhouette. Price on request.',{fresh:false}),\"
if old in s:
    s = s.replace(old, new)
    open('src/data/products.ts','w',encoding='utf-8').write(s)
    print('ok')
else:
    print('no')
