from fastapi import FastAPI , HTTPException

from fastapi.middleware.cors import CORSMiddleware
import uuid

devicelist={}

class Device:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-device")
def adddevice(name):
    id = str(uuid.uuid4())
    device = Device(id,name)
    devicelist.setdefault(id,device)
    return id





 





