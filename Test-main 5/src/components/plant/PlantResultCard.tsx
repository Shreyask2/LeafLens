import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Droplet,
  Sun,
  Flower2,
  BookmarkPlus,
  Info,
  Check,
  ThermometerSun,
  Wind,
} from "lucide-react";

interface PlantResultCardProps {
  plantName?: string;
  scientificName?: string;
  careDifficulty?: "Easy" | "Moderate" | "Hard";
  waterNeeds?: "Low" | "Medium" | "High";
  lightRequirements?: "Low" | "Medium" | "High";
  soilType?: string;
  imageUrl?: string;
  growingConditions?: any;
  onViewCareGuide?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const PlantResultCard = ({
  plantName = "Monstera Deliciosa",
  scientificName = "Monstera deliciosa",
  careDifficulty = "Moderate",
  waterNeeds = "Medium",
  lightRequirements = "Medium",
  soilType = "Well-draining potting mix",
  imageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&h=600&fit=crop",
  growingConditions,
  onViewCareGuide = () => {},
  onSave = () => console.log("Save plant clicked"),
  isSaved = false,
}: PlantResultCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Low":
        return "text-blue-500";
      case "Medium":
        return "text-yellow-500";
      case "High":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-[800px] bg-white shadow-lg border-green-100 overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-green-800">
              {plantName}
            </CardTitle>
            <CardDescription className="text-gray-600 italic">
              {scientificName}
            </CardDescription>
          </div>
          <Badge
            className={`px-3 py-1 font-medium ${getDifficultyColor(careDifficulty)}`}
          >
            {careDifficulty} Care
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={plantName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
            <Droplet
              className={`h-5 w-5 mt-0.5 ${getIntensityColor(waterNeeds)}`}
            />
            <div>
              <p className="text-sm font-medium">Water Needs</p>
              <p className="text-sm text-gray-600">{waterNeeds}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
            <Sun
              className={`h-5 w-5 mt-0.5 ${getIntensityColor(lightRequirements)}`}
            />
            <div>
              <p className="text-sm font-medium">Light</p>
              <p className="text-sm text-gray-600">{lightRequirements}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
            <ThermometerSun className="h-5 w-5 mt-0.5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-sm text-gray-600">
                {growingConditions?.temperature?.current
                  ? `${Math.round(growingConditions.temperature.current)}°C`
                  : "18-27°C"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
            <Wind className="h-5 w-5 mt-0.5 text-teal-500" />
            <div>
              <p className="text-sm font-medium">Humidity</p>
              <p className="text-sm text-gray-600">
                {growingConditions?.humidity?.current
                  ? `${Math.round(growingConditions.humidity.current)}%`
                  : "40-60%"}
              </p>
            </div>
          </div>
        </div>

        {growingConditions && (
          <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
            <h3 className="font-medium mb-2">Growing Conditions</h3>
            <div className="space-y-2">
              {growingConditions.recommendations?.map(
                (rec: string, index: number) => (
                  <p key={index} className="text-sm text-gray-600">
                    {rec}
                  </p>
                ),
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4 border-t bg-green-50/20 p-6">
        <Button
          variant={isSaved ? "secondary" : "outline"}
          className={`flex-1 ${isSaved ? "bg-green-100 text-green-700 hover:bg-green-200" : "border-green-200 hover:bg-green-50"}`}
          onClick={onSave}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved to Collection
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save to Collection
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="flex-1 border-green-200 hover:bg-green-50"
          onClick={onViewCareGuide}
        >
          <Info className="h-4 w-4 mr-2" />
          View Care Guide
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlantResultCard;
