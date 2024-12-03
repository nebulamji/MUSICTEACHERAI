import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

export class ConfigService {
  private static instance: ConfigService;
  public prisma: PrismaClient;
  public openai: OpenAI;

  private constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public async initializeMagentaModels() {
    try {
      // For now, we'll skip Magenta initialization until we properly set it up
      console.log("Magenta models initialization skipped");
      return true;
    } catch (error) {
      console.error("Failed to initialize Magenta models:", error);
      return false;
    }
  }
}

export const config = ConfigService.getInstance();
