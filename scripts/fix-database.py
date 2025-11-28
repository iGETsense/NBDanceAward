#!/usr/bin/env python3
"""
Script pour corriger la base de données Firebase selon les retours client:
1. Ajouter Talented Afro dans groupe de danse
2. Déplacer Nyanga Boy de mbolé vers artiste danseur masculin
3. Ajouter Nounours et Lysiane dans duo collaboration
"""

import json
import sys

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    db_file = '/home/almight/Documents/NBDanceAward/firebase_db.json'
    
    print("📖 Chargement de la base de données...")
    db = load_json(db_file)
    
    # 1. Ajouter Talented Afro dans groupe de danse
    print("\n✅ Ajout de Talented Afro dans groupe de danse...")
    talented_afro_id = "talented-afro-dance-group"
    db['candidates'][talented_afro_id] = {
        "id": talented_afro_id,
        "baseId": "talented-afro",
        "name": "Talented Afro",
        "title": "Talented Afro",
        "image": "/dancers/Talented Afro.jpg",
        "votes": 0,
        "badge": None,
        "percentage": 0,
        "category": "Meilleur groupe de danse",
        "categoryId": "dance-group"
    }
    
    # Ajouter le lien dans candidateCategories (c'est un array)
    db['candidateCategories'].append({
        "candidateId": talented_afro_id,
        "categoryId": "dance-group"
    })
    print(f"   ✓ Talented Afro ajouté avec ID: {talented_afro_id}")
    
    # 2. Déplacer Nyanga Boy de mbolé vers artiste danseur masculin
    print("\n✅ Déplacement de Nyanga Boy...")
    
    # Supprimer de mbolé
    nyanga_mbole_id = "nyanga-boy-mbole-male-dancer"
    if nyanga_mbole_id in db['candidates']:
        del db['candidates'][nyanga_mbole_id]
        print(f"   ✓ Nyanga Boy supprimé de mbolé")
    
    # Supprimer le lien mbolé
    db['candidateCategories'] = [
        link for link in db['candidateCategories']
        if link.get('candidateId') != nyanga_mbole_id
    ]
    print(f"   ✓ Lien mbolé supprimé")
    
    # Ajouter dans artiste danseur masculin
    nyanga_male_id = "nyanga-boy-male-dancer"
    db['candidates'][nyanga_male_id] = {
        "id": nyanga_male_id,
        "baseId": "nyanga-boy",
        "name": "Nyanga Boy",
        "title": "Nyanga Boy",
        "image": "/dancers/placeholder.svg",
        "votes": 0,
        "badge": None,
        "percentage": 0,
        "category": "Meilleur artiste danseur - masculin",
        "categoryId": "male-dancer"
    }
    
    # Ajouter le nouveau lien
    db['candidateCategories'].append({
        "candidateId": nyanga_male_id,
        "categoryId": "male-dancer"
    })
    print(f"   ✓ Nyanga Boy ajouté dans artiste danseur masculin")
    
    # 3. Ajouter Nounours et Lysiane dans duo collaboration
    print("\n✅ Ajout de Nounours et Lysiane dans duo collaboration...")
    
    nounours_lysiane_id = "nounours-et-lysiane-duo-collaboration"
    db['candidates'][nounours_lysiane_id] = {
        "id": nounours_lysiane_id,
        "baseId": "nounours-et-lysiane",
        "name": "Nounours et Lysiane",
        "title": "Nounours et Lysiane",
        "image": "/dancers/placeholder.svg",
        "votes": 0,
        "badge": None,
        "percentage": 0,
        "category": "Meilleur collaboration duo",
        "categoryId": "duo-collaboration"
    }
    
    # Ajouter le lien
    db['candidateCategories'].append({
        "candidateId": nounours_lysiane_id,
        "categoryId": "duo-collaboration"
    })
    print(f"   ✓ Nounours et Lysiane ajouté avec ID: {nounours_lysiane_id}")
    
    # Compter les candidats par catégorie
    print("\n📊 Résumé des modifications:")
    
    # Groupe de danse
    dance_groups = [c for c in db['candidates'].values() if c['categoryId'] == 'dance-group']
    print(f"   • Groupe de danse: {len(dance_groups)} candidats")
    for g in dance_groups:
        print(f"     - {g['name']}")
    
    # Artiste danseur masculin
    male_dancers = [c for c in db['candidates'].values() if c['categoryId'] == 'male-dancer']
    print(f"   • Artiste danseur masculin: {len(male_dancers)} candidats")
    
    # Duo collaboration
    duos = [c for c in db['candidates'].values() if c['categoryId'] == 'duo-collaboration']
    print(f"   • Duo collaboration: {len(duos)} candidats")
    for d in duos:
        print(f"     - {d['name']}")
    
    # Sauvegarder
    print(f"\n💾 Sauvegarde dans {db_file}...")
    save_json(db_file, db)
    print("✅ Base de données mise à jour avec succès!")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
