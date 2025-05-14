echo "Meant for render.com server. Does not add emcc to path"

D=$(pwd)

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

cd $D