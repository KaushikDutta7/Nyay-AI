import requests
import os
from dotenv import load_dotenv

load_dotenv()


class IndianKanoonClient:
    def __init__(self):
        self.api_key = os.getenv("INDIANKANOON_API_KEY")
        self.base_url = "https://api.indiankanoon.org"
        self.headers = {
            "Authorization": f"Token {self.api_key}"
        }

    def search(self, query, pagenum=0):
        url = f"{self.base_url}/search/"
        params = {
            "formInput": query,
            "pagenum": pagenum
        }
        response = requests.post(url, headers=self.headers, data=params)
        return response.json()

    def get_document(self, docid):
        url = f"{self.base_url}/doc/{docid}/"
        response = requests.post(url, headers=self.headers)
        return response.json()
