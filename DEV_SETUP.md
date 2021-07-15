# Windows Environment Setup #

### Prerequisites ###
- Foundational prerequisites as per the BCTW-API project.

## Install dependencies ##

### Ubuntu 20.04 LTS Linux distribution for WSL2 ###

1. Download and install the Ubuntu 20.04 LTS Linux distribution for WSL2:
``` 
  https://aka.ms/wslubuntu2004
```

2. Double-click on the downloaded `.appx` file to install the component.

1. Create a new default user for the Ubuntu environment.

### build-essential, Python, curl, and Node.js ###

4. Update the package list in Ubuntu:

```
  sudo apt-get update
```

5. Download and install **build-essential**, **python**, **node**, and **npm**:

```
  sudo apt-get install build-essential python nodejs npm -y
```

6. Close the Command Prompt.

## Specify your IDIR for local dev environment ##

7. create a new `.env.local` file in the ***bctw-ui/react*** directory with the following line:
```
  REACT_APP_IDIR=<your_idir>
```

## Start the UI server ##

8. Open a Command Prompt.

1. Connect to the Ubuntu 20.04 LTS distribution:
```
  wsl -d Ubuntu-20.04
```

10. Switch to the **bctw-ui/** directory using Linux parlance, where `/mnt/c` represents your `C:` drive:
```
  cd /mnt/c/Src/bctw-ui/
```

11. ***(One time)*** Install the required Node.js modules & dependencies:
```
  npm i
```

12. Use npm to start an instance of UI server:
```
  npm run build
```
The server is ready when you see the message "<something>".

13. Open your browser and navigate to `http://localhost:1111`.
