import os
import shutil
import subprocess

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

    # Build the python app to the dist folder using PyInstaller
    print("Building the python app with PyInstaller")
    os.chdir("python")
    os.system("python3 -m eel main.py web --paths ./sllurp --windowed --onefile --name WISP_Desktop --icon ../react/public/logo.ico")
    os.chdir("..")

    # Moving the built app into the dist folder
    print(">> Moving the built app into the dist folder")
    shutil.move("python/dist", "./")

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