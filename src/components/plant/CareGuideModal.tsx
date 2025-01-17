import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Sun, Thermometer, Wind, Flower2 } from "lucide-react";

interface CareGuideModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  plantData?: {
    name: string;
    scientificName: string;
    description: string;
    careInstructions: {
      watering: string;
      sunlight: string;
      temperature: string;
      humidity: string;
      soil: string;
    };
  };
}

const defaultPlantData = {
  name: "Monstera Deliciosa",
  scientificName: "Monstera deliciosa",
  description:
    "The Swiss Cheese Plant is a popular tropical houseplant known for its large, glossy, perforated leaves.",
  careInstructions: {
    watering: "Water when top 2-3 inches of soil feels dry",
    sunlight: "Bright indirect light",
    temperature: "65-85°F (18-29°C)",
    humidity: "High humidity (60-80%)",
    soil: "Well-draining potting mix rich in organic matter",
  },
};

const CareGuideModal = ({
  isOpen = true,
  onClose = () => {},
  plantData = defaultPlantData,
}: CareGuideModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">
            {plantData.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 italic">
            {plantData.scientificName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="care">Care Guide</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    {plantData.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="care" className="mt-4 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <Droplet className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Watering</h3>
                      <p className="text-gray-700">
                        {plantData.careInstructions.watering}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Sun className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Sunlight</h3>
                      <p className="text-gray-700">
                        {plantData.careInstructions.sunlight}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Thermometer className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Temperature
                      </h3>
                      <p className="text-gray-700">
                        {plantData.careInstructions.temperature}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Wind className="w-6 h-6 text-teal-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Humidity</h3>
                      <p className="text-gray-700">
                        {plantData.careInstructions.humidity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Flower2 className="w-6 h-6 text-brown-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Soil</h3>
                      <p className="text-gray-700">
                        {plantData.careInstructions.soil}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CareGuideModal;
