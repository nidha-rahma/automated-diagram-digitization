# Automated Diagram Digitization

Automated Diagram Digitization is a web-based platform that leverages Generative AI to convert static flowchart images and textual descriptions into interactive, editable, and standardized digital diagrams.

## Features
- **Image to Diagram:** Upload an image of a hand-drawn or static flowchart, and the AI will recognize the nodes, shapes, text, and connections to map them into a structured digital layout.
- **Text to Diagram:** Write a natural language prompt or provide a structural algorithm, and the system will automatically generate a corresponding flowchart architecture.
- **Interactive Editing:** Rendered diagrams are fully interactive. Users can drag nodes, edit text, change colors, align text formatting, and modify edge connections using an intuitive canvas interface powered by ReactFlow.
- **Export Options:** Export your finalized, digitized diagrams into high-quality images.

## Tech Stack
**Frontend:**
- React 19 & Vite
- ReactFlow & Dagre (Diagram visualization and layout mapping)
- Web-Standard CSS

**Backend:**
- Python 3 & FastAPI (High-performance API Gateway)
- SQLAlchemy (Async Object-Relational Mapping)
- Pydantic (Data validation and structured serialization)

**Database:**
- PostgreSQL

**AI Integration:**
- Google Gemini API (Flash model for multimodal image analysis and rapid text-to-JSON structure generation)

## Project Structure
```text
automated-diagram-digitization/
│
├── frontend/             # Single Page Application
│   ├── src/              # UI components, ReactFlow layouts, Custom Nodes
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite bundler configuration
│
└── backend/              # RESTful API Server
    ├── main.py           # Core routing, CORS, and Gemini integration
    ├── database.py       # Configuration for async SQLAlchemy connection
    ├── models.py         # SQLAlchemy definitions (e.g., Flowchart model)
    ├── schemas.py        # Pydantic schemas enforcing strict JSON structures
    ├── prompts.py        # System instructions governing Gemini AI behavior
    └── requirements.txt  # Python package requirements
```

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.9+)
- Active PostgreSQL Database
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd automated-diagram-digitization
```

### 2. Set Up Virtual Environment

Navigate to the `backend` directory and provision an isolated Python environment:
```bash
cd backend
python -m venv venv
```
Activate the newly created virtual environment:
- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

### 3. Install Dependencies

**Backend:**
While inside the `backend` directory with the virtual environment activated, install the required packages:
```bash
pip install -r requirements.txt
```

**Frontend:**
Open a separate terminal window, navigate to the `frontend` directory, and install the required Node modules:
```bash
cd frontend
npm install
```

### 4. Configure Environment Variables
Inside the `backend` directory, create a `.env` file to securely store your credentials and database URI:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
```

## Architecture

The platform operates on a robust three-tier architecture:
1. **Presentation Tier (React Client):** Handles user interactions, manages the state of the diagram canvas via ReactFlow, applies real-time formatting edits, and submits user images/prompts to the server.
2. **Application Tier (FastAPI Server):** Serves as an orchestration layer. It receives data payload structures, conducts data validation utilizing Pydantic, queries the external Gemini API to formulate node/edge configurations, and interfaces with the ORM.
3. **Data Tier (PostgreSQL Database):** Handles persistent CRUD operations, storing structural definitions (`flow_data`) securely using an asynchronous driver for non-blocking transaction processing.

## API Endpoints
The backend exposes the following primary RESTful endpoints:
- `POST /analyze` - Processes `multipart/form-data` uploads of images and queries the visual-language model to map structural elements.
- `POST /analyze/algorithm` - Uses a text prompt to build a semantic structured flowchart.
- `POST /flowcharts` - Saves a flowchart configuration persistently into the database.
- `GET /flowcharts/{flowchart_id}` - Retrieves a specific flowchart blueprint using its UUID.
- `PUT /flowcharts/{flowchart_id}` - Overwrites an existing specific diagram's properties.

## Team
- Nema Fathima
- Nidha Rahma
- Rithuparna JB
- Rose Maria
- Sana Noushad

## AI Tools Used
- **Google Gemini API (Flash Model):** Leveraged for its high-speed multimodal capabilities. The model parses images of logical sequences directly into the strict JSON formats (`nodes` and `edges`) necessary to seed the frontend ReactFlow framework, bypassing classical manual visual digitizing.

## License
This project is licensed under the MIT License.

## Diagrams

### 1. 3-Tier System Architecture
```mermaid
flowchart TD
    %% Styling
    classDef presentation fill:#e0f7fa,stroke:#00acc1,stroke-width:2px;
    classDef application fill:#ede7f6,stroke:#5e35b1,stroke-width:2px;
    classDef data fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef external fill:#fff3e0,stroke:#fb8c00,stroke-width:2px,stroke-dasharray: 5 5;
    classDef user node fill:#eceff1,stroke:#607d8b,stroke-width:2px;

    User([End User / Client]):::user

    %% Presentation Tier
    subgraph Tier1[1. Presentation Tier]
        direction TB
        WebApp[React Web Application\n Vite, React Router]:::presentation
        DiagramEditor[Diagram Interface\n ReactFlow, Dagre]:::presentation
        WebApp --> DiagramEditor
    end

    %% Application Tier
    subgraph Tier2[2. Application Tier]
        direction TB
        API[FastAPI Gateway]:::application
        Validation[Data Validation\n Pydantic]:::application
        BusinessLogic[Controllers & Logic \n Image/Text Processing]:::application
        ORM[Data Access Layer \n SQLAlchemy Async]:::application
        
        API --> Validation
        Validation --> BusinessLogic
        BusinessLogic --> ORM
    end

    %% External AI Service
    subgraph Ext[External Services]
        LLM[Google Gemini API \n Multimodal AI]:::external
    end

    %% Data Tier
    subgraph Tier3[3. Data Tier]
        direction TB
        DB[(PostgreSQL Database)]:::data
    end

    %% Data Flow
    User <-->|HTTP/HTTPS Requests| WebApp
    WebApp <-->|REST API JSON| API
    BusinessLogic <-->|Generative Prompting| LLM
    ORM <-->|Async TCP/IP SQL| DB
```

### 2. Image/Text Analysis Data Flow Diagram (DFD)
```mermaid
sequenceDiagram
    participant User as User (React Client)
    participant FastAPI as Backend (FastAPI)
    participant Gemini as Gemini API (AI Model)
    participant DB as PostgreSQL (Database)

    User->>FastAPI: POST /analyze (Image) OR /analyze/algorithm (Text)
    activate FastAPI
    FastAPI->>FastAPI: Validate Input & Prepare Prompt
    FastAPI->>Gemini: Send Image/Text + System Prompt
    activate Gemini
    Gemini-->>FastAPI: Return Raw JSON String (Nodes & Edges)
    deactivate Gemini
    FastAPI->>FastAPI: Parse JSON & Apply Constraints
    FastAPI-->>User: Return Structured Flowchart Data
    deactivate FastAPI
    
    User->>User: Render Interactive Diagram (ReactFlow)
    
    User->>FastAPI: POST /flowcharts (Save Diagram)
    activate FastAPI
    FastAPI->>DB: INSERT INTO flowcharts (UUID, Title, Flow_Data)
    activate DB
    DB-->>FastAPI: Confirm Transaction
    deactivate DB
    FastAPI-->>User: Return 200 OK
    deactivate FastAPI
```

### 3. Database Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    %% The system relies on a single relational table.
    %% The complete structural blueprint of each diagram is stored within the JSONB payload.
    FLOWCHART {
        UUID id PK "Primary Key (Auto-generated UUID)"
        String title "Default: 'Untitled Flowchart'"
        JSONB flow_data "Stores complete state of nodes and edges"
        DateTime created_at "Timestamp with Timezone"
        DateTime updated_at "Timestamp with Timezone (Auto-updates)"
    }
```

### 4. System Use Case Diagram
```mermaid
graph LR
    %% Actor
    User[👤 User]

    %% System Boundary
    subgraph System[Automated Diagram Digitization System]
        direction TB

        %% -------- INPUT --------
        UC1((Convert Image <br>to Flowchart))
        UC2((Generate from <br>Text Prompt))
        UC3((Import JSON))
        UC0((Create Blank <br>Canvas))

        UC1a((Process Image <br>via AI))
        UC2a((Parse Text <br>via NLP))
        UC3a((Decode JSON <br>Data))

        %% -------- EDITING --------
        UC4((Edit Diagram))
        UC4a((Modify <br>Nodes / Edges))
        UC4b((Format <br>Text & Colors))

        UC5((Apply <br>Auto-Layout))
        UC5a((Execute Layout <br>Algorithm))

        UC6((Undo / Redo))
        UC6a((State <br>Management))

        %% -------- OUTPUT --------
        UC7((Export <br>Diagram))
        UC7a((Format as <br>PNG/SVG/JSON))

        %% -------- STORAGE --------
        UC8((Save <br>Workspace))
        UC8a((Store Data))

        UC9((Load<br> Workspace))
        UC9a((Retrieve Data))

        %% -------- RELATIONSHIPS --------
        UC1 -.->|<<include>>| UC1a
        UC2 -.->|<<include>>| UC2a
        UC3 -.->|<<include>>| UC3a

        UC4 -.->|<<include>>| UC4a
        UC4 -.->|<<include>>| UC4b

        UC5 -.->|<<include>>| UC5a
        UC6 -.->|<<include>>| UC6a
        UC7 -.->|<<include>>| UC7a

        UC8 -.->|<<include>>| UC8a
        UC9 -.->|<<include>>| UC9a
    end

    %% External Systems
    Gemini[Gemini AI Service]
    DB[(Relational Database)]

    %% Actor Connections
    User --- UC0
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6
    User --- UC7
    User --- UC8
    User --- UC9

    %% External Interactions
    UC1a --- Gemini
    UC2a --- Gemini
    UC3a --- Gemini
    UC8a --- DB
    UC9a --- DB
```
