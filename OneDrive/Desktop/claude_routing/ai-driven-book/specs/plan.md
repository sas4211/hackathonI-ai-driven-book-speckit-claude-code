# Architecture Plan for AI-Driven Book

## Key Decisions
1. **Content Framework**
 - *Decision:* Use Docusaurus for documentation
 
 2. **RAG Implementation**
  - *Decision:* OpenAI + Qdrant architecture
  
  ## Interfaces
  ### Chatbot API Contract
  
  ```json
  { "endpoint": "/api/chat",
  "method": "POST"
  }
  ```
