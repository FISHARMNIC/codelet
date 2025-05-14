#ifndef WASM_H
#define WASM_H

#include "inc/jsDBG.h"
#include "inc/jsIO.h"

#include <emscripten.h>

extern void __wasm_break__(int arg);
extern void __js_addview__(const char* name, void* addr, int bytes, int mode);
extern void __js_addview_struct(const char* name, void* addr, const char* infostr);
extern void __js_removeview__(const char* name, void* addr);
extern void __js_removeview_weak__(const char* name);
extern void js_memview(int type);
extern void js_break();
extern void js_break_explicit(int line);
extern void js_removeview_all();

#define MODE_DUMP 0
#define MODE_MAP 1
#define js_addview(variable, size, disp) __js_addview__(#variable, &variable, size, disp)
#define js_addview_group(...) __js_begingroup__(); __VA_ARGS__; __js_endgroup__();
#define js_removeview(variable) __js_removeview__(#variable, &variable)
#define js_removeview_weak(variable)  __js_removeview_weak__(#variable)

enum {
    AS_BYTES = 1,
    AS_SHORTS,
    AS_WORDS,
    AS_CHARS
};

// #define __JS_STRUCT_GETINFO(__s) __##__s##_info__
// #define JS_STRUCT(__s, ...) typedef struct __s {__VA_ARGS__} __s##_t; const char* __JS_STRUCT_GETINFO(__s) = #__VA_ARGS__;
// #define js_addview_struct(instance, datatype) __js_addview_struct(#instance, &instance, __JS_STRUCT_GETINFO(datatype))


#endif