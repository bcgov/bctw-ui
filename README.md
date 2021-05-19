![Lifecycle: Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)

# BC Telemetry Warehouse: UI

Front-end (scientist-facing) interface for the BC Telemetry Warehouse. 

### Setup
1. Install dependencies
``` 
  cd react && npm i
```
1. Run the build command to copy required setup files
```
  npm run build
```
1. create a `.env.local` file in the _react_ directory, adding the follwing environment variable
```
  REACT_APP_IDIR=your_idir
```
1. run the dev server
```
  npm run dev
```
1. open a browser and navigate to `http://localhost:1111`