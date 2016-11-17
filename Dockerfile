FROM mhart/alpine-node:6.9.1

RUN apk add -qU openssh git

# Create known_hosts
RUN mkdir -p /root/.ssh && \
    touch /root/.ssh/known_hosts

# Add github key
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

ADD package.json /tmp/package.json

RUN cd /tmp && npm install

RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

ADD . /usr/src/app

EXPOSE 8888

CMD ["npm", "start"]
