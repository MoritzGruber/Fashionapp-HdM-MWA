FROM ubuntu:latest
MAINTAINER moritzgruber@yahoo.de

RUN apt-get update
RUN apt-get install -y nodejs nodejs-legacy npm
RUN apt-get clean

RUN npm install cordova@6.2.0 -g
RUN npm install ionic@1.7.16 -g
RUN npm install bower@1.7.9 -g
RUN cd src
COPY . /src

WORKDIR src/

CMD ["sh", "setupscript.sh"]

