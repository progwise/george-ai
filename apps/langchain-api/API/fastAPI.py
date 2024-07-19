from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.faiss import FAISS
from langchain.chains import create_retrieval_chain

from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import MessagesPlaceholder
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain_community.document_loaders import PyPDFLoader, UnstructuredWordDocumentLoader, UnstructuredExcelLoader

load_dotenv()

app = FastAPI()

data_directory = './docs/'
data_directory = os.path.dirname(data_directory)

class ChatRequest(BaseModel):
    question: str
    chat_history: List[str]

def get_documents(data_directory):
    if not os.path.isdir(data_directory):
        raise ValueError("Provided path is not a directory.")
    
    documents = []
    for filename in os.listdir(data_directory):
        file_path = os.path.join(data_directory, filename)
        if os.path.isfile(file_path):
            file_extension = filename.split('.')[-1].lower()
            loader_map = {
                'txt': None,  # Assuming there's a default loader for text files
                'pdf': PyPDFLoader,
                'docx': UnstructuredWordDocumentLoader,
                'xlsx': UnstructuredExcelLoader,
            }
            loader_class = loader_map.get(file_extension)
            if loader_class:
                loader = loader_class(file_path)
                docs = loader.load()
                documents.extend(docs)
            else:
                print(f"No loader available for '{file_extension}' files. Skipping {filename}.")
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=20
    )
    split_docs = splitter.split_documents(documents)
    return split_docs

def create_db(docs):
    embedding = OpenAIEmbeddings()
    vectorStore = FAISS.from_documents(docs, embedding=embedding)
    return vectorStore

def create_chain(vectorStore):
    model = ChatOpenAI(
        model="gpt-3.5-turbo-1106",
        temperature=0.4
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the user's questions based on the context: {context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])

    chain = create_stuff_documents_chain(
        llm=model,
        prompt=prompt
    )

    retriever = vectorStore.as_retriever(search_kwargs={"k": 3})

    retriever_prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        ("human", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation")
    ])

    history_aware_retriever = create_history_aware_retriever(
        llm=model,
        retriever=retriever,
        prompt=retriever_prompt
    )

    retrieval_chain = create_retrieval_chain(
        history_aware_retriever,
        chain
    )

    return retrieval_chain

docs = get_documents(data_directory)
vectorStore = create_db(docs)
chain = create_chain(vectorStore)

@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    chat_history = [HumanMessage(content=message) if i % 2 == 0 else AIMessage(content=message) 
                    for i, message in enumerate(request.chat_history)]
    response = process_chat(chain, request.question, chat_history)
    chat_history.append(HumanMessage(content=request.question))
    chat_history.append(AIMessage(content=response))
    return {"answer": response, "chat_history": [msg.content for msg in chat_history]}

def process_chat(chain, question, chat_history):
    response = chain.invoke({
        "input": question,
        "chat_history": chat_history
    })
    return response["answer"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
