FROM node:12

WORKDIR /usr/src/conf

# installing cmake
RUN wget https://github.com/Kitware/CMake/releases/download/v3.19.0/cmake-3.19.0.tar.gz \
    && tar -xzf cmake-3.19.0.tar.gz \
    && cd cmake-3.19.0 \
    && ./configure \
    && make \
    && make install \
    && cd ..

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python get-pip.py \
    && pip install PySide2 \
    && pip install PyOpenGL 

RUN wget https://dl.bintray.com/boostorg/release/1.74.0/source/boost_1_74_0.tar.gz \
    && tar -xzf boost_1_74_0.tar.gz \
    && cd boost_1_74_0 \
    && apt-get update \
    && apt-get install -y build-essential g++ python-dev autotools-dev libicu-dev libbz2-dev libboost-all-dev \
    && ./bootstrap.sh --prefix=/usr/ \
    && ./b2 \
    && ./b2 install \
    && cd ..

RUN apt-get install -y libglew-dev

RUN git clone https://github.com/PixarAnimationStudios/USD \
    && python USD/build_scripts/build_usd.py /usr/local/USD

RUN pip install Pillow \
    && apt-get install -y nasm

WORKDIR /usr/src/conf

RUN wget https://github.com/google/usd_from_gltf/archive/master.zip \
    && unzip master.zip \
    && python ./usd_from_gltf-master/tools/ufginstall/ufginstall.py /usr/local/UFG /usr/local/USD --testdata

ENV PATH "$PATH:/usr/local/USD/lib/python:/usr/local/USD/bin:/usr/local/UFG:/usr/local/UFG/bin"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# EXPOSE 8080

CMD [ "node", "server/index.js" ]