#ifndef WASM_H
#define WASM_H

#include "inc/jsDBG.h"
#include "inc/jsIO.h"

#include <emscripten.h>

extern void __wasm_break__(int arg);
extern void __js_addview__(const char* name, void* addr, int bytes, int mode);
extern void js_memview(int type);
extern void js_break(int line);

#define MODE_DUMP 0
#define MODE_MAP 1

enum {
    AS_BYTES = 1,
    AS_SHORTS,
    AS_WORDS,
    AS_CHARS
};

#define js_addview(variable, size, disp) __js_addview__(#variable, &variable, size, disp)

#endif