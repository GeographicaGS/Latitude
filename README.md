# Latitude
Angular 5 components - npm package

## Develop
Develop your components inside "src" folder

### Build
This comand will compile the package, generate the bundles etc and place them in the "dist" folder
```sh
npm run build
```
Congratulations! Your library is available in dist folder ready to be published to npm.

### Publish
```sh
cd /dist
npm publish
```

## Usage
### Install the package
```sh
npm install @geographica/latitude
```

### Assets
Merge latitude assets folder with your projects assets, modify your angular-cli.json file like bellow
```json
"assets": [
  { "glob": "**/*", "input": "../node_modules/@geographica/latitude/assets/", "output": "./assets/" },
]
```
