from fastapi import FastAPI , HTTPException
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
import lib
import random

devicelist={}
deviceStatus: bool = True

class DeviceType(Enum):
    lampe = "lampe"
    clickbot = "klickbot"
    andere = "andere"




class Device:
    def __init__(self, id, name, type, status = deviceStatus, brightness = 100,color = "#da1195"):
        self.id = id
        self.name = name
        self.type = type
        self.status = status
        self.brightness = brightness
        self.color = color
        

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-device")
def adddevice(name, type: DeviceType, node_id: int | None = None):
    if not node_id:
        id = int(random.randint(1,4000))
    else:
        id = node_id
    print("adding device", id)
    devicename = name + str(id)
    device = Device(id, devicename, type)
    devicelist.setdefault(id,device)
    return device

@app.get("/get-devices")
def getdevices():
    print("getting devices")
    return {"devices": [device.__dict__ for device in devicelist.values()]}

@app.post("/change-status")
def changeStatus(id):
    device = devicelist[id]
    print("toggle on/off", id)
    lib.toggle(id)
    device.status = not device.status
    return device

@app.post("/change-color")
def changeColor(id,color):
    device = devicelist[id]
    print("change color ", id)
    lib.changeColor(id,color)
    device.color = color
    return device

@app.post("/change-name")
def changeName(id, targetname):
    device = devicelist[id]
    device.name = targetname
    print("changed name of device with ",id," to ",targetname)
    return device

@app.post("/change-brightness")
def changeBrightness(id, higherbrightness):
    device = devicelist[id]
    print("changeing brightness", id)
    lib.changeBrightness(id,higherbrightness)
    return device

@app.delete("/delete-device")
def deleteDevice(id: int):
    print("deleting the device", id)
    if devicelist[id]:
       del devicelist[id]
       return "deleted device"
    else:
        return "device not found"