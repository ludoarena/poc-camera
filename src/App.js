import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { useBodyEffects } from './useBodyEffects';

function App() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les capteurs
  const [gpsData, setGpsData] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [motion, setMotion] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometer, setAccelerometer] = useState({ x: 0, y: 0, z: 0 });
  const [battery, setBattery] = useState(null);
  const [network, setNetwork] = useState(null);
  
  // État pour le filtre glauque
  const [glauqueFilter, setGlauqueFilter] = useState('none');
  
  // État pour les effets sur le corps/visage
  const [bodyEffect, setBodyEffect] = useState('none');
  
  // Hook pour les effets sur le corps
  const { canvasRef, isLoading: isLoadingBodyPix, error: bodyEffectError } = useBodyEffects(videoRef, bodyEffect, isStreaming);

  // Vérifie si on pointe vers le nord (à 5% près)
  const isPointingNorth = () => {
    const alpha = parseFloat(orientation.alpha);
    // Nord = 0° ou 360°, tolérance de ±18° (5% de 360°)
    return (alpha >= 0 && alpha <= 18) || (alpha >= 342 && alpha <= 360);
  };

  // Filtres glauques disponibles
  const glauqueFilters = {
    'none': {
      name: 'Normal',
      filter: 'none',
      category: 'normal'
    },
    // Filtres Glauques
    'horror': {
      name: '👻 Horreur',
      filter: 'contrast(1.5) brightness(0.7) saturate(0.5) hue-rotate(270deg)',
      category: 'glauque'
    },
    'nightmare': {
      name: '😱 Cauchemar',
      filter: 'contrast(2) brightness(0.5) saturate(0.3) sepia(0.4) hue-rotate(90deg)',
      category: 'glauque'
    },
    'ghost': {
      name: '👤 Fantôme',
      filter: 'grayscale(1) contrast(1.3) brightness(1.2) blur(1px)',
      category: 'glauque'
    },
    'found_footage': {
      name: '📹 Found Footage',
      filter: 'contrast(1.8) brightness(0.6) saturate(0.4) grayscale(0.3) sepia(0.2)',
      category: 'glauque'
    },
    'cursed': {
      name: '🔮 Maudit',
      filter: 'invert(0.1) contrast(1.7) brightness(0.8) saturate(1.5) hue-rotate(180deg)',
      category: 'glauque'
    },
    'paranormal': {
      name: '👁️ Paranormal',
      filter: 'contrast(2.5) brightness(0.4) saturate(0) blur(0.5px)',
      category: 'glauque'
    },
    'decay': {
      name: '🧟 Décomposition',
      filter: 'contrast(1.4) brightness(0.7) saturate(0.6) sepia(0.6) hue-rotate(60deg)',
      category: 'glauque'
    },
    'static': {
      name: '📺 Perturbé',
      filter: 'contrast(3) brightness(0.9) saturate(0.2) grayscale(0.7)',
      category: 'glauque'
    },
    // Filtres Matrix
    'matrix': {
      name: '💚 Matrix',
      filter: 'contrast(1.5) brightness(0.8) saturate(2) hue-rotate(90deg)',
      category: 'matrix'
    },
    'matrix_code': {
      name: '🖥️ Code Matrix',
      filter: 'contrast(2) brightness(0.6) saturate(0) hue-rotate(120deg) sepia(1)',
      category: 'matrix'
    },
    'matrix_green': {
      name: '💻 Néon Vert',
      filter: 'grayscale(1) contrast(2.5) brightness(0.7) sepia(1) hue-rotate(60deg) saturate(3)',
      category: 'matrix'
    },
    // Filtres Heroic Fantasy
    'fantasy': {
      name: '⚔️ Fantasy Épique',
      filter: 'contrast(1.3) brightness(1.1) saturate(1.4) sepia(0.2) hue-rotate(10deg)',
      category: 'fantasy'
    },
    'magic': {
      name: '✨ Magique',
      filter: 'contrast(1.2) brightness(1.2) saturate(1.6) hue-rotate(270deg)',
      category: 'fantasy'
    },
    'dragon': {
      name: '🐉 Dragon',
      filter: 'contrast(1.4) brightness(0.9) saturate(1.3) sepia(0.3) hue-rotate(20deg)',
      category: 'fantasy'
    },
    // Filtres Harry Potter
    'hogwarts': {
      name: '🦉 Poudlard',
      filter: 'contrast(1.3) brightness(0.85) saturate(0.9) sepia(0.3)',
      category: 'potter'
    },
    'magic_castle': {
      name: '🏰 Château Magique',
      filter: 'contrast(1.4) brightness(0.9) saturate(1.1) sepia(0.4) hue-rotate(15deg)',
      category: 'potter'
    },
    'potion': {
      name: '🧪 Potion',
      filter: 'contrast(1.5) brightness(0.8) saturate(1.5) hue-rotate(240deg)',
      category: 'potter'
    },
    // Filtres Vieille Photo
    'vintage': {
      name: '📷 Vintage',
      filter: 'sepia(0.8) contrast(1.1) brightness(1.1) saturate(0.5)',
      category: 'vintage'
    },
    'old_photo': {
      name: '🖼️ Photo Ancienne',
      filter: 'sepia(1) contrast(0.9) brightness(1.2) grayscale(0.3)',
      category: 'vintage'
    },
    'faded': {
      name: '⏳ Délavé',
      filter: 'sepia(0.6) contrast(0.8) brightness(1.3) saturate(0.4) blur(0.3px)',
      category: 'vintage'
    },
    'daguerreotype': {
      name: '📸 Daguerréotype',
      filter: 'grayscale(1) sepia(0.4) contrast(1.3) brightness(1.1)',
      category: 'vintage'
    },
    // Filtres Sherlock Holmes
    'victorian': {
      name: '🎩 Victorien',
      filter: 'sepia(0.7) contrast(1.3) brightness(0.9) saturate(0.6)',
      category: 'sherlock'
    },
    'london_fog': {
      name: '🌫️ Brouillard Londres',
      filter: 'sepia(0.5) contrast(1.1) brightness(0.8) saturate(0.5) blur(0.5px)',
      category: 'sherlock'
    },
    'detective': {
      name: '🔍 Détective',
      filter: 'grayscale(0.6) sepia(0.5) contrast(1.4) brightness(0.85)',
      category: 'sherlock'
    },
    // Filtres Steampunk
    'steampunk': {
      name: '⚙️ Steampunk',
      filter: 'sepia(0.8) contrast(1.4) brightness(0.9) saturate(1.2) hue-rotate(20deg)',
      category: 'steampunk'
    },
    'brass': {
      name: '🔧 Laiton',
      filter: 'sepia(0.9) contrast(1.5) brightness(1.1) saturate(1.3) hue-rotate(30deg)',
      category: 'steampunk'
    },
    'industrial': {
      name: '🏭 Industriel',
      filter: 'sepia(0.6) contrast(1.6) brightness(0.85) saturate(0.8) grayscale(0.2)',
      category: 'steampunk'
    },
    'copper': {
      name: '🪙 Cuivre',
      filter: 'sepia(1) contrast(1.3) brightness(1) saturate(1.4) hue-rotate(15deg)',
      category: 'steampunk'
    }
  };

  // Effets sur le corps/visage disponibles
  const bodyEffects = {
    'none': { name: 'Aucun effet' },
    'blackout': { name: '⬛ Silhouette Noire' },
    'grayscale_person': { name: '🎬 Personne N&B (Sin City)' },
    'sepia_person': { name: '📜 Personne Sépia' },
    'negative_person': { name: '🔄 Négatif Personne' },
    'ghost': { name: '👻 Fantôme (Semi-transparent)' },
    'red_tint': { name: '🔴 Teinte Rouge' },
    'blue_tint': { name: '🔵 Teinte Bleue' },
    'green_tint': { name: '🟢 Teinte Verte' },
    'clown_texture': { name: '🤡 Texture Clown' },
    'blur_person': { name: '😵‍💫 Flou Personne (Anonymat)' },
    'pixelated': { name: '🟪 Pixelisé' },
    'edge_glow': { name: '✨ Contour Lumineux' },
    'invisible': { name: '🫥 Invisible (Fond seul)' },
    'matrix_code': { name: '💚 Code Matrix sur Corps' },
    'fire': { name: '🔥 Texture Feu' },
    'water': { name: '💧 Texture Eau' },
    'glitch': { name: '📺 Effet Glitch' }
  };

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        // Demande l'accès à la caméra
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        
        // Connecte le flux vidéo à l'élément video
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Erreur d'accès à la caméra:", err);
        setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
      }
    };

    startCamera();

    // Nettoyage : arrête le flux vidéo quand le composant est démonté
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // GPS / Géolocalisation
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toLocaleTimeString()
          });
          setGpsError(null);
        },
        (err) => {
          setGpsError(err.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsError('Géolocalisation non disponible');
    }
  }, []);

  // Boussole / Orientation (DeviceOrientation)
  useEffect(() => {
    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha?.toFixed(1) || 0, // Boussole (0-360°)
        beta: event.beta?.toFixed(1) || 0,   // Inclinaison avant/arrière (-180 à 180°)
        gamma: event.gamma?.toFixed(1) || 0  // Inclinaison gauche/droite (-90 à 90°)
      });
    };

    if (window.DeviceOrientationEvent) {
      // Pour iOS 13+, demande de permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Gyroscope / Accéléromètre (DeviceMotion)
  useEffect(() => {
    const handleMotion = (event) => {
      if (event.rotationRate) {
        setMotion({
          x: event.rotationRate.alpha?.toFixed(2) || 0,
          y: event.rotationRate.beta?.toFixed(2) || 0,
          z: event.rotationRate.gamma?.toFixed(2) || 0
        });
      }
      
      if (event.acceleration) {
        setAccelerometer({
          x: event.acceleration.x?.toFixed(2) || 0,
          y: event.acceleration.y?.toFixed(2) || 0,
          z: event.acceleration.z?.toFixed(2) || 0
        });
      }
    };

    if (window.DeviceMotionEvent) {
      // Pour iOS 13+, demande de permission
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  // Batterie
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((batteryManager) => {
        const updateBattery = () => {
          setBattery({
            level: (batteryManager.level * 100).toFixed(0),
            charging: batteryManager.charging,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime
          });
        };

        updateBattery();
        batteryManager.addEventListener('levelchange', updateBattery);
        batteryManager.addEventListener('chargingchange', updateBattery);

        return () => {
          batteryManager.removeEventListener('levelchange', updateBattery);
          batteryManager.removeEventListener('chargingchange', updateBattery);
        };
      });
    }
  }, []);

  // Informations réseau
  useEffect(() => {
    const updateNetwork = () => {
      if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        setNetwork({
          type: conn.effectiveType || conn.type || 'inconnu',
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        });
      }
    };

    updateNetwork();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateNetwork);
      return () => conn.removeEventListener('change', updateNetwork);
    }
  }, []);

  // Composant Boussole
  const Compass = ({ heading }) => {
    const angle = parseFloat(heading) || 0;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full shadow-2xl border-4 border-white/20">
          {/* Cercle extérieur avec graduations */}
          <div className="absolute inset-0 rounded-full">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-3 bg-white/40 left-1/2 top-0 -translate-x-1/2"
                style={{
                  transform: `rotate(${deg}deg) translateY(0)`,
                  transformOrigin: '50% 64px'
                }}
              />
            ))}
          </div>
          
          {/* Points cardinaux */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 font-extrabold text-sm">N</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">E</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">S</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2">O</div>
          </div>
          
          {/* Aiguille de la boussole */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Partie Nord (rouge) */}
            <div className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[40px] border-b-red-500 -translate-y-2 drop-shadow-lg" />
            {/* Partie Sud (blanche) */}
            <div className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[40px] border-t-white/80 translate-y-2 drop-shadow-lg" />
          </div>
          
          {/* Centre */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white" />
        </div>
        
        {/* Affichage numérique */}
        <div className="mt-3 text-center">
          <div className="text-2xl font-bold text-white">{angle}°</div>
          <div className="text-xs text-gray-400 font-semibold">
            {angle >= 337.5 || angle < 22.5 ? 'Nord' :
             angle >= 22.5 && angle < 67.5 ? 'Nord-Est' :
             angle >= 67.5 && angle < 112.5 ? 'Est' :
             angle >= 112.5 && angle < 157.5 ? 'Sud-Est' :
             angle >= 157.5 && angle < 202.5 ? 'Sud' :
             angle >= 202.5 && angle < 247.5 ? 'Sud-Ouest' :
             angle >= 247.5 && angle < 292.5 ? 'Ouest' : 'Nord-Ouest'}
          </div>
        </div>
      </div>
    );
  };

  // Composant pour afficher une métrique
  const SensorCard = ({ icon, title, value, unit = '', available = true }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
      </div>
      <p className="text-xl font-bold text-white">
        {available ? (value !== null && value !== undefined ? `${value} ${unit}` : '---') : 'N/A'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 max-w-6xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">
          📹 Caméra en Direct
        </h1>
        
        {/* Vidéo avec overlay du clown */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-inner mb-6">
          {error ? (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
                <p className="text-gray-400 text-sm">
                  Assurez-vous d'autoriser l'accès à la caméra dans votre navigateur
                </p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover"
                style={{
                  filter: glauqueFilters[glauqueFilter].filter,
                  display: bodyEffect === 'none' ? 'block' : 'none'
                }}
              />
              
              {/* Canvas pour les effets sur le corps */}
              <canvas
                ref={canvasRef}
                className="w-full aspect-video object-cover"
                style={{
                  display: bodyEffect !== 'none' ? 'block' : 'none',
                  filter: glauqueFilters[glauqueFilter].filter
                }}
              />
              
              {/* Indicateur chargement MediaPipe */}
              {isLoadingBodyPix && bodyEffect !== 'none' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center bg-white/10 p-6 rounded-xl border border-white/20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white font-bold text-lg mb-2">Initialisation IA...</p>
                    <p className="text-gray-300 text-sm">MediaPipe Selfie Segmentation</p>
                    <p className="text-gray-400 text-xs mt-2">~2 MB • Une seule fois</p>
                  </div>
                </div>
              )}
              
              {/* Erreur chargement */}
              {bodyEffectError && bodyEffect !== 'none' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center bg-red-900/30 p-6 rounded-xl border border-red-500/50">
                    <p className="text-red-400 font-bold text-lg mb-2">⚠️ Erreur</p>
                    <p className="text-gray-300 text-sm">{bodyEffectError}</p>
                    <p className="text-gray-400 text-xs mt-2">Vérifiez votre connexion internet</p>
                  </div>
                </div>
              )}
              
              {/* Indicateur EN DIRECT */}
              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">EN DIRECT</span>
                </div>
              )}
              
              {/* Image du clown quand on pointe vers le nord */}
              {isStreaming && isPointingNorth() && (
                <img 
                  src={`${process.env.PUBLIC_URL}/clown.jpeg`}
                  alt="Clown" 
                  className="absolute animate-pulse"
                  style={{
                    top: '5%',
                    left: '5%',
                    height: '30%',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))'
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Sélecteurs de filtres et effets */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Listbox Filtres Vidéo */}
          <div>
            <label htmlFor="filter-select" className="block text-lg font-bold text-white mb-3 text-center">
              🎨 Filtre Vidéo
            </label>
            <select
              id="filter-select"
              value={glauqueFilter}
              onChange={(e) => setGlauqueFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer backdrop-blur-sm"
              style={{ fontSize: '14px' }}
            >
              <option value="none" className="bg-slate-900">Normal</option>
              
              <optgroup label="👻 GLAUQUE / HORREUR" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'glauque').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="💚 MATRIX" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'matrix').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="⚔️ HEROIC FANTASY" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'fantasy').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="🦉 HARRY POTTER" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'potter').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="📷 VIEILLE PHOTO" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'vintage').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="🔍 SHERLOCK HOLMES" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'sherlock').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
              
              <optgroup label="⚙️ STEAMPUNK" className="bg-slate-800">
                {Object.entries(glauqueFilters).filter(([_, v]) => v.category === 'steampunk').map(([key, value]) => (
                  <option key={key} value={key} className="bg-slate-900">{value.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Listbox Effets Corps/Visage */}
          <div>
            <label htmlFor="body-effect-select" className="block text-lg font-bold text-white mb-3 text-center">
              👤 Effet Corps/Visage
            </label>
            <select
              id="body-effect-select"
              value={bodyEffect}
              onChange={(e) => setBodyEffect(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              style={{ fontSize: '14px' }}
            >
              {Object.entries(bodyEffects).map(([key, value]) => (
                <option key={key} value={key} className="bg-slate-900">{value.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isLoadingBodyPix ? '⏳ Chargement MediaPipe...' : 
               bodyEffectError ? '❌ Erreur de chargement' :
               bodyEffect !== 'none' ? '✅ Détection personne active (IA)' : 
               '💡 Effets IA sur visage/corps uniquement'}
            </p>
          </div>
        </div>

        {/* Boussole */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
              🧭 Boussole
            </h2>
            <Compass heading={orientation.alpha} />
            {isPointingNorth() && (
              <div className="mt-4 text-center">
                <span className="inline-block bg-red-500/80 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  ⬆️ POINTÉ VERS LE NORD !
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informations des capteurs */}
        <div className="space-y-6">
          {/* GPS */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              📍 Localisation GPS
            </h2>
            {gpsError ? (
              <p className="text-yellow-400 text-sm">⚠️ {gpsError}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <SensorCard icon="🌍" title="Latitude" value={gpsData?.latitude.toFixed(6)} unit="°" available={!!gpsData} />
                <SensorCard icon="🌍" title="Longitude" value={gpsData?.longitude.toFixed(6)} unit="°" available={!!gpsData} />
                <SensorCard icon="⛰️" title="Altitude" value={gpsData?.altitude?.toFixed(1)} unit="m" available={!!gpsData} />
                <SensorCard icon="🎯" title="Précision" value={gpsData?.accuracy?.toFixed(1)} unit="m" available={!!gpsData} />
                <SensorCard icon="🧭" title="Cap" value={gpsData?.heading?.toFixed(0)} unit="°" available={!!gpsData} />
                <SensorCard icon="🚀" title="Vitesse" value={gpsData?.speed ? (gpsData.speed * 3.6).toFixed(1) : null} unit="km/h" available={!!gpsData} />
              </div>
            )}
          </div>

          {/* Orientation */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              🧭 Orientation
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SensorCard icon="🧭" title="Direction (α)" value={orientation.alpha} unit="°" />
              <SensorCard icon="↕️" title="Inclinaison (β)" value={orientation.beta} unit="°" />
              <SensorCard icon="↔️" title="Rotation (γ)" value={orientation.gamma} unit="°" />
            </div>
          </div>

          {/* Gyroscope */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              🔄 Gyroscope
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <SensorCard icon="🔄" title="Rotation X" value={motion.x} unit="°/s" />
              <SensorCard icon="🔄" title="Rotation Y" value={motion.y} unit="°/s" />
              <SensorCard icon="🔄" title="Rotation Z" value={motion.z} unit="°/s" />
            </div>
          </div>

          {/* Accéléromètre */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              📊 Accéléromètre
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <SensorCard icon="➡️" title="Accél. X" value={accelerometer.x} unit="m/s²" />
              <SensorCard icon="⬆️" title="Accél. Y" value={accelerometer.y} unit="m/s²" />
              <SensorCard icon="⤴️" title="Accél. Z" value={accelerometer.z} unit="m/s²" />
            </div>
          </div>

          {/* Batterie & Réseau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Batterie */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                🔋 Batterie
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <SensorCard icon="🔋" title="Niveau" value={battery?.level} unit="%" available={!!battery} />
                <SensorCard icon="⚡" title="En charge" value={battery?.charging ? 'Oui' : 'Non'} available={!!battery} />
              </div>
            </div>

            {/* Réseau */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                📶 Réseau
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <SensorCard icon="📶" title="Type" value={network?.type?.toUpperCase()} available={!!network} />
                <SensorCard icon="⚡" title="RTT" value={network?.rtt} unit="ms" available={!!network} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            💡 Certains capteurs nécessitent des permissions ou ne sont disponibles que sur mobile
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
