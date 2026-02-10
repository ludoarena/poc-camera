import { useEffect, useRef, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

export const useBodyEffects = (videoRef, effect, isStreaming) => {
  const canvasRef = useRef(null);
  const [net, setNet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const animationIdRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Charger le modèle BodyPix
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      if (effect === 'none' || net) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Chargement BodyPix...');
        const loadedNet = await bodyPix.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2
        });
        
        if (isMounted) {
          console.log('BodyPix chargé avec succès');
          setNet(loadedNet);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erreur chargement BodyPix:', err);
        if (isMounted) {
          setError('Erreur de chargement. Vérifiez votre connexion.');
          setIsLoading(false);
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [effect, net]);

  // Appliquer les effets
  useEffect(() => {
    // Arrêter l'animation précédente
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    if (!videoRef.current || !canvasRef.current || !isStreaming || effect === 'none' || !net) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Configurer le canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const processFrame = async () => {
      if (!video.videoWidth || !video.videoHeight || isProcessingRef.current) {
        animationIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      isProcessingRef.current = true;

      try {
        // Mise à jour de la taille du canvas si nécessaire
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Segmentation
        const segmentation = await net.segmentPerson(video, {
          flipHorizontal: false,
          internalResolution: 'medium',
          segmentationThreshold: 0.6
        });

        // Dessiner la vidéo originale
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Récupérer les pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const mask = segmentation.data;

        // Appliquer l'effet uniquement sur la personne
        for (let i = 0; i < mask.length; i++) {
          if (mask[i] === 1) { // 1 = personne, 0 = fond
            const pixelIndex = i * 4;
            const r = pixels[pixelIndex];
            const g = pixels[pixelIndex + 1];
            const b = pixels[pixelIndex + 2];

            switch (effect) {
              case 'blackout':
                pixels[pixelIndex] = 0;
                pixels[pixelIndex + 1] = 0;
                pixels[pixelIndex + 2] = 0;
                break;

              case 'grayscale_person':
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                pixels[pixelIndex] = gray;
                pixels[pixelIndex + 1] = gray;
                pixels[pixelIndex + 2] = gray;
                break;

              case 'sepia_person':
                pixels[pixelIndex] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                pixels[pixelIndex + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                pixels[pixelIndex + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                break;

              case 'negative_person':
                pixels[pixelIndex] = 255 - r;
                pixels[pixelIndex + 1] = 255 - g;
                pixels[pixelIndex + 2] = 255 - b;
                break;

              case 'ghost':
                const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
                pixels[pixelIndex] = grayVal;
                pixels[pixelIndex + 1] = grayVal;
                pixels[pixelIndex + 2] = grayVal;
                pixels[pixelIndex + 3] = 150;
                break;

              case 'red_tint':
                pixels[pixelIndex] = Math.min(255, r * 1.5);
                pixels[pixelIndex + 1] = g * 0.5;
                pixels[pixelIndex + 2] = b * 0.5;
                break;

              case 'blue_tint':
                pixels[pixelIndex] = r * 0.5;
                pixels[pixelIndex + 1] = g * 0.7;
                pixels[pixelIndex + 2] = Math.min(255, b * 1.5);
                break;

              case 'green_tint':
                pixels[pixelIndex] = r * 0.5;
                pixels[pixelIndex + 1] = Math.min(255, g * 1.5);
                pixels[pixelIndex + 2] = b * 0.5;
                break;

              case 'blur_person':
                pixels[pixelIndex + 3] = 180;
                break;

              case 'pixelated':
                const blockSize = 8;
                const x = i % canvas.width;
                const y = Math.floor(i / canvas.width);
                const blockX = Math.floor(x / blockSize) * blockSize;
                const blockY = Math.floor(y / blockSize) * blockSize;
                const blockIdx = (blockY * canvas.width + blockX) * 4;
                if (blockIdx < pixels.length) {
                  pixels[pixelIndex] = pixels[blockIdx];
                  pixels[pixelIndex + 1] = pixels[blockIdx + 1];
                  pixels[pixelIndex + 2] = pixels[blockIdx + 2];
                }
                break;

              case 'invisible':
                pixels[pixelIndex + 3] = 0;
                break;

              case 'matrix_code':
                pixels[pixelIndex] = r * 0.2;
                pixels[pixelIndex + 1] = Math.min(255, g * 2);
                pixels[pixelIndex + 2] = b * 0.2;
                break;

              case 'fire':
                pixels[pixelIndex] = Math.min(255, r * 1.5 + 50);
                pixels[pixelIndex + 1] = g * 0.7;
                pixels[pixelIndex + 2] = b * 0.2;
                break;

              case 'water':
                pixels[pixelIndex] = r * 0.3;
                pixels[pixelIndex + 1] = Math.min(255, g * 1.2);
                pixels[pixelIndex + 2] = Math.min(255, b * 1.5);
                break;

              case 'glitch':
                if (Math.random() > 0.98) {
                  pixels[pixelIndex] = Math.random() * 255;
                  pixels[pixelIndex + 1] = Math.random() * 255;
                  pixels[pixelIndex + 2] = Math.random() * 255;
                }
                break;

              case 'clown_texture':
                const noise = Math.random() * 50 - 25;
                pixels[pixelIndex] = Math.max(0, Math.min(255, r + noise));
                pixels[pixelIndex + 1] = Math.max(0, Math.min(255, g + noise));
                pixels[pixelIndex + 2] = Math.max(0, Math.min(255, b + noise));
                break;

              case 'edge_glow':
                // Contour sera dessiné après
                break;

              default:
                break;
            }
          }
        }

        // Appliquer les pixels modifiés
        ctx.putImageData(imageData, 0, 0);

        // Effet contour lumineux
        if (effect === 'edge_glow') {
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'cyan';
          
          // Parcourir le masque pour trouver les bords
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const i = y * canvas.width + x;
              if (mask[i] === 1) {
                // Vérifier si c'est un bord
                const isEdge = mask[i - 1] === 0 || mask[i + 1] === 0 || 
                               mask[i - canvas.width] === 0 || mask[i + canvas.width] === 0;
                if (isEdge) {
                  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                  ctx.fillRect(x, y, 1, 1);
                }
              }
            }
          }
        }

      } catch (err) {
        console.error('Erreur traitement frame:', err);
      }

      isProcessingRef.current = false;
      animationIdRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [videoRef, effect, isStreaming, net]);

  return { canvasRef, isLoading, error };
};
