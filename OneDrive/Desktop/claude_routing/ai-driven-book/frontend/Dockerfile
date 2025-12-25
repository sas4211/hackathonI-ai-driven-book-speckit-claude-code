FROM node:20-alpine

WORKDIR /app

# Install Docusaurus globally (optional)
RUN npm install -g @docusaurus/core

# Copy package files
COPY ai-ml-book/package*.json ./ai-ml-book/

# Install dependencies
WORKDIR /app/ai-ml-book
RUN npm install

# Copy source code
COPY ai-ml-book/ .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]