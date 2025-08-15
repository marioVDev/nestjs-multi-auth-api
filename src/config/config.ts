interface EnvironmentConfig {
  // Database
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;

  // API
  API_URL?: string;
  API_PORT?: string;

  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI?: string;
}

/**
 * Validates and parses environment variables.
 * Throws an error if any required variables are missing or invalid.
 * Provides default values for optional variables.
 */
class ConfigValidator {
  // List of required environment variables
  private static requiredEnvVars: (keyof EnvironmentConfig)[] = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  /**
   * Validates environment variables.
   * Throws an error if any required variables are missing or invalid.
   * Provides default values for optional variables.
   */
  public static validate(): EnvironmentConfig {
    const missingVars: string[] = [];

    this.requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVars.join(', ')}\n` +
          `Please check your .env file or environment configuration.`,
      );
    }

    return {
      DB_HOST: process.env.DB_HOST!,
      DB_PORT: process.env.DB_PORT!,
      DB_USERNAME: process.env.DB_USERNAME!,
      DB_PASSWORD: process.env.DB_PASSWORD!,
      DB_NAME: process.env.DB_NAME!,
      JWT_SECRET: process.env.JWT_SECRET!,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      API_URL: process.env.API_URL,
      API_PORT: process.env.API_PORT,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    };
  }

  /**
   * Parses and validates a port number.
   * Throws an error if the port is invalid.
   */
  static parsePort(portString: string, varName: string): number {
    const port = parseInt(portString, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(
        `Invalid ${varName}: "${portString}". Must be a valid port number (1-65535).`,
      );
    }
    return port;
  }
}

// Validate environment variables.
const env = ConfigValidator.validate();

// Create and export an environment variable configuration object.
export const config = {
  db: {
    host: env.DB_HOST,
    port: ConfigValidator.parsePort(env.DB_PORT, 'DB_PORT'),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN || '1d',
  },
  api: {
    url: env.API_URL || 'http://localhost:3000',
    port: ConfigValidator.parsePort(env.API_PORT || '3000', 'API_PORT'),
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID || 'default_client_id',
    clientSecret: env.GOOGLE_CLIENT_SECRET || 'default_client_secret',
    redirectUri:
      env.GOOGLE_REDIRECT_URI ||
      `http://localhost:3000/api/auth/google/callback`,
  },
};
