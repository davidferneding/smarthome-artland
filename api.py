from fastapi import FastAPI, HTTPException
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
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
    def __init__(self, id, name, type, nodeid, status = DeviceStatus.on, brightness = 3,color = "#da1195"):
        self.id = id
        self.name = name
        self.type = type
        self.status = status
        self.brightness = brightness
        self.color = color
        self.nodeid = nodeid
        

middleware = [
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"]
        )
    ]
app = FastAPI(middleware=middleware)

@app.post("/add-device")
def addDevice(name, type: DeviceType, nodeid: int | None = None):
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
def getDevices():
    return {"devices": [device.__dict__ for device in devicelist.values()]}

@app.post("/toggle")
def toggle(id):
    device = devicelist[id]
    lib.toggle(device.nodeid)
    device.status = DeviceStatus.on
    return device

@app.post("/change-color")
def changeColor(id, color):
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
def changeBrightness(id, brightnesslevel):
    device = devicelist[id]
    lib.changeBrightness(device.nodeid, brightnesslevel)
    device.brightness = brightnesslevel
    return device

@app.delete("/delete-device")
def deleteDevice(id):
    if id in devicelist:
        del devicelist[id]
