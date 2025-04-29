from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-device")
def adddevice():
    id = uuid.uuid4()
    return str(id)

