#ifndef WASM_H
#define WASM_H

#include "inc/jsDBG.h"
#include "inc/jsIO.h"

#include <emscripten.h>

__attribute__((import_module("env")))
__attribute__((import_name("__wasm_break__")))

extern void __wasm_break__(int arg);
#endif