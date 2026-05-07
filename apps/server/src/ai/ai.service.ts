import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type AiComparisonProduct = {
    id: string;
    title: string;
    brand: string;
    price: number;
    stock: number;
};

type AiComparisonRow = {
    key: string;
    label: string;
    unit: string | null;
    values: Record<string, unknown>;
    bestProductIds: string[];
};

type GenerateComparisonSummaryInput = {
    categoryName: string;
    products: AiComparisonProduct[];
    rows: AiComparisonRow[];
    fallbackSummary: string;
};

type GeminiGenerateContentResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
};

type AiSummaryResult = {
    text: string;
    provider: string;
    isFallback: boolean;
    fallbackReason?: string;
};

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(private readonly configService: ConfigService) {}

    // Сервис изолирует внешнюю LLM-интеграцию: остальной код не знает деталей Gemini API.
    async generateProductComparisonSummary(input: GenerateComparisonSummaryInput): Promise<AiSummaryResult> {
        if (this.configService.get<string>("AI_PROVIDER") !== "gemini") {
            return this.fallback(input.fallbackSummary, "AI provider is not configured as gemini");
        }

        const apiKey = this.configService.get<string>("GEMINI_API_KEY");

        if (!apiKey) {
            return this.fallback(input.fallbackSummary, "GEMINI_API_KEY is missing");
        }

        try {
            const text = await this.generateWithGemini(apiKey, input);

            return {
                text,
                provider: "gemini",
                isFallback: false,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown Gemini error";
            this.logger.warn(`Gemini summary failed, fallback will be used: ${message}`);

            return this.fallback(input.fallbackSummary, message);
        }
    }

    private async generateWithGemini(apiKey: string, input: GenerateComparisonSummaryInput) {
        const model = this.configService.get<string>("GEMINI_MODEL") ?? "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: this.buildComparisonPrompt(input),
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.35,
                    maxOutputTokens: 900,
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                },
            }),
        });

        const payload = (await response.json()) as GeminiGenerateContentResponse & {
            error?: { message?: string };
        };

        if (!response.ok) {
            throw new Error(payload.error?.message ?? `Gemini API returned ${response.status}`);
        }

        const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

        if (!text) {
            throw new Error("Gemini API returned empty summary");
        }

        return text;
    }

    private buildComparisonPrompt(input: GenerateComparisonSummaryInput) {
        const products = input.products.map((product) => ({
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            stock: product.stock,
        }));
        const rows = input.rows.map((row) => ({
            key: row.key,
            label: row.label,
            unit: row.unit,
            values: row.values,
            bestProductIds: row.bestProductIds,
        }));

        return [
            "Ты эксперт интернет-магазина техники TechMarket.",
            "Нужно сравнить товары для покупателя на русском языке.",
            "Пиши кратко, нейтрально и практически: 2-4 абзаца без Markdown-таблиц.",
            "Не используй приветствия и не обрывай ответ на середине предложения.",
            "Не выдумывай характеристики, используй только переданные данные.",
            "Если данных мало, честно скажи, что вывод предварительный.",
            "",
            `Категория: ${input.categoryName}`,
            `Товары JSON: ${JSON.stringify(products)}`,
            `Сравнимые характеристики JSON: ${JSON.stringify(rows)}`,
            "",
            "Сформируй вывод: самый сбалансированный вариант, самый выгодный по цене и сильные стороны каждого товара.",
        ].join("\n");
    }

    private fallback(text: string, reason: string) {
        return {
            text,
            provider: "local-rules",
            isFallback: true,
            fallbackReason: reason,
        };
    }
}
