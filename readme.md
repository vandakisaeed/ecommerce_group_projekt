Company: FitFusion Co.
Description: FitFusion Co. is a virtual personal training company offering AI-powered fitness and nutrition guidance.
Agents:

🧠 Orchestrator Agent – routes user queries to the right specialist

🏋️ Training Plan Agent – creates custom workout plans

🥗 Diet & Nutrition Agent – generates meal plans and uses tools

🛒 Equipment Agent – helps users buy or select gym equipment

🚨 Escalation Agent – handles complaints or frustration

🧱 Guardrail Agent – filters out irrelevant questions

User → Orchestrator Agent: "I want a 4-day workout plan"
Orchestrator → Training Plan Agent: routes query
Training Plan Agent → Tool (calorie_calculator): calls for calorie estimate
Tool → Training Plan Agent: returns daily calorie needs
Training Plan Agent → User: returns personalized plan and advice

sequenceDiagram
participant U as User
participant O as OrchestratorAgent
participant T as TrainingPlanAgent
participant C as CalorieCalculator (Tool)
participant API as NewsAPI (External API)

    U->>O: "Can you create me a 4-day workout plan?"
    O->>T: Route query (training related)
    T->>C: Calculate daily calorie burn
    C-->>T: Returns calorie estimate
    T->>API: Fetch motivational articles
    API-->>T: Returns top 3 fitness articles
    T-->>U: Sends full plan + nutrition tips + links

✅ This satisfies the “Diagram in Presentation / README” requirement.

---

## ✅ Summary Table

| Requirement             | Meaning                                      | Your Example                                  |
| ----------------------- | -------------------------------------------- | --------------------------------------------- |
| Tool Functions          | ≥ 2 callable tools (1 external API)          | `calorie_calculator`, `fetch_fitness_news`    |
| Fictitious Company      | Agents must belong to a company scenario     | FitFusion Co. (Personal Trainer Company)      |
| UML Diagram             | Visualize the interaction flow               | Mermaid diagram (User → Agents → Tools → API) |
| Diagram in Presentation | Include the UML in final presentation/README | Screenshot or Mermaid block                   |

---

Would you like me to generate a **ready-to-paste UML Mermaid diagram** for your “FitFusion” agent system (based on the exact agents and tools you have)?  
That way you can directly include it in your README and slides.

🏋️‍♂️ FitFusion AI — Multi-Agent Personal Trainer System

FitFusion AI is a multi-agent system that simulates a team of personal trainers designed to help users manage their fitness goals, diet plans, and equipment purchases — all powered by modular AI agents.

Built with TypeScript, OpenAI Agents SDK, and Node.js, the system demonstrates the use of:

Multiple specialized AI agents

External API integrations

Input guardrails and escalation handling

An orchestrator for intelligent routing

🚀 Overview

FitFusion AI is a fictitious company that provides a “digital personal training studio.”
The platform is composed of several AI agents, each with a specific domain expertise:

Agent Description
🧠 Training Plan Agent Designs personalized workout plans based on user goals (e.g., strength, endurance, fat loss).
🥗 Diet Agent Builds meal plans and fetches nutritional data from an external API (e.g., Nutrition API).
🛒 Equipment Agent Helps users find, compare, and purchase gym equipment; can query external shopping APIs.
📚 Course Management Agent Manages fitness course enrollment, schedules, and reminders.
🧱 Guardrail Agent (PillowGuard) Validates whether a query is relevant to FitFusion services.
🔥 Escalation Agent Handles frustration, complaints, or issues needing human attention.

All these are orchestrated by a central Orchestrator Agent that routes each user request intelligently.

⚙️ System Architecture
🧩 Architecture Flow

User query enters via API (e.g., “Create a muscle gain diet plan”).

The PillowGuard checks relevance (filters out irrelevant or unsafe queries).

If valid, the Orchestrator Agent determines which specialized agent should handle the query.

The selected agent executes its logic, possibly calling a Tool Function (like an API fetch).

The final response is returned to the user.

🧰 Tool Functions

Each agent can use tool functions to perform specific operations.
At least two tools perform external API requests, fulfilling project requirement FR015.

Tool Description Used By
get_nutrition_data(food: string) Fetches calorie and macronutrient data from an external Nutrition API Diet Agent
fetch_equipment_price(item: string) Fetches live price and availability info from a shopping API Equipment Agent
generate_workout_plan(level: string, days: number) Creates structured training schedules Training Agent
manage_course_enrollment(course: string) Registers or removes user from course database Course Agent

🧩 Example Agent Interaction Flow
sequenceDiagram
participant U as User
participant O as OrchestratorAgent
participant G as GuardrailAgent
participant D as DietAgent
participant N as NutritionAPI
participant E as EscalationAgent

    U->>O: "Create a high-protein meal plan"
    O->>G: Check if query is fitness-related
    G-->>O: ✅ Relevant
    O->>D: Forward query to DietAgent
    D->>N: Fetch nutritional info
    N-->>D: Return calorie/macros data
    D-->>O: Construct meal plan
    O-->>U: "Here’s your custom meal plan!"

🧪 Local Testing

You can test each agent individually without running the orchestrator.

Example Test (Training Agent)
npx ts-node src/test/test-training-agent.ts

Example API Test
curl -X POST http://localhost:4000/api/agent \
 -H "Content-Type: application/json" \
 -d '{"prompt":"Design a 3-day full-body workout plan","provider":"openai"}'

🧠 Technologies Used

Node.js / Express.js

TypeScript

OpenAI Agents SDK

Ollama / Gemini Integration (Configurable)

Zod (input validation)

Mongoose / MongoDB

Mermaid (for UML diagrams)

External APIs (Nutrition API, Shopping API)

🧱 Repository Structure
src/
├── agents/
│ ├── trainingAgent.ts
│ ├── dietAgent.ts
│ ├── equipmentAgent.ts
│ ├── courseAgent.ts
│ ├── escalationAgent.ts
│ └── guardrailAgent.ts
├── orchestrator/
│ └── orchestrator.ts
├── utils/
│ ├── apiHelpers.ts
│ └── calculateDiscount.ts
├── config/
│ └── config.ts
├── test/
│ ├── test-agent.ts
│ ├── test-training-agent.ts
│ └── test-diet-agent.ts
└── server.ts

🧩 Features

✅ Multi-Agent Architecture (5+ Agents)
✅ Automatic Query Routing
✅ Guardrails for Relevance and Safety
✅ Escalation Handling
✅ External API Integrations
✅ Tool-based Function Calling
✅ Modular Design for Extensibility

📊 UML Diagram (FR015)

Include this diagram in your README or presentation:

sequenceDiagram
participant User
participant Orchestrator
participant Guardrail
participant TrainingAgent
participant DietAgent
participant EquipmentAgent
participant CourseAgent
participant EscalationAgent
participant ExternalAPI

    User->>Orchestrator: Send query
    Orchestrator->>Guardrail: Validate relevance
    Guardrail-->>Orchestrator: OK or Reject
    Orchestrator->>TrainingAgent: If query about workouts
    Orchestrator->>DietAgent: If query about nutrition
    Orchestrator->>EquipmentAgent: If query about purchases
    Orchestrator->>CourseAgent: If query about courses
    Orchestrator->>EscalationAgent: If complaint/frustration
    DietAgent->>ExternalAPI: Fetch nutrition info
    EquipmentAgent->>ExternalAPI: Fetch product prices
    AnyAgent-->>Orchestrator: Return result
    Orchestrator-->>User: Final structured response

📦 Installation
git clone https://github.com/<your-repo>/fitfusion-ai
cd fitfusion-ai
npm install
npm run dev

Environment variables (in .env):

OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://localhost:27017/fitfusion
PORT=4000

🎓 Author

Saeed vandaki
AI Systems Developer | Full-Stack Engineer

📍 WBS Coding School — AI Project
# AI_private
