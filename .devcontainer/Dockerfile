FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    git \
    sudo \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript esbuild

USER node

WORKDIR /workspace
