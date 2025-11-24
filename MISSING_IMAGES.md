# 🖼️ Images Manquantes - À Ajouter

## 📋 Images Réelles Utilisées

Ces images existent déjà dans `/public/dancers/`:

✅ MAGUY MERINE.jpeg
✅ KENDI.jpeg
✅ bebs-velina.jpeg
✅ Katia EG.png
✅ NELLY DORA.jpeg
✅ Maxime la vitesse.jpg
✅ El fally du 237.jpg
✅ DEBOY LE MONSTRE.jpeg
✅ Etienne kampos.jpg
✅ De Flow.jpeg
✅ PASCAL métaphore.jpeg
✅ petit tchakap.jpg
✅ AFU DANCE ACADEMY STUDIO.jpeg
✅ ÉTAT NWAR DANCE SCHOOL.jpg
✅ TEAM ESCRAM.jpeg
✅ ORDINATEUR baboué.jpeg
✅ SHAZAM.jpeg
✅ ayi ventilateur.png
✅ Accadient Fureur.jpeg
✅ GOLDY LA-STAR.jpeg

---

## 🖼️ Images Manquantes (À Ajouter)

Les candidats suivants utilisent `placeholder.svg`:

### Femmes (5)
1. Stella officielle
2. Nounours
3. O'konor Céleste
4. Chica bassa
5. Lmn ponce off

### Hommes (15)
1. Escram shuwingum
2. 3 peace
3. Jkaxel
4. Tks officiel
5. 4 peace
6. Echantillon 1er
7. Yvan 10
8. Nyanga Boy
9. Trésor brown
10. Xender
11. BB Super l'elu
12. Vinny magicien
13. Smobar Le Balthazar
14. Authentik
15. Pikan pointure

### Autres (9)
1. Influence femi
2. Jessi 237
3. Kloe la machine
4. Maldjess peace
5. Jumeaux de la capitale
6. Mbolé Dancing
7. Wenjel Avataro
8. Jesus saotao
9. Kibong adoube

### Groupes & Collaborations (4)
1. Nounours traditionnel
2. Garçon déterminé
3. La religion noire
4. Le Hempe

### Duos (2)
1. Rachel élégance
2. Davia off

---

## 📁 Comment Ajouter les Images

### Étape 1: Préparer les Images
1. Trouvez les images des candidats manquants
2. Redimensionnez-les à ~500x500px
3. Convertissez en JPEG ou PNG
4. Nommez-les correctement

### Étape 2: Ajouter à `/public/dancers/`
```bash
cp image.jpg /public/dancers/Stella\ officielle.jpg
cp image.jpg /public/dancers/Nounours.jpg
# etc.
```

### Étape 3: Mettre à Jour `FIREBASE_OPTIMIZED.json`
Remplacez `placeholder.svg` par le vrai chemin:

```json
{
  "candidate-5": {
    "id": "candidate-5",
    "name": "Stella officielle",
    "image": "/dancers/Stella officielle.jpg",  // ← Changez ici
    "votes": 0,
    "categories": ["female-dancer"]
  }
}
```

### Étape 4: Réimporter dans Firebase
1. Allez à Firebase Console
2. Supprimez l'ancien JSON
3. Importez le nouveau

---

## 🎨 Noms de Fichiers Recommandés

```
/public/dancers/
├── Stella officielle.jpg
├── Nounours.jpg
├── O'konor Céleste.jpg
├── Chica bassa.jpg
├── Lmn ponce off.jpg
├── Escram shuwingum.jpg
├── 3 peace.jpg
├── Jkaxel.jpg
├── Tks officiel.jpg
├── 4 peace.jpg
├── Echantillon 1er.jpg
├── Yvan 10.jpg
├── Nyanga Boy.jpg
├── Trésor brown.jpg
├── Xender.jpg
├── BB Super l'elu.jpg
├── Vinny magicien.jpg
├── Smobar Le Balthazar.jpg
├── Authentik.jpg
├── Pikan pointure.jpg
├── Influence femi.jpg
├── Jessi 237.jpg
├── Kloe la machine.jpg
├── Maldjess peace.jpg
├── Jumeaux de la capitale.jpg
├── Mbolé Dancing.jpg
├── Wenjel Avataro.jpg
├── Jesus saotao.jpg
├── Kibong adoube.jpg
├── Nounours traditionnel.jpg
├── Garçon déterminé.jpg
├── La religion noire.jpg
├── Le Hempe.jpg
├── Rachel élégance.jpg
└── Davia off.jpg
```

---

## ✅ Checklist

- [ ] Trouver les 34 images manquantes
- [ ] Redimensionner à ~500x500px
- [ ] Ajouter à `/public/dancers/`
- [ ] Mettre à jour `FIREBASE_OPTIMIZED.json`
- [ ] Réimporter dans Firebase
- [ ] Tester que les images chargent

---

## 💡 Alternative

Si vous n'avez pas toutes les images:
- Utilisez `placeholder.svg` temporairement
- Les candidats s'afficheront quand même
- Ajoutez les images plus tard

---

## 📞 Support

Si vous avez besoin d'aide:
1. Consultez `COMPLETION_SUMMARY.md`
2. Vérifiez les chemins dans `FIREBASE_OPTIMIZED.json`
3. Testez avec `npm run dev`

---

**Les images réelles rendront le projet encore plus beau! 🎨**
