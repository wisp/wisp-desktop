import os
import shutil
import subprocess
import sys
import argparse

parser = argparse.ArgumentParser(description='Build the WISP Desktop app.')
parser.add_argument('--no-react', action='store_true', help='Do not build the react app')
parser.add_argument('--no-python', action='store_true', help='Do not build the python app')
parser.add_argument('--usb', action='store_true', help='Copy the dist folder to a USB drive')
args = parser.parse_args()

def runCommand(command):
    return_value = os.system(command)
    if return_value != 0:
        raise Exception("Command failed: " + command)

starting_dir = os.getcwd()

try: 
    # Create a copy of the dist folder if it exists
    print(">> Creating a copy of the dist folder")
    if os.path.exists('dist'):
        if os.path.exists('.dist_backup'):
            shutil.rmtree('.dist_backup')
        shutil.copytree('dist', '.dist_backup')

    # Reset the dist folder
    print(">> Clearing the dist folder")
    if os.path.exists("dist"):
        shutil.rmtree("dist")

    if not args.no_react:
        # Build the react UI to its build folder
        print(">> Building the react app")
        os.chdir("react")
        runCommand("npm run build")
        os.chdir("..")

        # Moving the react build folder into the python directory
        print(">> Moving react app into the python directory")
        if os.path.exists("python/web"):
            shutil.rmtree("python/web")
        shutil.move("react/build/", "python/web/")

    if not args.no_python:
        # Build the python app to the dist folder using PyInstaller
        print("Building the python app with PyInstaller")
        os.chdir("python")
        os.system("python -m eel main.py web --paths ./sllurp --windowed --onefile --name WISP_Desktop --icon ../react/public/logo.ico")
        os.chdir("..")

        # Moving the built app into the dist folder
        print(">> Moving the built app into the dist folder")
        shutil.copytree("python/dist", "./")

    if args.usb:
        # Copy the dist folder to a USB drive
        # Check if the USB drive is connected
        if os.path.exists("D:/"):
            print(">> Copying the dist folder to the USB drive")
            if os.path.exists("D:/WISP_Desktop"):
                shutil.rmtree("D:/WISP_Desktop")
            shutil.copytree("dist", "D:/WISP_Desktop")
        else:
            print(">> USB drive not found")

    # Deleting the backup of the dist folder
    if os.path.exists('.dist_backup'):
        shutil.rmtree('.dist_backup')

except Exception as e:
    print("Error: " + str(e))
    
    # Restore the dist folder if it exists
    os.chdir(starting_dir)
    if os.path.exists('.dist_backup'):
        print(">> Restoring the dist folder")
        if os.path.exists('dist'):
            shutil.rmtree('dist')
        shutil.copytree('.dist_backup', 'dist')
        shutil.rmtree('.dist_backup')