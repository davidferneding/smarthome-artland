import os
import re

brightnessLevels = [1, 70, 150, 254]


def pairLight(id: int):
    os.system(f'chip-tool pairing ble-wifi {id} AMC_Mitarbeiter 837fh37#Zu47+ 33374968 2661 --paa-trust-store-path ~/connectedhomeip/credentials/production/paa-root-certs/')
              

def pairPlug(id: int):
    os.system(f'chip-tool pairing ble-wifi {id} AMC_Mitarbeiter 837fh37#Zu47+ 40527157 200 --paa-trust-store-path ~/connectedhomeip/credentials/production/paa-root-certs/')


def toggle(id: int):
    os.system(f'chip-tool onoff toggle {id} 1')


def changeBrightness(id: int, level: int):
    os.system(f'chip-tool levelcontrol move-to-level {brightnessLevels[level]} 0 0 0 {id} 1')


def changeColor(id: int, hex: str):
    match = re.search(r'^#(?:[0-9a-fA-F]{3}){1,2}$', hex)
    if match:
        color_hex = hex
        color_rgb = tuple(
            int(color_hex.strip("#")[i:i + 2], 16) for i in (0, 2, 4))

        r, g, b = color_rgb[0] / 255.0, color_rgb[1] / \
            255.0, color_rgb[2] / 255.0

        max_rgb = max(r, g, b)
        min_rgb = min(r, g, b)
        difference = max_rgb - min_rgb

        if max_rgb == min_rgb:
            h = 0
        elif max_rgb == r:
            h = (60 * ((g - b) / difference) + 360) % 360
        elif max_rgb == g:
            h = (60 * ((b - r) / difference) + 120) % 360
        elif max_rgb == b:
            h = (60 * ((r - g) / difference) + 240) % 360

        if max_rgb == 0:
            s = 0
        else:
            s = (difference / max_rgb) * 100

        hs = tuple((h, s))

        hue = round(hs[0] / 360 * 254)
        saturation = round(hs[1] / 100 * 254)
        os.system(f'chip-tool colorcontrol move-to-hue-and-saturation {hue} {saturation} 0 0 0 {id} 1')
