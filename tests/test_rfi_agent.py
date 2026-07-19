import asyncio
import unittest
from unittest.mock import patch

from agents import rfi_agent


class RFIAgentTests(unittest.TestCase):
    @patch("agents.rfi_agent.generate_answer_from_context")
    @patch("agents.rfi_agent.retrieve_relevant_documents")
    def test_answer_question_uses_retrieved_document_context(self, retrieve_mock, generate_mock):
        retrieve_mock.return_value = [
            {
                "text": "The transformer rating is 1000 kVA.",
                "document_id": "spec-01",
                "clause_id": "SEC-1",
                "source_type": "spec",
                "equipment_category": "Transformer",
            }
        ]
        generate_mock.return_value = "The transformer rating is 1000 kVA."

        result = asyncio.run(rfi_agent.answer_question("What is the transformer rating?"))

        self.assertEqual(result["answer"], "The transformer rating is 1000 kVA.")
        self.assertEqual(result["citations"], ["spec-01"])
        self.assertEqual(result["confidence"], "high")


if __name__ == "__main__":
    unittest.main()
