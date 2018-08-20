# quic-visualization

> A tool to analyze the QUIC protocol  (Developed as part of my Bachelor In Computer Science degree at the university of Hasselt)

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

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
