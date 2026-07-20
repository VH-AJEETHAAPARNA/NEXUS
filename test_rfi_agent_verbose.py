import asyncio
import os
from dotenv import load_dotenv

# Add agents to path
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.rfi_agent import answer_question, retrieve_relevant_documents

load_dotenv()

async def test():
    print('=== TESTING RFI AGENT WITH VERBOSE OUTPUT ===')
    print()
    
    question = 'Can we substitute the specified 500kVA UPS with a 450kVA unit due to vendor lead time?'
    print(f'Question: {question}')
    print()
    
    # First, check what documents are retrieved
    print('Retrieving relevant documents...')
    documents = await retrieve_relevant_documents(question, limit=3)
    print(f'Found {len(documents)} documents:')
    for i, doc in enumerate(documents):
        print(f'  Doc {i+1}:')
        print(f'    document_id: {doc.get("document_id") or doc.get("id")}')
        print(f'    clause_id: {doc.get("clause_id")}')
        print(f'    source_type: {doc.get("source_type")}')
        print(f'    equipment_category: {doc.get("equipment_category")}')
        print()
    
    # Now get the full answer
    print('Getting answer...')
    result = await answer_question(question)
    
    print()
    print('Result:')
    print(f'  linked_flag: {result.get("linked_flag")}')
    print(f'  clause_id: {result.get("clause_id")}')
    print(f'  confidence: {result.get("confidence")}')
    print()

if __name__ == '__main__':
    asyncio.run(test())