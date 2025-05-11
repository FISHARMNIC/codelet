#include "wasm.h"

char* p = "Apples\n";

int main()
{
__wasm_break__(6);

    *p = 'M';
__wasm_break__(7);

    *(p+1) = 'a';
__wasm_break__(8);

    console_string(p);
__wasm_break__(9);

    return 0;
__wasm_break__(10);

}