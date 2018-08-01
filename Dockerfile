FROM node:8

RUN apt-get update &&\
    apt-get install -y xvfb \
         libotf-dev \
         x11-xkb-utils \
         xfonts-scalable \
         x11-apps \
         clang \
         libdbus-1-dev \
         libgtk2.0-dev \
         libnotify-dev \
         libgnome-keyring-dev \
         libgconf2-dev \
         libasound2-dev \
         libcap-dev \
         libcups2-dev \
         libxtst-dev \
         libxss1 \
         libnss3-dev \
         gcc-multilib \
         g++-multilib

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Set a working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 9645

##CMD [ "npm", "start" ]
CMD Xvfb -ac -screen scrn 1280x2000x24 :9.0 & export DISPLAY=:9.0 &&\
    alias ll='ls -als' &&\
    npm start
