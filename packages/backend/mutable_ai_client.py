from typing import List
import requests
from pydantic import BaseModel
import os

URL = "https://api.mutableai.com/AUTOCOMPLETE"
try:
    X_API_KEY = os.environ["MUTABLEAI_API_KEY"]
except KeyError:
    import sys
    print("please set MUTABLEAI_API_KEY in the .env file -- ask teammates for key", file=sys.stderr)
    raise

class RelevantFile(BaseModel):
    path: str
    content: str

class MutableAIReqBody(BaseModel):
    prompt: str
    suffix: str = ""
    filename: str
    requestType: str = "Manual"
    relevantfiles: List[RelevantFile]

class MutableAIReqResponse(BaseModel):
    completion: str
    finish_reason: str

def send_request(body: MutableAIReqBody) -> MutableAIReqResponse:
    json_response = requests.post(URL, json=body.json(), headers={"X-Api-Key": X_API_KEY}).json()
    return MutableAIReqResponse.parse_raw(json_response)


