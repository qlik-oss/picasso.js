#!/bin/bash
cd "$(dirname "$0")"
cd .. && npm i && npm run bootstrap && npm run build && npm run build:dev
cd ./docs && npm i && npm run docs && cd ..
cd ./website && npm i && npm run build
