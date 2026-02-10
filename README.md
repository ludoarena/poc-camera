# POC Camera - Application Caméra en Direct

Cette application React affiche le flux de votre caméra en temps réel dans le navigateur, accompagné d'informations provenant de divers capteurs de l'appareil.

## Fonctionnalités

- 📹 Affichage en direct du flux de la caméra
- 📍 **Géolocalisation GPS** (latitude, longitude, altitude, vitesse, cap)
- 🧭 **Boussole & Orientation** (direction, inclinaison avant/arrière, rotation gauche/droite)
- 🔄 **Gyroscope** (vitesse de rotation sur 3 axes)
- 📊 **Accéléromètre** (accélération sur 3 axes)
- 🔋 **Informations batterie** (niveau, état de charge)
- 📶 **Informations réseau** (type de connexion, latence)
- 🎨 Interface moderne avec Tailwind CSS
- ⚠️ Gestion des erreurs et permissions
- 📱 Responsive et optimisé mobile

## Capteurs disponibles

L'application affiche en temps réel les données des capteurs suivants (si disponibles sur votre appareil) :

### GPS / Géolocalisation
- Latitude et longitude
- Altitude
- Précision
- Cap (direction)
- Vitesse

### Orientation (Boussole)
- Alpha (α) : Direction / boussole (0-360°)
- Beta (β) : Inclinaison avant/arrière (-180 à 180°)
- Gamma (γ) : Rotation gauche/droite (-90 à 90°)

### Gyroscope
- Vitesse de rotation sur les axes X, Y, Z (en degrés/seconde)

### Accéléromètre
- Accélération sur les axes X, Y, Z (en m/s²)

### Batterie
- Niveau de charge (%)
- État de charge (en charge / décharge)

### Réseau
- Type de connexion (4G, 3G, WiFi, etc.)
- RTT (Round Trip Time - latence)

## Installation

```bash
npm install
```

## Lancement de l'application

```bash
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000).

**Notes importantes :**
- Vous devrez autoriser l'accès à votre caméra
- Sur mobile, vous devrez également autoriser l'accès à la géolocalisation
- Sur iOS 13+, vous devrez autoriser l'accès aux capteurs de mouvement

## Configuration de Tailwind CSS

Pour utiliser Tailwind CSS, vous devez l'installer :

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Le fichier `tailwind.config.js` est déjà configuré dans le projet.

## Scripts disponibles

- `npm start` - Lance l'application en mode développement
- `npm test` - Lance les tests
- `npm run build` - Crée une version de production
- `npm run eject` - Éjecte la configuration (irréversible)

## Technologies utilisées

- React 18
- Tailwind CSS
- WebRTC API (getUserMedia)
- Geolocation API
- Device Orientation API
- Device Motion API
- Battery Status API
- Network Information API

## Compatibilité

### Caméra (getUserMedia)
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

### Capteurs
La disponibilité des capteurs varie selon l'appareil et le navigateur :

- **GPS** : Disponible sur tous les navigateurs modernes (nécessite HTTPS en production)
- **Orientation/Boussole** : Principalement mobile, nécessite permission sur iOS 13+
- **Gyroscope/Accéléromètre** : Principalement mobile, nécessite permission sur iOS 13+
- **Batterie** : Chrome (desktop/mobile), Opera
- **Réseau** : Chrome, Edge, Opera (desktop/mobile)

## Permissions

### Sur iOS 13+ (iPhone/iPad)
Pour accéder aux capteurs de mouvement et d'orientation, vous devez :
1. Autoriser l'accès dans les réglages Safari
2. Ou ajouter un bouton pour demander la permission explicitement

### Sécurité
Pour des raisons de sécurité, certaines fonctionnalités ne fonctionnent que :
- Sur `localhost` en développement
- Sur des sites HTTPS en production

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Autorisez l'accès à la caméra
3. Autorisez l'accès à la géolocalisation (si demandé)
4. Sur mobile iOS, autorisez l'accès aux capteurs de mouvement (si demandé)
5. Les données des capteurs s'affichent automatiquement sous la vidéo

Les informations sont mises à jour en temps réel. Si un capteur n'est pas disponible sur votre appareil, "N/A" sera affiché.
