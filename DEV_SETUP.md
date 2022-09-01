# Windows Environment Setup

### Prerequisites

- Windows 10 Pro or Enterprise

### Outcomes

- Ubuntu 20.04 LTS virtual Linux environment will be installed.
- Your C: drive will be mounted as `/mnt/c/` within the virtual environment.
- Node.js, Python, and build tools will be installed within the vrirtual environment (will not affect your Windows installation).
- UI server will run from within the virtual environment, pulling files from `/mnt/c/<source_folder>/bctw-ui/`.
- One click clean-up: to destroy entire setup, simply uninstall the "Ubuntu 20.04 LTS" app from Windows Settings.

## Specify your IDIR for local dev environment (one time)

1. Using a text editor (e.g. Notepad) create a new `.env.local` file in the **_bctw-ui/react_** directory with the following line:

```
  REACT_APP_IDIR=<your_idir>
  REACT_APP_DOMAIN=idir
```

## Install dependencies (one time)

### Ubuntu 20.04 LTS Linux distribution for WSL2

2. Download and install the Ubuntu 20.04 LTS Linux distribution for WSL2:

```
  https://aka.ms/wslubuntu2004
```

3. Double-click on the downloaded `.appx` file to install the component.

4. Create a new default user for the Ubuntu environment.

### build-essential, Python, curl, and Node.js

5. Update the package list in Ubuntu:

```
  sudo apt-get update
```

6. Download and install **build-essential**, **python**, **node**, and **npm**:

```
  sudo apt-get install build-essential python nodejs npm -y
```

## Install & Build required Node.js modules for UI server (one time)

7. Switch to the **{source_folder}/bctw-ui/react/** directory, where `/mnt/c` represents your `C:` drive:

```
  cd /mnt/c/src/bctw-ui/react/
```

8. Install the required Node.js modules:

```
  npm i
```

9. Build the required Node.js modules:

```
  npm run build
```

## Start the UI server

10. If a Linux shell is not already running, click on the Start Menu and run "Ubuntu 24.04 LTS".

11. Switch to the **{source_folder}/bctw-ui/react/** directory:

```
  cd /mnt/c/src/bctw-ui/react/
```

12. Start the UI server:

```
  npm run start
```

The server is starting up when you see the message:

> Starting the deployment server...

13. When the UI server is ready, your default browser will automatically open.

- Otherwise, manually navigate to `http://localhost:1111`.
