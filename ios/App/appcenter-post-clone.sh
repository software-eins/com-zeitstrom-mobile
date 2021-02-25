#!/usr/bin/env bash

mkdir ../../node_modules
npm i --prefix ../../
npm run build
npx cap sync

