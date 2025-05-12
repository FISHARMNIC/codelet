#!/bin/bash

D=$(dirname "$0")

# Cool optimization was calling puts in when I didnt specify any formatters in printf! Crazy smart
# clang --target=wasm32 -g -O0 -o $D/output.wasm $D/libs/jsIO.c $D/input.c -nostdlib -Wl,--export-all,--allow-undefined,--no-entry

emcc --no-entry -O0 -o $D/output.wasm $D/libs/jsSCTNS.c $D/libs/jsIO.c $D/input.c \
-s STANDALONE_WASM \
-s WARN_ON_UNDEFINED_SYMBOLS=0 \
-s ASYNCIFY \
-s ASYNCIFY_IMPORTS="['env.__wasm_break__', 'env.js_break', 'env.js_break_explicit']" \
-s EXPORT_ALL=1
# -s EXPORTED_FUNCTIONS="['_main', '_start']"
