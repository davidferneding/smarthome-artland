from fastapi import FastAPI , HTTPException
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
import uuid

devicelist={}

class Device:
    def __init__(self, id, name, type):
        self.id = id
        self.name = name
        self.type = type
        
class DeviceType(Enum):
    lampe = "lampe"
    clickbot = "clickbot"
    andere = "andere"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-device")
def adddevice(name, type: DeviceType):
    id = str(uuid.uuid4())
    device = Device(id, name, type)
    devicelist.setdefault(id,device)
    return {
        "id": id,
        "name": name,
        "type": type
    }

@app.get("/get-devices")
def getdevices():
    return {"devices": [device.__dict__ for device in devicelist.values()]}