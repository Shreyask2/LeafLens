import axios from "axios";

const API_KEY = import.meta.env.VITE_PLANT_ID_API_KEY;
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_ENDPOINT = "https://api.plant.id/v2/identify";

export interface PlantIdentificationResponse {
  name: string;
  scientificName: string;
  careDifficulty: "Easy" | "Moderate" | "Hard";
  waterNeeds: "Low" | "Medium" | "High";
  lightRequirements: "Low" | "Medium" | "High";
  soilType: string;
  description: string;
  careInstructions: {
    watering: string;
    sunlight: string;
    temperature: string;
    humidity: string;
    soil: string;
  };
}

export interface GrowingConditions {
  temperature: {
    current: number;
    ideal: { min: number; max: number };
    status: "Ideal" | "Too Cold" | "Too Hot";
  };
  humidity: {
    current: number;
    ideal: { min: number; max: number };
    status: "Ideal" | "Too Dry" | "Too Humid";
  };
  light: {
    current: "Low" | "Medium" | "High";
    ideal: "Low" | "Medium" | "High";
    status: "Ideal" | "Too Low" | "Too High";
  };
  recommendations: string[];
  overallSuitability: "Excellent" | "Good" | "Fair" | "Poor";
}

export async function identifyPlant(
  imageFile: File,
): Promise<PlantIdentificationResponse> {
  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await axios.post(
      API_ENDPOINT,
      {
        api_key: API_KEY,
        images: [base64Image],
        plant_details: [
          "common_names",
          "url",
          "wiki_description",
          "taxonomy",
          "watering",
          "sunlight",
          "temperature",
          "soil",
          "growth_habit",
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.suggestions?.[0]) {
      throw new Error("No plant matches found");
    }

    const suggestion = response.data.suggestions[0];
    const plantDetails = suggestion.plant_details;

    // Extract care difficulty based on multiple factors
    const careDifficulty = determineDifficulty(suggestion);
    const waterNeeds = determineWaterNeeds(plantDetails?.watering?.text || "");
    const lightRequirements = determineLightNeeds(
      plantDetails?.sunlight?.text || "",
    );

    return {
      name: suggestion.plant_name || "Unknown Plant",
      scientificName:
        plantDetails?.scientific_name ||
        suggestion.plant_name ||
        "Unknown Species",
      description:
        plantDetails?.wiki_description?.value || "No description available",
      careDifficulty,
      waterNeeds,
      lightRequirements,
      soilType: plantDetails?.soil?.text || "Well-draining potting mix",
      careInstructions: {
        watering:
          plantDetails?.watering?.text ||
          determineCareInstructions(suggestion, "watering"),
        sunlight:
          plantDetails?.sunlight?.text ||
          determineCareInstructions(suggestion, "sunlight"),
        temperature: plantDetails?.temperature?.text || "65-80°F (18-27°C)",
        humidity: determineHumidity(suggestion),
        soil: plantDetails?.soil?.text || "Well-draining potting mix",
      },
    };
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw new Error("Failed to identify plant");
  }
}

export async function assessGrowingConditions(
  plant: PlantIdentificationResponse,
): Promise<GrowingConditions> {
  try {
    // Get local weather conditions
    const position = await getCurrentPosition();
    const weather = await getLocalWeather(
      position.coords.latitude,
      position.coords.longitude,
    );

    // Get current light level using device light sensor if available
    const lightLevel = await getCurrentLightLevel();

    // Parse ideal temperature range from plant requirements
    const idealTemp = parseTemperatureRange(plant.careInstructions.temperature);

    // Parse ideal humidity range from plant requirements
    const idealHumidity = parseHumidityRange(plant.careInstructions.humidity);

    // Determine current conditions status
    const tempStatus = assessTemperature(weather.temp, idealTemp);
    const humidityStatus = assessHumidity(weather.humidity, idealHumidity);
    const lightStatus = assessLight(lightLevel, plant.lightRequirements);

    // Generate recommendations based on conditions
    const recommendations = generateRecommendations(
      tempStatus,
      humidityStatus,
      lightStatus,
      plant,
    );

    // Calculate overall suitability
    const suitability = calculateSuitability(
      tempStatus,
      humidityStatus,
      lightStatus,
    );

    return {
      temperature: {
        current: weather.temp,
        ideal: idealTemp,
        status: tempStatus,
      },
      humidity: {
        current: weather.humidity,
        ideal: idealHumidity,
        status: humidityStatus,
      },
      light: {
        current: lightLevel,
        ideal: plant.lightRequirements,
        status: lightStatus,
      },
      recommendations,
      overallSuitability: suitability,
    };
  } catch (error) {
    console.error("Error assessing growing conditions:", error);
    throw new Error("Failed to assess growing conditions");
  }
}

// Helper functions
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getLocalWeather(lat: number, lon: number) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`,
    );
    return {
      temp: response.data.main.temp,
      humidity: response.data.main.humidity,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return { temp: 20, humidity: 50 }; // Default values if weather API fails
  }
}

async function getCurrentLightLevel(): Promise<"Low" | "Medium" | "High"> {
  try {
    if ("AmbientLightSensor" in window) {
      // @ts-ignore - AmbientLightSensor API is experimental
      const sensor = new AmbientLightSensor();
      const reading = await new Promise((resolve) => {
        sensor.onreading = () => resolve(sensor.illuminance);
        sensor.start();
      });
      sensor.stop();

      // Convert lux to light level
      if (reading < 50) return "Low";
      if (reading < 1000) return "Medium";
      return "High";
    }
    // Fallback: estimate based on time of day
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) return "Low";
    if (hour < 9 || hour > 15) return "Medium";
    return "High";
  } catch (error) {
    console.error("Error getting light level:", error);
    return "Medium"; // Default fallback
  }
}

function parseTemperatureRange(tempStr: string): { min: number; max: number } {
  try {
    const numbers = tempStr.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2) {
      return { min: numbers[0], max: numbers[1] };
    }
    return { min: 18, max: 27 }; // Default range in Celsius
  } catch (error) {
    return { min: 18, max: 27 }; // Default range in Celsius
  }
}

function parseHumidityRange(humidityStr: string): { min: number; max: number } {
  try {
    const numbers = humidityStr.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2) {
      return { min: numbers[0], max: numbers[1] };
    }
    return { min: 40, max: 60 }; // Default range
  } catch (error) {
    return { min: 40, max: 60 }; // Default range
  }
}

function assessTemperature(
  current: number,
  ideal: { min: number; max: number },
): "Ideal" | "Too Cold" | "Too Hot" {
  if (current < ideal.min) return "Too Cold";
  if (current > ideal.max) return "Too Hot";
  return "Ideal";
}

function assessHumidity(
  current: number,
  ideal: { min: number; max: number },
): "Ideal" | "Too Dry" | "Too Humid" {
  if (current < ideal.min) return "Too Dry";
  if (current > ideal.max) return "Too Humid";
  return "Ideal";
}

function assessLight(
  current: "Low" | "Medium" | "High",
  ideal: "Low" | "Medium" | "High",
): "Ideal" | "Too Low" | "Too High" {
  const levels = { Low: 0, Medium: 1, High: 2 };
  if (levels[current] < levels[ideal]) return "Too Low";
  if (levels[current] > levels[ideal]) return "Too High";
  return "Ideal";
}

function generateRecommendations(
  tempStatus: "Ideal" | "Too Cold" | "Too Hot",
  humidityStatus: "Ideal" | "Too Dry" | "Too Humid",
  lightStatus: "Ideal" | "Too Low" | "Too High",
  plant: PlantIdentificationResponse,
): string[] {
  const recommendations: string[] = [];

  // Temperature recommendations
  if (tempStatus === "Too Cold") {
    recommendations.push(
      "Consider moving the plant to a warmer location or using a heat mat",
    );
  } else if (tempStatus === "Too Hot") {
    recommendations.push(
      "Move the plant away from heat sources and consider increasing ventilation",
    );
  }

  // Humidity recommendations
  if (humidityStatus === "Too Dry") {
    recommendations.push(
      "Use a humidity tray or mist the plant regularly to increase moisture",
    );
  } else if (humidityStatus === "Too Humid") {
    recommendations.push(
      "Improve air circulation and consider using a dehumidifier",
    );
  }

  // Light recommendations
  if (lightStatus === "Too Low") {
    recommendations.push(
      "Move the plant closer to a light source or consider using grow lights",
    );
  } else if (lightStatus === "Too High") {
    recommendations.push(
      "Provide shade or move the plant further from direct sunlight",
    );
  }

  return recommendations;
}

function calculateSuitability(
  tempStatus: "Ideal" | "Too Cold" | "Too Hot",
  humidityStatus: "Ideal" | "Too Dry" | "Too Humid",
  lightStatus: "Ideal" | "Too Low" | "Too High",
): "Excellent" | "Good" | "Fair" | "Poor" {
  const idealCount = [
    tempStatus === "Ideal",
    humidityStatus === "Ideal",
    lightStatus === "Ideal",
  ].filter(Boolean).length;

  if (idealCount === 3) return "Excellent";
  if (idealCount === 2) return "Good";
  if (idealCount === 1) return "Fair";
  return "Poor";
}

function determineCareInstructions(suggestion: any, type: string): string {
  const plantDetails = suggestion.plant_details;
  if (!plantDetails) return getDefaultCareInstructions(type);

  switch (type) {
    case "watering":
      return plantDetails.watering?.text || "Water when top soil feels dry";
    case "sunlight":
      return plantDetails.sunlight?.text || "Moderate to bright indirect light";
    case "temperature":
      return plantDetails.temperature?.text || "65-80°F (18-27°C)";
    case "humidity":
      return plantDetails.humidity?.text || "Average to high humidity";
    case "soil":
      return plantDetails.soil?.text || "Well-draining potting mix";
    default:
      return getDefaultCareInstructions(type);
  }
}

function getDefaultCareInstructions(type: string): string {
  const defaults = {
    watering: "Water when top soil feels dry",
    sunlight: "Moderate to bright indirect light",
    temperature: "65-80°F (18-27°C)",
    humidity: "Average to high humidity",
    soil: "Well-draining potting mix",
  };
  return defaults[type] || "";
}

function determineDifficulty(suggestion: any): "Easy" | "Moderate" | "Hard" {
  const plantDetails = suggestion.plant_details;
  if (!plantDetails) return "Moderate";

  // Extract care requirements
  const wateringReq = plantDetails.watering?.text?.toLowerCase() || "";
  const lightReq = plantDetails.sunlight?.text?.toLowerCase() || "";
  const tempReq = plantDetails.temperature?.text?.toLowerCase() || "";
  const description = plantDetails.wiki_description?.value?.toLowerCase() || "";

  // Score different aspects
  let difficultyScore = 0;

  // Watering complexity
  if (wateringReq.includes("frequent") || wateringReq.includes("moist")) {
    difficultyScore += 2;
  } else if (wateringReq.includes("moderate")) {
    difficultyScore += 1;
  }

  // Light sensitivity
  if (lightReq.includes("specific") || lightReq.includes("bright direct")) {
    difficultyScore += 2;
  } else if (lightReq.includes("indirect")) {
    difficultyScore += 1;
  }

  // Temperature sensitivity
  if (tempReq.includes("specific") || tempReq.includes("strict")) {
    difficultyScore += 2;
  }

  // Additional factors from description
  if (description.includes("sensitive") || description.includes("difficult")) {
    difficultyScore += 2;
  }
  if (description.includes("hardy") || description.includes("easy")) {
    difficultyScore -= 1;
  }

  // Determine difficulty level based on total score
  if (difficultyScore > 4) return "Hard";
  if (difficultyScore > 2) return "Moderate";
  return "Easy";
}

function determineWaterNeeds(watering: string): "Low" | "Medium" | "High" {
  const text = watering.toLowerCase();

  // High water needs indicators
  if (
    text.includes("frequent") ||
    text.includes("moist") ||
    text.includes("daily") ||
    text.includes("wet") ||
    text.includes("high water")
  )
    return "High";

  // Low water needs indicators
  if (
    text.includes("sparingly") ||
    text.includes("drought") ||
    text.includes("dry") ||
    text.includes("minimal water") ||
    text.includes("low water") ||
    text.includes("well-draining")
  )
    return "Low";

  // Default to medium
  return "Medium";
}

function determineLightNeeds(light: string): "Low" | "Medium" | "High" {
  const text = light.toLowerCase();

  // High light indicators
  if (
    text.includes("full sun") ||
    text.includes("bright direct") ||
    text.includes("high light") ||
    text.includes("direct sunlight")
  )
    return "High";

  // Low light indicators
  if (
    text.includes("low light") ||
    text.includes("shade") ||
    text.includes("dark") ||
    text.includes("indirect")
  )
    return "Low";

  // Default to medium
  return "Medium";
}

function determineHumidity(suggestion: any): string {
  const plantDetails = suggestion.plant_details;
  if (!plantDetails?.humidity?.text) {
    const description =
      plantDetails?.wiki_description?.value?.toLowerCase() || "";

    if (
      description.includes("tropical") ||
      description.includes("rainforest")
    ) {
      return "High humidity (60-80%)";
    }
    if (description.includes("desert") || description.includes("arid")) {
      return "Low humidity (30-40%)";
    }
    return "Average humidity (40-60%)";
  }
  return plantDetails.humidity.text;
}
