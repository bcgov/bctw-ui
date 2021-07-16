# Windows Environment Setup #

### Prerequisites ###
- Windows 10 Pro or Enterprise

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

## Install & Build required Node.js modules for UI server ##

8. Open a Command Prompt.

1. Connect to the Ubuntu 20.04 LTS distribution:
```
  wsl -d Ubuntu-20.04
```

10. Switch to the **{project_root}/bctw-ui/react/** directory using Linux parlance, where `/mnt/c` represents your `C:` drive:
```
  cd /mnt/c/Src/bctw-ui/react/
```

11. ***(One time)*** Install the required Node.js modules:
```
  npm i
```

12. ***(One time)*** Build the required Node.js modules:
```
  npm run build
```

## Start the UI server ##

13. Start the UI server:
```
  npm run start
```
The server is starting up when you see the message:
> Starting the deployment server...

14. When the UI server is ready, your default browser will automatically open.
* Otherwise, manually navigate to `http://localhost:1111`.
