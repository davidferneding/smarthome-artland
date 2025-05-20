from fastapi import FastAPI , HTTPException
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
import uuid

devicelist={}

class DeviceType(Enum):
    lampe = "lampe"
    clickbot = "clickbot"
    andere = "andere"

class DeviceStatus(Enum):
    on = "on"
    off = "off"
    offline = "offline"


class Device:
    def __init__(self, id, name, type, status = DeviceStatus.on, brightness = 100):
        self.id = id
        self.name = name
        self.type = type
        self.status = status
        self.brightness = brightness 
        

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
    return device

@app.get("/get-devices")
def getdevices():
    return {"devices": [device.__dict__ for device in devicelist.values()]}

@app.post("/change-status")
def changeStatus(id, targetstatus: DeviceStatus):
    device = devicelist[id]
    device.status = targetstatus
    return device

@app.post("/change-name")
def changeName(id, targetname):
    device = devicelist[id]
    device.name = targetname
    return device

@app.post("/change-brightness")
def changeBrightness(id, targetbrightness):
    device = devicelist[id]
    device.brightness = targetbrightness
    return device

@app.delete("/delete-device")
def deleteDevice(id):
    if id in devicelist:
        del devicelist[id]