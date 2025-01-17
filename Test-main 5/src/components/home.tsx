import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import {
  savePlant,
  getSavedPlants,
  removePlant,
  type SavedPlant,
} from "@/lib/collection";
import {
  identifyPlant,
  type PlantIdentificationResponse,
  assessGrowingConditions,
} from "@/lib/plant-api";
import ImageCapture from "./plant/ImageCapture";
import ProcessingOverlay from "./plant/ProcessingOverlay";
import PlantResultCard from "./plant/PlantResultCard";
import CareGuideModal from "./plant/CareGuideModal";
import { Button } from "./ui/button";
import { ArrowLeft, Trash2, Maximize2, Minimize2, Menu, X, Leaf } from 'lucide-react';
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface HomeProps {
  initialProcessing?: boolean;
  initialPlantData?: PlantIdentificationResponse & { imageUrl: string };
}

const PlantDetails = ({ plantData, onBack }) => {
  const [showCareGuide, setShowCareGuide] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [growingConditions, setGrowingConditions] = useState(null);

  useEffect(() => {
    const fetchGrowingConditions = async () => {
      try {
        const conditions = await assessGrowingConditions(plantData);
        setGrowingConditions(conditions);
      } catch (error) {
        console.error("Error fetching growing conditions:", error);
      }
    };
    fetchGrowingConditions();
  }, [plantData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-emerald-50"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Button>
      </div>

      <div className="flex justify-center">
        <PlantResultCard
          plantName={plantData.name}
          scientificName={plantData.scientificName}
          careDifficulty={plantData.careDifficulty}
          waterNeeds={plantData.waterNeeds}
          lightRequirements={plantData.lightRequirements}
          soilType={plantData.soilType}
          imageUrl={plantData.imageUrl}
          growingConditions={growingConditions}
          onSave={() => {
            if (!isSaved) {
              savePlant(plantData);
              setIsSaved(true);
            }
          }}
          isSaved={isSaved}
          onViewCareGuide={() => setShowCareGuide(true)}
        />
      </div>

      <CareGuideModal
        isOpen={showCareGuide}
        onClose={() => setShowCareGuide(false)}
        plantData={{
          name: plantData.name,
          scientificName: plantData.scientificName,
          description: plantData.description,
          careInstructions: plantData.careInstructions,
          growingConditions: growingConditions,
        }}
      />
    </div>
  );
};

const SavedPlantsView = ({
  savedPlants,
  onDelete,
  onPlantClick,
  isFullScreen = false,
}) => {
  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
      <ScrollArea className="h-full">
        <div
          className={`grid ${isFullScreen ? "grid-cols-3" : "grid-cols-1"} gap-4 p-4`}
        >
          {savedPlants.length === 0 ? (
            <div className="text-center col-span-full py-12 px-4">
              <Leaf className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-800 text-lg font-medium mb-2">
                No saved plants yet
              </p>
              <p className="text-emerald-600/70 text-sm">
                Your identified plants will appear here
              </p>
            </div>
          ) : (
            savedPlants.map((plant) => (
              <div
                key={plant.id}
                className="border border-emerald-100 rounded-xl p-4 space-y-3 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all cursor-pointer relative group"
                onClick={() => onPlantClick(plant)}
              >
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={plant.imageUrl || "/placeholder.svg"}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800">
                    {plant.name}
                  </h3>
                  <p className="text-sm text-emerald-600/70 italic">
                    {plant.scientificName}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-600/50">
                    {new Date(plant.savedAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(plant.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const SavedPlantsMenu = ({ savedPlants, onDelete, onPlantClick }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="fixed right-6 top-6 z-50 bg-white hover:bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100/30 h-14 w-14 rounded-full transition-all duration-200 hover:scale-105 flex items-center justify-center"
        >
          <div className="flex flex-col space-y-1.5 justify-center items-center w-6 h-6">
            <div className="w-5 h-0.5 bg-emerald-600 rounded-full"></div>
            <div className="w-5 h-0.5 bg-emerald-600 rounded-full"></div>
            <div className="w-5 h-0.5 bg-emerald-600 rounded-full"></div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isFullScreen ? "bottom" : "right"}
        className={`p-0 ${isFullScreen ? "h-screen w-screen" : "w-[400px]"}`}
      >
        <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-emerald-800">
              Plant Collection
            </h2>
          </div>
        </div>
        <SavedPlantsView
          savedPlants={savedPlants}
          onDelete={onDelete}
          onPlantClick={onPlantClick}
          isFullScreen={isFullScreen}
        />
      </SheetContent>
    </Sheet>
  );
};

const Home = ({
  initialProcessing = false,
  initialPlantData = undefined,
}: HomeProps) => {
  const [isProcessing, setIsProcessing] = useState(initialProcessing);
  const [progress, setProgress] = useState(0);
  const [plantData, setPlantData] = useState<
    (PlantIdentificationResponse & { imageUrl: string }) | undefined
  >(initialPlantData);
  const [error, setError] = useState<string | null>(null);
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>([]);

  useEffect(() => {
    setSavedPlants(getSavedPlants());

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = () => {
      setSavedPlants(getSavedPlants());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleImageCapture = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await identifyPlant(file);

      clearInterval(progressInterval);
      setProgress(100);

      setPlantData({
        ...result,
        imageUrl: URL.createObjectURL(file),
      });
    } catch (err) {
      setError("Failed to identify plant. Please try again.");
      console.error("Error processing plant:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearImage = () => {
    setPlantData(undefined);
    setError(null);
  };

  const handleDeletePlant = (id: string) => {
    removePlant(id);
    setSavedPlants(getSavedPlants());
  };

  const handleSavedPlantClick = (plant: SavedPlant) => {
    setPlantData(plant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <header className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="text-5xl font-bold text-emerald-800">LeafLens</h1>
          </div>
          <p className="text-xl text-emerald-600/80 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered plant identification companion. Snap or upload a
            photo to instantly identify plants and get personalized care
            instructions.
          </p>
        </header>

        <div className="space-y-8 mt-8">
          {!plantData && (
            <>
              <div className="flex justify-center">
                <ImageCapture
                  onImageCapture={handleImageCapture}
                  isProcessing={isProcessing}
                  onClear={handleClearImage}
                />
              </div>

              {error && (
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
                  {error}
                </div>
              )}

              {isProcessing && (
                <ProcessingOverlay
                  isVisible={isProcessing}
                  progress={progress}
                  message="Analyzing your plant..."
                />
              )}
            </>
          )}

          {plantData && !isProcessing && (
            <PlantDetails plantData={plantData} onBack={handleClearImage} />
          )}
        </div>
      </div>

      <SavedPlantsMenu
        savedPlants={savedPlants}
        onDelete={handleDeletePlant}
        onPlantClick={handleSavedPlantClick}
      />
    </div>
  );
};

export default Home;

