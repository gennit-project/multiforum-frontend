#!/bin/sh

git checkout master
docker build -f Dockerfile.dev -t cluse/gennit-vue .
docker push cluse/gennit-vue:latest