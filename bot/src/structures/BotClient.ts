import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";
import { readdirSync } from "fs";
import { join } from "path";

export interface Command {
  data: SlashCommandBuilder;
  cooldown?: number;
  permissions?: bigint[];
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

export class BotClient extends Client {
  commands: Collection<string, Command> = new Collection();
  cooldowns: Collection<string, Collection<string, number>> = new Collection();
  db: PrismaClient;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
      ],
    });

    this.db = new PrismaClient();
  }

  async loadCommands(): Promise<void> {
    const commandsPath = join(__dirname, "..", "commands");
    const categories = readdirSync(commandsPath);

    for (const category of categories) {
      const categoryPath = join(commandsPath, category);
      const files = readdirSync(categoryPath).filter(
        (f) => f.endsWith(".ts") || f.endsWith(".js")
      );

      for (const file of files) {
        const commandModule = await import(join(categoryPath, file));
        const command: Command = commandModule.default ?? commandModule;

        if (command.data && typeof command.execute === 'function') {
          this.commands.set(command.data.name, command);
          console.log(`[CMD] Loaded: ${command.data.name}`);
        }
      }
    }
  }

  async loadEvents(): Promise<void> {
    const eventsPath = join(__dirname, "..", "events");
    const files = readdirSync(eventsPath).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".js")
    );

    for (const file of files) {
      const eventModule = await import(join(eventsPath, file));
      const event = eventModule.default ?? eventModule;

      if (event.once) {
        this.once(event.name, (...args: unknown[]) => event.execute(...args, this));
      } else {
        this.on(event.name, (...args: unknown[]) => event.execute(...args, this));
      }

      console.log(`[EVT] Loaded: ${event.name}`);
    }
  }

  async deployCommands(): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
    const commands = this.commands.map((cmd) => cmd.data.toJSON());

    console.log(`[API] Deploying ${commands.length} slash commands...`);

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body: commands,
    });

    console.log("[API] Commands deployed successfully!");
  }

  async initReplicaSet(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;
    try {
      const client = new MongoClient(dbUrl.replace('?directConnection=true', '').replace('&directConnection=true', ''), { directConnection: true });
      await client.connect();
      const admin = client.db('admin');
      try {
        const status = await admin.command({ replSetGetStatus: 1 });
        console.log('[DB] Replica set already initialized:', status.set);
      } catch {
        console.log('[DB] Initializing replica set...');
        await admin.command({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] } });
        console.log('[DB] Replica set initialized');
        await new Promise(r => setTimeout(r, 3000));
      }
      await client.close();
    } catch (e) {
      console.log('[DB] Replica set init skipped:', (e as Error).message);
    }
  }

  async start(token: string): Promise<void> {
    await this.initReplicaSet();
    await this.db.$connect();
    console.log("[DB] Connected to database");

    await this.loadCommands();
    await this.loadEvents();

    await this.login(token);
  }
}
