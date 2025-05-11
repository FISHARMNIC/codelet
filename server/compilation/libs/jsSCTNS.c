#include <emscripten.h>

__attribute__((section(".data"))) int __WASM_DATA_BEGIN__;
__attribute__((section(".bss")))  int __WASM_BSS_BEGIN__;
__attribute__((section(".rodata"))) int __WASM_RODATA_BEGIN__;

int main();

extern void __give_section_info__(int* a, int* b, int* c);
extern void __program_finished__();

EMSCRIPTEN_KEEPALIVE void start()
{
    __give_section_info__(&__WASM_DATA_BEGIN__, &__WASM_BSS_BEGIN__, &__WASM_RODATA_BEGIN__);
    main();
    __program_finished__();
}