FROM node:12

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

WORKDIR $HOME

# Copy the package files only

# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./

# install dependencies
RUN npm install

ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

# copy the rest of the files
COPY . ./

VOLUME ${HOME}

CMD ["npm", "run", "reload"]
