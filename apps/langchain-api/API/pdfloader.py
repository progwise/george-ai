from langchain_community.document_loaders import PyPDFLoader


DATA_PATH = './docs/Dienstreiseabrechnung.pdf'

loader = PyPDFLoader(DATA_PATH)

pages = loader.load_and_split()

print(pages[0].page_content)

print("*******************************************")



print(pages[1].page_content)


print("Done!")