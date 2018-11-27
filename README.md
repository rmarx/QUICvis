# QUICvis

> A set of tools to analyze the IETF QUIC protocol.

## Build Setup

``` bash
# install dependencies for API server to load files
cd ./apiserver
npm install
cd ../

# install dependencies for the website
cd ./visualisation-tool
npm install
npm install typescript
```

## Run website

``` bash
# First open a terminal for the API server and run
cd ./apiserver
npm run start

# Then open a second terminal for the website and run
cd ./visualisation-tool
npm run serve
```

___

Originally developed by Jonas Reynders as part of his Bachelor's thesis at Hasselt University (see https://github.com/moonfalir/quic-visualization)
