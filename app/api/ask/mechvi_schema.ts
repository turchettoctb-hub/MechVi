export const MECHVI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["meta", "status", "vehicle_summary", "entitlements", "cards", "cta"],
  properties: {
    meta: {
      type: "object",
      additionalProperties: false,
      required: ["assistant", "version", "access_level", "locale", "intent", "disclaimer_level"],
      properties: {
        assistant: { type: "string" },
        version: { type: "string" },
        access_level: { type: "string", enum: ["FREE", "PAY_PER_REPORT", "SUBSCRIBER"] },
        locale: { type: "string" },
        intent: { type: "string", enum: ["buy", "own", "troubleshoot", "unknown"] },
        disclaimer_level: { type: "string", enum: ["none", "light", "strong"] }
      }
    },

    status: {
      type: "object",
      additionalProperties: false,
      required: ["needs_clarification", "clarifying_questions", "data_confidence"],
      properties: {
        needs_clarification: { type: "boolean" },
        clarifying_questions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "question", "type", "options"],
            properties: {
              id: { type: "string" },
              question: { type: "string" },
              type: { type: "string", enum: ["text", "select"] },
              options: { type: "array", items: { type: "string" } }
            }
          }
        },
        data_confidence: { type: "string", enum: ["low", "medium", "high"] }
      }
    },

    vehicle_summary: {
      type: "object",
      additionalProperties: false,
      required: ["label", "km", "notes"],
      properties: {
        label: { type: "string" },
        km: { type: ["number", "null"] },
        notes: { type: "array", items: { type: "string" } }
      }
    },

    entitlements: {
      type: "object",
      additionalProperties: false,
      required: ["garage", "alerts", "logbook", "personalised_plan"],
      properties: {
        garage: {
          type: "object",
          additionalProperties: false,
          required: ["can_save_vehicle", "free_slots_total", "free_slots_used"],
          properties: {
            can_save_vehicle: { type: "boolean" },
            free_slots_total: { type: "number" },
            free_slots_used: { type: "number" }
          }
        },
        alerts: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: { enabled: { type: "boolean" } }
        },
        logbook: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: { enabled: { type: "boolean" } }
        },
        personalised_plan: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: { enabled: { type: "boolean" } }
        }
      }
    },

    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "severity", "bullets", "table", "score", "actions"],
        properties: {
          type: {
            type: "string",
            enum: [
              "summary",
              "paywall_notice",
              "buy_fit",
              "risk_flags",
              "checklist",
              "plan",
              "habits",
              "costs",
              "workshop_tests",
              "next_steps",
              "upsell"
            ]
          },
          title: { type: "string" },
          severity: { type: "string", enum: ["info", "warning", "critical"] },

          bullets: { type: "array", items: { type: "string" } },

          table: {
            type: "object",
            additionalProperties: false,
            required: ["columns", "rows"],
            properties: {
              columns: { type: "array", items: { type: "string" } },
              rows: { type: "array", items: { type: "array", items: { type: "string" } } }
            }
          },

          score: {
            type: "object",
            additionalProperties: false,
            required: ["label", "value", "scale_max", "bands"],
            properties: {
              label: { type: "string" },
              value: { type: ["number", "null"] },
              scale_max: { type: "number" },
              bands: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name", "min", "max"],
                  properties: {
                    name: { type: "string" },
                    min: { type: "number" },
                    max: { type: "number" }
                  }
                }
              }
            }
          },

          actions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "label", "action_type", "payload"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                action_type: {
                  type: "string",
                  enum: ["link", "paywall", "subscribe", "logbook", "set_reminder", "save_vehicle"]
                },
                payload: { type: "object", additionalProperties: false, properties: {}, required: [] }
              }
            }
          }
        }
      }
    },

    cta: {
      type: "object",
      additionalProperties: false,
      required: ["label", "action_type", "payload"],
      properties: {
        label: { type: "string" },
        action_type: {
          type: "string",
          enum: ["paywall", "subscribe", "logbook", "set_reminder", "link", "save_vehicle"]
        },
        payload: { type: "object", additionalProperties: false, properties: {}, required: [] }
      }
    }
  }
} as const;

