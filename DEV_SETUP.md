# Windows Environment Setup #

### Prerequisites ###
- Foundation prerequisites as per the BCTW-API project.

## Install dependencies ##

### Ubuntu 18.04 LTS distribution for WSL2 ###

1. Download and install the Ubuntu 18.04 LTS Linux distribution for WSL2:
``` 
  https://aka.ms/wsl-ubuntu-1804
```

2. Double-click on the downloaded `.appx` file to install the component.

1. Create a new default user for the Ubuntu environment.

### build-essential, Python, curl, and Node.js ###

4. Update the package list in Ubuntu:

```
  sudo apt-get update
```

5. Download and install **build-essential**.

```
  sudo apt-get install build-essential -y
```

6. Download and install **python**:
```
  sudo apt-get install python -y
```

7. Download and install **curl**:
```
  sudo apt-get install curl -y
```

8. Install the **Node Version Manager (NVM)**:
```
  curl -o - https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

9. Close the Command Prompt.

## Specify your IDIR for local dev environment ##

10. create a new `.env.local` file in the ***bctw-ui/react*** directory with the following line:
```
  REACT_APP_IDIR=<your_idir>
```

## Start the UI server ##

11. Open a Command Prompt.

1. Connect to the Ubuntu WSL2 distribution:
```
  wsl -d Ubuntu-18.04
```

13. Switch to the **bctw-ui/** directory using Linux parlance, where `/mnt/c` represents your `C:` drive:
```
  cd /mnt/c/Src/bctw-ui/
```

14. ***(One time)*** Install the required Node.js modules & dependencies:
```
  npm install
```

15. Use npm to start an instance of UI server:
```
  npm run dev
```
The server is ready when you see the message "<something>".

16. Open your browser and navigate to `http://localhost:1111`.
