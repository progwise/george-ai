from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders.csv_loader import CSVLoader

load_dotenv()



# loader = CSVLoader(file_path="./docs/LeiKaLeistung.csv")

# documents = loader.load()
# text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
# docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

# print('before from documents')
# docsearch = Typesense.from_documents(
#     docs[1:101],
#     embeddings,
#     typesense_client_params={
#         "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
#         "port": "8108",  # Use 443 for Typesense Cloud
#         "protocol": "http",  # Use https for Typesense Cloud
#         "typesense_api_key": "xyz",
#         "typesense_collection_name": "lang-chain",
#         # "typesense_collection_name": "scraped_web_pages_summaries",
#     },
# )
# print('after from documents')


docsearch = Typesense.from_client_params(
    embeddings,
    host="localhost",
    port="8108",
    protocol="http",
    typesense_collection_name="lang-chain",
    typesense_api_key="xyz"
)

retriever = docsearch.as_retriever()

query = "Welche Leika-Leistungen haben etwas mit Pferden zu tun?"
# query = "Wo steht dieses Krankenhaus?"
result = retriever.invoke(query)

print(result[:5])