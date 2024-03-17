import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";

async function generateImageFromCity(city_name) {
    try {
        const openai = new OpenAI({apiKey: OPENAI_API_KEY});
        const prompt = `An aerial view of the landscape at the city of ${city_name}. Focus on incorporating elements of the city, culture and country.`;
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
        });

        const imageUrl = response.data[0].url;
        return { imageUrl };
    } catch (error) {
        console.error('Error generating image from OpenAI:', error);
        return null;
    }
}

export { generateImageFromCity };