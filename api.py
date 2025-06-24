from fastapi import FastAPI , HTTPException
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
import uuid
import lib
import random

devicelist={}

class DeviceType(Enum):
    light = "light"
    plug = "plug"

class DeviceStatus(Enum):
    on = "on"
    off = "off"
    offline = "offline"


class Device:
    def __init__(self, id, name, type, nodeid, status = DeviceStatus.on, brightness = 100,color = "#da1195"):
        self.id = id
        self.name = name
        self.type = type
        self.status = status
        self.brightness = brightness
        self.color = color
        self.nodeid = nodeid
        

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-device")
def adddevice(name, type: DeviceType, nodeid: int | None = None):
    if nodeid is None:
        nodeid = random.randint(1, 4000)
        if type == DeviceType.light:
            lib.pairLamp(nodeid)
        elif type == DeviceType.plug:
            lib.pairPlug(nodeid)
        else:
            raise HTTPException(status_code=400, detail="DeviceType not supported") 
    id = str(uuid.uuid4())
    device = Device(id, name, type, nodeid)
    devicelist.setdefault(id, device)
    return device

@app.get("/get-devices")
def getdevices():
    return {"devices": [device.__dict__ for device in devicelist.values()]}

@app.post("/change-status")
def changeStatus(id, targetstatus: DeviceStatus):
    device = devicelist[id]
    lib.toggle(device.nodeid)
    device.status = targetstatus
    return device

@app.post("/change-color")
def changeColor(id,color):
    device = devicelist[id]
    print("change color ", id)
    lib.changeColor(device.nodeid, color)
    device.color = color
    return device

@app.post("/change-name")
def changeName(id, targetname):
    device = devicelist[id]
    device.name = targetname
    return device

@app.post("/change-brightness")
def changeBrightness(id, targetbrightness):
    device = devicelist[id]
    lib.changeBrightness(device.nodeid, targetbrightness > 100)
    device.brightness = targetbrightness
    return device

@app.delete("/delete-device")
def deleteDevice(id):
    if id in devicelist:
        del devicelist[id]
