const jsonObject: Record<string, unknown> = {
  type: "object",
  additionalProperties: true,
};

const response = (description: string, schema = jsonObject) => ({
  description,
  content: { "application/json": { schema } },
});

const errorResponses = {
  "400": response("Invalid request", {
    $ref: "#/components/schemas/Error",
  }),
  "404": response("Record not found", {
    $ref: "#/components/schemas/Error",
  }),
  "500": response("Internal server error", {
    $ref: "#/components/schemas/Error",
  }),
};

const idParameter = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});

const queryParameter = (
  name: string,
  schema: Record<string, unknown>,
  description?: string,
) => ({
  name,
  in: "query",
  required: false,
  ...(description ? { description } : {}),
  schema,
});

const listResponse = response("Paginated result", {
  $ref: "#/components/schemas/ListResponse",
});

const dataResponse = response("Result", {
  $ref: "#/components/schemas/DataResponse",
});

const historicalResponse = response("Archived historical snapshot", {
  $ref: "#/components/schemas/JsonObject",
});

const battingCategories = [
  "batting_most_runs",
  "batting_most_runs_innings",
  "batting_highest_strikerate",
  "batting_highest_strikerate_innings",
  "batting_highest_average",
  "batting_most_run100",
  "batting_most_run50",
  "batting_most_run6",
  "batting_most_run6_innings",
  "batting_most_run4",
  "batting_most_run4_innings",
] as const;

const bowlingCategories = [
  "bowling_top_wicket_takers",
  "bowling_best_economy_rates",
  "bowling_best_economy_rates_innings",
  "bowling_best_bowling_figures",
  "bowling_best_strike_rates",
  "bowling_best_strike_rates_innings",
  "bowling_best_averages",
  "bowling_most_runs_conceded_innings",
  "bowling_four_wickets",
  "bowling_five_wickets",
  "bowling_maidens",
] as const;

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Aiko IPL Data Platform API",
    version: "1.0.0",
    description:
      "Read-only IPL 2022 data API. Match analysis and snapshots are historical archives, not live data.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Health", description: "Service and database status" },
    { name: "Teams", description: "IPL team data" },
    { name: "Players", description: "Player profiles and season statistics" },
    { name: "Venues", description: "Venue data and aggregates" },
    { name: "Matches", description: "Archived match data and analysis" },
    { name: "Standings", description: "Season standings" },
    { name: "Stats", description: "Historical batting, bowling, team, and venue statistics" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check process health",
        responses: { "200": response("Service is running") },
      },
    },
    "/ready": {
      get: {
        tags: ["Health"],
        summary: "Check database readiness",
        responses: {
          "200": response("Database is reachable"),
          "503": response("Database is unavailable", {
            $ref: "#/components/schemas/Status",
          }),
        },
      },
    },
    "/openapi.json": {
      get: {
        summary: "Get OpenAPI specification",
        responses: {
          "200": response("OpenAPI document", {
            type: "object",
            required: ["openapi", "info", "paths"],
            properties: {
              openapi: { type: "string" },
              info: { type: "object" },
              paths: { type: "object" },
            },
          }),
        },
      },
    },
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List teams",
        responses: { "200": dataResponse, ...errorResponses },
      },
    },
    "/api/teams/{id}": {
      get: {
        tags: ["Teams"],
        summary: "Get team details",
        parameters: [idParameter("id", "Team ID")],
        responses: { "200": response("Team details"), ...errorResponses },
      },
    },
    "/api/teams/{id}/stats": {
      get: {
        tags: ["Teams"],
        summary: "Get historical team statistics",
        parameters: [
          idParameter("id", "Team ID"),
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/players": {
      get: {
        tags: ["Players"],
        summary: "List players",
        parameters: [
          queryParameter("q", { type: "string" }, "Case-insensitive name search"),
          queryParameter("page", { type: "integer", minimum: 1, default: 1 }),
          queryParameter("page_size", { type: "integer", minimum: 1, maximum: 100, default: 20 }),
        ],
        responses: { "200": listResponse, ...errorResponses },
      },
    },
    "/api/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Get player profile and career statistics",
        parameters: [idParameter("id", "Player ID")],
        responses: { "200": response("Player details"), ...errorResponses },
      },
    },
    "/api/players/{id}/season-stats": {
      get: {
        tags: ["Players"],
        summary: "Get historical player season statistics",
        parameters: [
          idParameter("id", "Player ID"),
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/venues": {
      get: {
        tags: ["Venues"],
        summary: "List venues",
        responses: { "200": dataResponse, ...errorResponses },
      },
    },
    "/api/venues/{id}": {
      get: {
        tags: ["Venues"],
        summary: "Get venue details and matches",
        parameters: [idParameter("id", "Venue ID")],
        responses: { "200": response("Venue details"), ...errorResponses },
      },
    },
    "/api/venues/{id}/stats": {
      get: {
        tags: ["Venues"],
        summary: "Get historical venue aggregates",
        parameters: [idParameter("id", "Venue ID")],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/matches": {
      get: {
        tags: ["Matches"],
        summary: "List archived matches",
        parameters: [
          queryParameter("page", { type: "integer", minimum: 1, default: 1 }),
          queryParameter("page_size", { type: "integer", minimum: 1, maximum: 100, default: 20 }),
          queryParameter("team_id", { type: "integer", minimum: 1 }),
          queryParameter("venue_id", { type: "integer", minimum: 1 }),
          queryParameter("order", { type: "string", enum: ["asc", "desc"], default: "asc" }),
        ],
        responses: { "200": listResponse, ...errorResponses },
      },
    },
    "/api/matches/latest": {
      get: {
        tags: ["Matches"],
        summary: "Get latest archived match",
        responses: { "200": response("Latest archived match"), ...errorResponses },
      },
    },
    "/api/matches/{id}": {
      get: {
        tags: ["Matches"],
        summary: "Get archived match details",
        parameters: [idParameter("id", "Match ID")],
        responses: { "200": response("Match details"), ...errorResponses },
      },
    },
    "/api/matches/{id}/scorecard": {
      get: {
        tags: ["Matches"],
        summary: "Get archived match scorecard",
        parameters: [idParameter("id", "Match ID")],
        responses: { "200": response("Scorecard"), ...errorResponses },
      },
    },
    "/api/matches/{id}/commentary": {
      get: {
        tags: ["Matches"],
        summary: "Get archived ball-by-ball commentary",
        parameters: [idParameter("id", "Match ID")],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/matches/{id}/wagon-wheel": {
      get: {
        tags: ["Matches"],
        summary: "Get archived wagon-wheel shots",
        description: "Shot data is a historical archive and does not represent live match state.",
        parameters: [
          idParameter("id", "Match ID"),
          queryParameter("inning", { type: "integer", minimum: 1 }),
          queryParameter("batter_id", { type: "integer", minimum: 1 }),
          queryParameter("bat_runs", { type: "integer", minimum: 0 }),
          queryParameter("zone", { type: "string" }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/matches/{id}/historical-snapshot": {
      get: {
        tags: ["Matches"],
        summary: "Get archived match snapshot",
        description:
          "Returns a stored historical snapshot. It is not live, polled, or refreshed.",
        parameters: [idParameter("id", "Match ID")],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/standings": {
      get: {
        tags: ["Standings"],
        summary: "Get season standings",
        responses: { "200": dataResponse, ...errorResponses },
      },
    },
    "/api/stats/batting": {
      get: {
        tags: ["Stats"],
        summary: "Get historical batting leaderboard",
        parameters: [
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
          queryParameter("category", { type: "string", enum: battingCategories }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/stats/bowling": {
      get: {
        tags: ["Stats"],
        summary: "Get historical bowling leaderboard",
        parameters: [
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
          queryParameter("category", { type: "string", enum: bowlingCategories }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/stats/teams": {
      get: {
        tags: ["Stats"],
        summary: "Get historical team performance",
        parameters: [
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/stats/summary": {
      get: {
        tags: ["Stats"],
        summary: "Get historical dataset summary",
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
    "/api/stats/venues": {
      get: {
        tags: ["Stats"],
        summary: "Get historical venue statistics",
        parameters: [
          queryParameter("scope", {
            type: "string",
            enum: ["league", "playoffs", "all"],
            default: "all",
          }),
        ],
        responses: { "200": historicalResponse, ...errorResponses },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
      Status: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string" } },
      },
      JsonObject: jsonObject,
      DataResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { type: "array", items: jsonObject },
        },
      },
      ListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: { type: "array", items: jsonObject },
          meta: {
            type: "object",
            required: ["page", "page_size", "total_items", "total_pages"],
            properties: {
              page: { type: "integer", minimum: 1 },
              page_size: { type: "integer", minimum: 1, maximum: 100 },
              total_items: { type: "integer", minimum: 0 },
              total_pages: { type: "integer", minimum: 0 },
            },
          },
        },
      },
    },
  },
} as const;
