### Running the UI
1. Install dependencies
``` 
  cd react
  npm i
```
1. copy a required setup file
```
  copy .\node_modules\reflect-metadata\Reflect.js .\public\
```
1. create a `.env.local` file in the react directory, adding the follwing environment variable
```
  REACT_APP_IDIR=your_idir_goes_here
```
1. run the dev server, it should automatically open a browser
```
  npm run start_windows
```
1. Check your terminal shell that is running the API for errors