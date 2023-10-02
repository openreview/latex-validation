FROM ubuntu:20.04

RUN apt-get update

## Avoids interactive installation
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata

## NodeJS installation
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg]\
 https://deb.nodesource.com/node_18.x nodistro main"\
 | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update
RUN apt-get install nodejs -y

RUN node --version

RUN mkdir -p /home/latex-validation

WORKDIR /home/latex-validation

## Tectonic installation
RUN apt-get install -y libfontconfig1-dev libgraphite2-dev libharfbuzz-dev libicu-dev libssl1.1 zlib1g-dev

RUN apt-get install -y openssl
RUN openssl version

RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net |sh

RUN mv ./tectonic /usr/local/bin

RUN tectonic --version


COPY . /home/latex-validation


RUN cd /home/latex-validation \
    && npm install \
    && npm run build



RUN node dist/main.js validate --latex-packages resources/latex-packages.txt --fragment 'Init $\textbf{latex packages}$'

EXPOSE 9100

CMD ["node", "dist/main.js", "run-server", "--latex-packages", "resources/latex-packages.txt"]
