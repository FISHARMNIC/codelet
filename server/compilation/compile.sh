#!/bin/bash

D=$(dirname "$0")

# I was so happy when I learned you dont have to deal with emscripten... 
# Cool optimization was calling puts in when I didnt specify any formatters in printf! Crazy smart
clang --target=wasm32 -g -O0 -o $D/output.wasm $D/libs/jsIO.c $D/input.c -nostdlib -Wl,--export-all,--allow-undefined,--no-entry