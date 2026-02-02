
export type NutriFlowFoodSummary = {
    id: string;
    name: string;
    brand: string;
    barcode: string;
};

export type NutriFlowServing = {
    description: string; // e.g. "1 cup"
    metric_amount: number;
    metric_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
};

export type NutriFlowFoodDetail = NutriFlowFoodSummary & {
    servings: NutriFlowServing[];
    best_serving: NutriFlowServing;
};

const BASE_URL = "http://localhost:8080/v1";
const API_KEY = process.env.NEXT_PUBLIC_NUTRIFLOW_API_KEY || "";

export class NutriFlowClient {
    static async searchFoods(query: string, page = 1, limit = 20): Promise<NutriFlowFoodSummary[]> {
        const res = await fetch(`${BASE_URL}/foods/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
            headers: { "X-API-Key": API_KEY }
        });
        if (!res.ok) throw new Error("Failed to search foods");
        return res.json();
    }

    static async getFoodDetails(id: string): Promise<NutriFlowFoodDetail> {
        const res = await fetch(`${BASE_URL}/foods/${id}`, {
            headers: { "X-API-Key": API_KEY }
        });
        if (!res.ok) throw new Error("Failed to get food details");
        return res.json();
    }

    static async getFoodByBarcode(barcode: string): Promise<NutriFlowFoodDetail> {
        const res = await fetch(`${BASE_URL}/foods/barcode/${barcode}`, {
            headers: { "X-API-Key": API_KEY }
        });
        if (!res.ok) throw new Error("Failed to get food by barcode");
        return res.json();
    }
}
