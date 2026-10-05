import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Upload, CheckCircle2, ArrowRight, RefreshCw, 
  Sparkles, ShieldCheck, Box, AlertTriangle, Cpu, Battery, 
  Smartphone, Laptop, Image as ImageIcon, Eye, Plus, Trash2, MapPin, ExternalLink
} from 'lucide-react';
import { calculateFairValue, MATERIAL_PRICES, explainFairValue } from '../utils/fairValue';
import FairValueCard from '../components/FairValueCard';
import { generateLotId } from '../utils/lotId';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let classifierPromise;
let detectorPromise;

const loadClassifier = async () => {
  if (!classifierPromise) {
    await tf.setBackend('cpu');
    await tf.ready();
    classifierPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return classifierPromise;
};

const loadDetector = async () => {
  if (!detectorPromise) {
    await tf.setBackend('cpu');
    await tf.ready();
    detectorPromise = cocoSsd.load();
  }
  return detectorPromise;
};

const E_WASTE_LABELS = /computer|laptop|telephone|mobile|phone|smartphone|cellular|electronic|electronics|circuit|battery|television|tv|monitor|screen|display|printer|keyboard|mouse|camera|tablet|device|hardware|charger|cable|modem|radio|remote control|console|appliance|machine|equipment|scrap|junk|recycling|waste|metal/i;
const CLEARLY_NON_E_WASTE = /animal|bird|cat|dog|person|face|food|fruit|flower|plant|tree|landscape|scenery|beach|mountain|sky|vehicle|car|bicycle/i;
const DETECTED_E_WASTE = /cell phone|laptop|tv|keyboard|mouse|remote|computer|monitor/i;

// Demo sample images for 1-click testing during presentation
const SAMPLE_PRESETS = [
  {
    name: 'Smartphones (Batch of Mobiles)',
    type: 'smartphone',
    confidence: 94,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    defaultQty: 18,
    defaultWeight: 4.5,
    components: ['Lithium-ion Battery (850g)', 'Gold/Copper PCB (620g)', 'Aluminium frames', 'Display glass']
  },
  {
    name: 'Used Laptops / Notebooks',
    type: 'laptop',
    confidence: 96,
    img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    defaultQty: 3,
    defaultWeight: 6.2,
    components: ['Lithium Packs (1.4kg)', 'High-Grade Motherboard (1.8kg)', 'Aluminium Housing (2.2kg)']
  },
  {
    name: 'Circuit Boards (PCBs)',
    type: 'pcb',
    confidence: 91,
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    defaultQty: 8,
    defaultWeight: 5.0,
    components: ['Gold Flash Fingers', 'Copper traces', 'SMD Capacitors', 'Fiberglass base']
  },
  {
    name: 'Lithium & Lead Batteries',
    type: 'battery',
    confidence: 89,
    img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    defaultQty: 12,
    defaultWeight: 3.8,
    components: ['Lithium Cobalt Oxide', 'Graphite Anodes', 'Aluminium/Copper foils']
  }
];

export default function NewCollection() {
  const [step, setStep] = useState(1);
  
  // Image state
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [detectedData, setDetectedData] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Lot Details state
  const [material, setMaterial] = useState('smartphone');
  const [quantity, setQuantity] = useState(18);
  const [weight, setWeight] = useState(4.5);
  const [condition, setCondition] = useState('average');
  const [handlingSafety, setHandlingSafety] = useState(true);
  const [notes, setNotes] = useState('Collected from Anna Nagar residential drive. Sorted and separated.');

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  const { setLot, addLot, user } = useStore();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nextLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: `GPS: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
      };

      setLocation(nextLocation);
      setIsLocating(false);
      toast.success('Collection location captured.');
    }, () => {
      setIsLocating(false);
      toast.error('Location permission was denied. You can try again.');
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Handle file upload from user's device
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        toast.success('Photo selected! Click "Capture & Analyze" to check it.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Start live webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      toast.error('Unable to access camera. You can upload a photo or use a sample preset instead!');
    }
  };

  // Capture snapshot from webcam
  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      toast.success('Photo captured! Ready for AI analysis.');
    }
  };

  // Select sample preset
  const selectPreset = (preset) => {
    setImagePreview(preset.img);
    setMaterial(preset.type);
    setQuantity(preset.defaultQty);
    setWeight(preset.defaultWeight);
    setDetectedData({
      name: preset.name,
      confidence: preset.confidence,
      components: preset.components
    });
    toast.success(`Loaded sample: ${preset.name}`);
  };

  const classifyPhotoLocally = async (imageSource) => {
    const classifier = await loadClassifier();
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The selected image could not be loaded.'));
      image.src = imageSource;
    });
    const predictions = await classifier.classify(image, 10);
    const detector = await loadDetector();
    const detectedObjects = await detector.detect(image, 20);
    const eWastePrediction = predictions.find(prediction => E_WASTE_LABELS.test(prediction.className));
    const strongestPrediction = predictions[0];
    const detectedLabels = detectedObjects
      .filter(object => object.score >= 0.2)
      .map(object => object.class);
    const hasClearNonEWaste = predictions.some(prediction =>
      CLEARLY_NON_E_WASTE.test(prediction.className) && prediction.probability >= 0.25
    ) || detectedObjects.some(object => object.class === 'person' && object.score >= 0.35);
    const hasEwasteSignal = Boolean(
      detectedLabels.some(label => DETECTED_E_WASTE.test(label)) ||
      (eWastePrediction && eWastePrediction.probability >= 0.005)
    );

    return {
      isEWaste: hasEwasteSignal && !hasClearNonEWaste,
      confidence: eWastePrediction
        ? Math.max(1, Math.round(eWastePrediction.probability * 100))
        : Math.round((strongestPrediction?.probability || 0) * 100),
      label: detectedLabels.find(label => DETECTED_E_WASTE.test(label)) || eWastePrediction?.className || strongestPrediction?.className || 'Other object',
      labels: [...detectedLabels, ...predictions.map(prediction => prediction.className)].slice(0, 10)
    };
  };

  // Analyze uploaded pixels in the browser so no API key or image upload is required.
  const handleAnalyze = () => {
    // If no image selected, pick the default smartphone preset
    if (!imagePreview) {
      selectPreset(SAMPLE_PRESETS[0]);
      setStep(2);
      return;
    }

    const selectedImage = imagePreview;

    setIsAnalyzing(true);
    setAnalyzeProgress(15);

    const interval = setInterval(() => {
      setAnalyzeProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(async () => {
      clearInterval(interval);
      setIsAnalyzing(false);

      if (!SAMPLE_PRESETS.some(preset => preset.img === selectedImage)) {
        try {
          const result = await classifyPhotoLocally(selectedImage);
          if (!result.isEWaste) {
            setDetectedData(null);
            toast.error('It is not e-waste photo please update the photo', { duration: 5000 });
            return;
          }
          setDetectedData({
            name: result.label,
            confidence: result.confidence,
            components: result.labels
          });
          setStep(2);
          toast.success(`Local AI identified ${result.label} (${result.confidence}% confidence).`);
        } catch (error) {
          console.error('Local image analysis failed:', error);
          toast.error(error.message || 'Unable to analyze this photo. Please try again.');
        }
        return;
      }
      
      const currentPreset = SAMPLE_PRESETS.find(p => p.type === material) || SAMPLE_PRESETS[0];
      setDetectedData({
        name: currentPreset.name,
        confidence: currentPreset.confidence,
        components: currentPreset.components
      });

      toast.success(`AI Identified: ${currentPreset.name} (${currentPreset.confidence}% confidence)`, {
        icon: '🧠',
        duration: 3500
      });
      setStep(2);
    }, 1400);
  };

  // Calculate current fair value
  const currentFairValue = calculateFairValue(material, quantity, condition);

  // Handle final lot approval
  const handleApproveLot = () => {
    const lotId = generateLotId();
    const materialInfo = MATERIAL_PRICES[material] || MATERIAL_PRICES['smartphone'];
    
    const newLot = {
      id: lotId,
      status: 'Collected',
      fairValue: currentFairValue,
      materials: [
        { 
          type: material, 
          name: materialInfo.name, 
          quantity: Number(quantity), 
          weight: Number(weight), 
          condition, 
          unit: materialInfo.unit 
        }
      ],
      photo: imagePreview || SAMPLE_PRESETS[0].img,
      location,
      notes,
      handlingSafety,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      collectorName: user?.name || 'Ravi Kumar (COL-1045)',
      isVerified: true
    };

    // Save to global store
    addLot(newLot);
    setLot(newLot);

    toast.success(`🎉 Lot ${lotId} approved & created! Ready for recycler matching.`, {
      duration: 4000
    });

    // Navigate to find recyclers
    navigate('/collector/recyclers');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Progress Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-2">
          <span className={step >= 1 ? 'text-primary' : ''}>1. Photo & AI Scan</span>
          <span className={step >= 2 ? 'text-primary' : ''}>2. Collector Verification</span>
          <span className={step >= 3 ? 'text-primary' : ''}>3. Fair Value & Create Lot</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                step >= i ? 'bg-primary' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* STEP 1: SCAN & UPLOAD PHOTO */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-800">Scan & Classify E-Waste</h2>
            <p className="text-gray-500 text-sm mt-1">
              Upload a photo from your phone/PC, capture using camera, or pick a sample preset.
            </p>
          </div>

          {/* Photo Scan Box */}
          <div className="relative aspect-video sm:aspect-square max-h-96 mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center group shadow-inner">
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                <button 
                  onClick={captureCameraPhoto} 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Snap Photo
                </button>
              </div>
            ) : imagePreview ? (
              /* Image Preview */
              <div className="relative w-full h-full">
                <img src={imagePreview} alt="E-waste Preview" className="w-full h-full object-cover" />
                
                {/* AI Laser Scan Overlay when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <div className="w-full h-1 bg-green-400 absolute top-1/2 shadow-[0_0_15px_#22c55e] animate-bounce" />
                    <div className="bg-gray-900/80 p-4 rounded-xl text-center space-y-2 max-w-xs mx-auto border border-green-500/50">
                      <Sparkles className="w-8 h-8 text-green-400 animate-spin mx-auto" />
                      <p className="font-bold text-sm text-green-400">AI Neural Engine Analyzing...</p>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${analyzeProgress}%` }} />
                      </div>
                      <p className="text-xs text-gray-300">Extracting material composition & purity</p>
                    </div>
                  </div>
                )}

                {/* Change photo button */}
                {!isAnalyzing && (
                  <button 
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow backdrop-blur"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake / Change
                  </button>
                )}
              </div>
            ) : (
              /* Empty Placeholder with Drag & Click options */
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 cursor-pointer hover:bg-green-50/50 transition-colors"
              >
                <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-800 text-base">Click to Upload Photo</p>
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, JPEG from camera or gallery</p>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Upload and Camera Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-primary font-bold text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-green-50/30 transition-all"
            >
              <Upload className="w-4 h-4 text-primary" /> Upload From Device
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-primary font-bold text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-green-50/30 transition-all"
            >
              <Camera className="w-4 h-4 text-primary" /> Use Web Camera
            </button>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Collection GPS location</p>
                  <p className="text-xs text-blue-700">
                    {location?.address || 'Capture your current location for the lot passport.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={getCurrentLocation} disabled={isLocating} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60">
                {isLocating ? 'Locating...' : location ? 'Refresh GPS' : 'Capture GPS'}
              </button>
            </div>
            {location && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                Open in Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Sample Preset Buttons for Quick Demo Testing */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Or pick a sample preset for demo:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center gap-2 ${
                    material === p.type && imagePreview === p.img
                      ? 'border-primary bg-green-50 font-bold text-primary ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Button */}
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="w-full btn-large btn-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> AI Analyzing E-Waste...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Capture & Analyze with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2: COLLECTOR VERIFICATION & CUSTOMIZATION */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Verify Material Details</h2>
              <p className="text-gray-500 text-sm">Review AI identification and confirm quantities.</p>
            </div>
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Selected" 
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-xs" 
              />
            )}
          </div>

          {/* AI Detection Result Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-green-700 font-bold uppercase tracking-wider">AI Classification Confidence</p>
                  <p className="text-base font-black text-gray-800">
                    {detectedData?.name || 'Smartphones & Mobile Devices'} ({detectedData?.confidence || 94}%)
                  </p>
                </div>
              </div>
              <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                AI Verified
              </span>
            </div>

            {detectedData?.components && (
              <div className="mt-3 pt-3 border-t border-green-200/60">
                <p className="text-xs font-bold text-gray-600 mb-1">Recoverable Materials Identified:</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedData.components.map((c, i) => (
                    <span key={i} className="text-[11px] bg-white text-green-800 px-2 py-0.5 rounded-md font-medium border border-green-200">
                      • {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Material Category Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm Material Category (or correct if needed):
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {Object.entries(MATERIAL_PRICES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.icon} {val.name} ({val.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Weight Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Quantity ({MATERIAL_PRICES[material]?.unit || 'pcs'})
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-l-xl font-bold text-xl text-gray-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full h-12 text-center border-y border-gray-300 text-xl font-black text-gray-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-r-xl font-bold text-xl text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-xl font-black text-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Item Condition */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Condition of Material</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: 'working', label: 'Working (+35% Value)', desc: 'Powers on / reusable' },
                { key: 'average', label: 'Average (Standard)', desc: 'Intact components' },
                { key: 'broken', label: 'Broken (-25% Scrap)', desc: 'Dismantled / cracked' }
              ].map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCondition(c.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    condition === c.key
                      ? 'bg-primary text-white border-primary shadow-sm font-bold'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold">{c.label.split(' ')[0]}</p>
                  <p className={`text-[11px] mt-0.5 ${condition === c.key ? 'text-green-100' : 'text-gray-500'}`}>
                    {c.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Handling Checklist */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/80 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={handlingSafety}
                onChange={(e) => setHandlingSafety(e.target.checked)}
                className="w-5 h-5 rounded text-primary accent-primary"
              />
              <span className="text-xs font-bold text-amber-900">
                🛡️ Handled safely according to CPCB hazardous e-waste handling guidelines
              </span>
            </label>
          </div>

          {/* Collector Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Collector's Lot Description / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm font-medium"
              placeholder="e.g. Mixed brand smartphones, batteries safely segregated"
            />
          </div>

          {/* Nav buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 btn-large btn-primary flex items-center justify-center gap-2"
            >
              Calculate Fair Value & Preview Lot <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FAIR VALUE ESTIMATE & LOT APPROVAL */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Digital Material Lot Review</h2>
            <p className="text-gray-500 text-sm">
              Your lot is verified. Confirm the Fair Value and create the official lot passport.
            </p>
          </div>

          {/* Lot Summary Card */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Lot material" 
                    className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-xs" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                    {MATERIAL_PRICES[material]?.icon || '📦'}
                  </div>
                )}
                <div>
                  <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Ready for Formal Recycling
                  </span>
                  <h3 className="font-bold text-lg text-gray-800 mt-0.5">
                    {MATERIAL_PRICES[material]?.name || 'Smartphones'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Quantity: <span className="font-bold text-gray-700">{quantity} {MATERIAL_PRICES[material]?.unit}</span> • Weight: <span className="font-bold text-gray-700">{weight} kg</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-500">Condition</span>
                <p className="text-sm font-black capitalize text-primary">{condition}</p>
              </div>
            </div>

            {notes && (
              <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="font-bold">Collector Note:</span> {notes}
              </p>
            )}
          </div>

          {/* Fair Value Engine Card */}
          <FairValueCard 
            fairValue={currentFairValue} 
            materialType={MATERIAL_PRICES[material]?.name || material} 
            condition={condition} 
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-3 px-5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleApproveLot}
              className="flex-1 btn-large bg-primary hover:bg-green-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" /> Approve Lot & Match Recyclers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
