import asyncio
import os
from dotenv import load_dotenv

# Add agents to path
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.rfi_agent import answer_question

load_dotenv()

async def test():
    print('=== TESTING RFI AGENT ===')
    print()
    
    question = 'Can we substitute the specified 500kVA UPS with a 450kVA unit due to vendor lead time?'
    print(f'Question: {question}')
    print()
    
    result = await answer_question(question)
    
    print('Result:')
    print(f'  linked_flag: {result.get("linked_flag")}')
    print(f'  clause_id: {result.get("clause_id")}')
    print(f'  confidence: {result.get("confidence")}')
    print(f'  answer (first 200 chars): {result.get("answer", "")[:200]}')
    print()
    print('Full result:')
    for k, v in result.items():
        print(f'  {k}: {v}')

if __name__ == '__main__':
    asyncio.run(test())