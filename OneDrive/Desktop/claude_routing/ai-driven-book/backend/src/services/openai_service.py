import logging
import openai
import os
from typing import List, Dict, Optional, Any, Tuple
from config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    """Service for OpenAI API operations"""

    def __init__(self):
        """Initialize OpenAI client"""
        try:
            openai.api_key = settings.OPENAI_API_KEY
            self.model = settings.OPENAI_MODEL
            self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
            self.temperature = settings.OPENAI_TEMPERATURE
            self.max_tokens = settings.OPENAI_MAX_TOKENS
            logger.info("OpenAI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI service: {e}")
            raise

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for a list of texts"""
        try:
            response = openai.embeddings.create(
                model=self.embedding_model,
                input=texts
            )

            embeddings = [item.embedding for item in response.data]
            logger.info(f"Generated embeddings for {len(texts)} texts")
            return embeddings

        except Exception as e:
            logger.error(f"Error getting embeddings: {e}")
            raise

    async def get_single_embedding(self, text: str) -> List[float]:
        """Get embedding for a single text"""
        try:
            response = openai.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error getting single embedding: {e}")
            raise

    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, int, float]:
        """Generate response using GPT model with context"""
        try:
            # Build the full prompt with context
            full_prompt = prompt
            if context:
                full_prompt = f"Context: {context}\n\nQuestion: {prompt}\n\nAnswer:"

            # Prepare messages for chat completion
            messages = []

            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })

            # Add the current prompt
            messages.append({
                "role": "user",
                "content": full_prompt
            })

            # Generate response
            response = openai.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

            # Extract response data
            content = response.choices[0].message.content
            total_tokens = response.usage.total_tokens
            confidence = response.choices[0].finish_reason == "stop"

            logger.info(f"Generated response with {total_tokens} tokens")
            return content, total_tokens, confidence

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise

    async def generate_explanation(
        self,
        code_content: str,
        question: str,
        context: Optional[str] = None
    ) -> Tuple[str, int]:
        """Generate code explanation with step-by-step breakdown"""
        try:
            prompt = f"""
            Explain the following code step-by-step:

            Code:
            {code_content}

            Question: {question}

            Provide a detailed explanation that:
            1. Explains what the code does
            2. Breaks down each important step
            3. Relates it to machine learning concepts
            4. Uses simple, educational language

            Context: {context or "No additional context"}
            """

            response = openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=1500
            )

            content = response.choices[0].message.content
            total_tokens = response.usage.total_tokens

            logger.info(f"Generated code explanation with {total_tokens} tokens")
            return content, total_tokens

        except Exception as e:
            logger.error(f"Error generating code explanation: {e}")
            raise

    async def generate_summary(
        self,
        content: str,
        length: str = "medium"
    ) -> Tuple[str, int]:
        """Generate summary of content"""
        try:
            prompt_length = {
                "short": "3-4 sentences",
                "medium": "6-8 sentences",
                "detailed": "10-12 sentences"
            }

            prompt = f"""
            Summarize the following content in {prompt_length.get(length, 'medium')}:

            {content}

            Focus on the key concepts and important details.
            """

            response = openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=800
            )

            content = response.choices[0].message.content
            total_tokens = response.usage.total_tokens

            logger.info(f"Generated summary with {total_tokens} tokens")
            return content, total_tokens

        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise

    async def validate_response(
        self,
        response: str,
        context: str
    ) -> Tuple[bool, float]:
        """Validate response quality and accuracy"""
        try:
            prompt = f"""
            Evaluate the following response for accuracy and completeness based on the provided context:

            Context: {context}

            Response: {response}

            Rate the response on a scale of 0.0 to 1.0 where:
            - 1.0 means highly accurate and complete
            - 0.0 means completely inaccurate or irrelevant

            Provide only the score as a decimal number.
            """

            response_eval = openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=50
            )

            score_text = response_eval.choices[0].message.content.strip()
            try:
                score = float(score_text)
                score = max(0.0, min(1.0, score))  # Clamp between 0 and 1
                return True, score
            except ValueError:
                logger.warning(f"Invalid score format: {score_text}")
                return False, 0.5

        except Exception as e:
            logger.error(f"Error validating response: {e}")
            return False, 0.5

    def get_model_info(self) -> Dict[str, str]:
        """Get information about the configured models"""
        return {
            "chat_model": self.model,
            "embedding_model": self.embedding_model,
            "temperature": str(self.temperature),
            "max_tokens": str(self.max_tokens)
        }

    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible"""
        try:
            # Make a simple API call to test connectivity
            response = openai.models.list()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"OpenAI health check failed: {e}")
            return False