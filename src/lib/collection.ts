import { PlantIdentificationResponse } from "./plant-api";

export interface SavedPlant extends PlantIdentificationResponse {
  id: string;
  savedAt: string;
  imageUrl: string;
}

const STORAGE_KEY = "plantpal_saved_plants";

export function getSavedPlants(): SavedPlant[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function savePlant(
  plant: PlantIdentificationResponse & { imageUrl: string },
): void {
  // Convert image URL to base64 if it's a blob URL
  const saveImage = async () => {
    try {
      if (plant.imageUrl.startsWith("blob:")) {
        const response = await fetch(plant.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const savedPlants = getSavedPlants();
          const newPlant: SavedPlant = {
            ...plant,
            id: generateId(),
            savedAt: new Date().toISOString(),
            imageUrl: base64data,
          };
          savedPlants.push(newPlant);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlants));
        };
      } else {
        const savedPlants = getSavedPlants();
        const newPlant: SavedPlant = {
          ...plant,
          id: generateId(),
          savedAt: new Date().toISOString(),
        };
        savedPlants.push(newPlant);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlants));
      }
    } catch (error) {
      console.error("Error saving plant:", error);
    }
  };

  saveImage();
}

export function removePlant(id: string): void {
  const savedPlants = getSavedPlants();
  const filtered = savedPlants.filter((plant) => plant.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
