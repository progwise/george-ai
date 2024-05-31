from flask import Flask, request, jsonify
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
import os

data_directory = './docs/'

# Extract the directory part
data_directory = os.path.dirname(data_directory)

def get_documents(data_directory):
    if not os.path.isdir(data_directory):
        raise ValueError("Provided path is not a directory.")
    
    documents = []
    for filename in os.listdir(data_directory):
        # Skip hidden files and temporary lock files
        if filename.startswith('.') or filename.endswith('#'):
            print(f"Skipping hidden or temporary file: {filename}")
            continue
        
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

    # chain = prompt | model
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
        # retriever,
        history_aware_retriever,
        chain
    )

    return retrieval_chain

def process_chat(chain, question, chat_history):
    response = chain.invoke({
        "input": question,
        "chat_history": chat_history
    })
    return response["answer"]

def convert_chat_history(chat_history):
    converted_chat_history = []
    for message in chat_history:
        if message["sender"] == "human":
            converted_chat_history.append(HumanMessage(content=message["msg"]))
        elif message["sender"] == "ai":
            converted_chat_history.append(AIMessage(content=message["msg"]))
    return converted_chat_history

app = Flask(__name__)

docs = get_documents(data_directory)
vectorStore = create_db(docs)
chain = create_chain(vectorStore)
chat_history = []

@app.route('/ask', methods=['GET'])

def ask_question():
    data = request.get_json()
    user_input = data.get('question')
    chat_history = data.get('chat_history', [])
    
    chat_history = convert_chat_history(chat_history)

    response = process_chat(chain, user_input, chat_history)

    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=response))
    
    message_dicts = [
    {
        "msg": message.content, 
        "sender": 'human' if type(message).__name__ == 'HumanMessage' else 'ai'
    } 
    for message in chat_history
]
    
    return jsonify({"response": response, "chat_history": message_dicts} )
    
if __name__ == '__main__':
    app.run(debug=True)
