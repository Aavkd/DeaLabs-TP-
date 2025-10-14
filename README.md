███╗   ███╗██╗███╗   ██╗██╗       ██████╗ ███████╗ █████╗ ██╗      █████╗ ██████╗ ███████╗
████╗ ████║██║████╗  ██║██║      ██╔═══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗██╔════╝
██╔████╔██║██║██╔██╗ ██║██║█████╗██║   ██║█████╗  ███████║██║     ███████║██████╔╝███████╗
██║╚██╔╝██║██║██║╚██╗██║██║╚════╝██║   ██║██╔══╝  ██╔══██║██║     ██╔══██║██╔══██╗╚════██║
██║ ╚═╝ ██║██║██║ ╚████║██║      ╚██████╔╝███████╗██║  ██║███████╗██║  ██║██████╔╝███████║
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝       ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝



<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Tests-Jest%2057%E2%9C%94-red?logo=jest" />
  <img src="https://img.shields.io/badge/Clean%20Code-✅-brightgreen" />
  <img src="https://img.shields.io/badge/CLI-Interactive-orange" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" />
  <img src="https://img.shields.io/badge/Author-Alexy%20TRAORE-blue" />
</p>

# Mini Dealabs CLI 🚀
Une application CLI moderne en **TypeScript** inspirée de Dealabs, avec **interface animée**, **architercture propre** et **tests Jest** 

## 🎓 Contexte du projet
Projet réalisé dans le cadre du **TP Final – Bonne Pratique Dev**. Objectifs :
✅ Maîtrise du TypeScript en mode strict
✅ Respect des principes Clean Code (SRP, DRY, KISS)
✅ Tests Jest (57 tests validés)
✅ Interface CLI moderne (animations, tableaux, ASCII art, UX claire)

---

## ✅ Fonctionnalités
### 🛒 Gestion des Deals
- Création avec validation stricte
- Liste triée par **température (popularité)**
- Recherche par **mot-clé et catégorie**
- Détails complets

### 🔥 Votes
- Voter **HOT (+1)** ou **COLD (-1)**
- Score dynamique pour chaque deal
- Statistiques de popularité

### 📊 Statistiques
- **Top 3** deals 🥇🥈🥉
- Stats par catégories (graphique ASCII)
- Calcul automatique des réductions

### 🎨 Interface moderne
- Spinners animés (`ora`)
- Tableaux élégants (`cli-table3`)
- ASCII art (`figlet`, `gradient-string`)
- Messages stylisés (`boxen`)
- Navigation intuitive **avec émojis**

---

## 🖥️ Aperçu CLI

```
┌──────────────────────────────┬────────────┬───────────────┬──────────┬────────┬────────────┐
│ Title                        │ Category   │ Price         │ Discount │ Temp   │ Votes      │
├──────────────────────────────┼────────────┼───────────────┼──────────┼────────┼────────────┤
│ PlayStation 5 Console Bundl… │ Gaming     │ €550 → €499   │ -9.27%   │ 15°    │ 👍 18 👎 3 │
├──────────────────────────────┼────────────┼───────────────┼──────────┼────────┼────────────┤
│ Gaming Laptop RTX 4060       │ Tech       │ €1200 → €999  │ -16.75%  │ 5°     │ 👍 7 👎 2  │
├──────────────────────────────┼────────────┼───────────────┼──────────┼────────┼────────────┤
│ Test-Deal                    │ Tech       │ €999 → €666   │ -33.33%  │ 1°     │ 👍 1 👎 0  │
├──────────────────────────────┼────────────┼───────────────┼──────────┼────────┼────────────┤
│ Smart Home Hub               │ Home       │ €150 → €89    │ -40.67%  │ -1°    │ 👍 4 👎 5  │
└──────────────────────────────┴────────────┴───────────────┴──────────┴────────┴────────────┘
```

---


## 🛠️ Stack Technique
| Domaine | Technologie |
|----------|-------------|
| Langage | TypeScript (strict) |
| CLI UI | Inquirer, Chalk, Ora, Boxen, Figlet |
| Tests | Jest + ts-jest |
| Logging | Winston |
| Qualité | ESLint + Prettier |
| Documentation | TypeDoc |
| Persistance | Fichiers JSON (fs async) |

---


## 🔧 Installation

```bash
git clone <repo>
cd mini-dealabs-cli
npm install
```

---

## ▶️ Utilisation

**Mode développement :**

```bash
npm run dev
```

**Mode production :**

```bash
npm run build
npm start
```

---

## 📁 Structure du Projet

```
TRAORE-Alexy-mini-dealabs/
├─ src/
│   ├─ index.ts           # Entrée CLI (menu Inquirer + animations) ✅
│   ├─ dealManager.ts     # Logique métier des deals ✅
│   ├─ voteManager.ts     # Logique de vote ✅
│   ├─ validators.ts      # Validation des entrées ✅
│   ├─ logger.ts          # Logger Winston ✅
│   ├─ storage.ts         # Persistance JSON ✅
│   ├─ types.ts           # Types partagés & Result ✅
│   └─ data/
│       └─ deals.json     # Données persistantes ✅
├─ __tests__/
│   ├─ validators.test.ts    # 25 tests ✅
│   ├─ dealManager.test.ts   # 20 tests ✅
│   └─ voteManager.test.ts   # 12 tests ✅
├─ docs/                     # HTML TypeDoc ✅
├─ dist/                     # JS compilé ✅
├─ package.json              # Tous les scripts ✅
├─ tsconfig.json             # Config TS stricte ✅
├─ jest.config.ts            # Jest avec ts-jest ✅
├─ .eslintrc.json            # ESLint (Airbnb TS) ✅
├─ .prettierrc               # Config Prettier ✅
├─ typedoc.json              # Config TypeDoc ✅
└─ README.md                 # Documentation pro ✅
```

---

## 🧪 Tests

✅ 57 tests Jest unitaires  
✅ Mock du stockage fichier  
✅ Vérification complète de la logique

```bash
npm test
```

---

## 🚀 Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancement TS |
| `npm run build` | Build TypeScript |
| `npm start` | Exécution Node |
| `npm test` | Tests Jest |
| `npm run lint` | Vérification ESLint |
| `npm run format` | Formatage Prettier |
| `npm run docs` | Documentation TypeDoc |

---

## 📜 Licence

MIT License

---

## 👨‍💻 Auteur

Développé avec ❤️ par **Alexy TRAORE**  
*TP Final – Bonne Pratique Dev*