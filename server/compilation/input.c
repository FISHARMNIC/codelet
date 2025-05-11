#include "wasm.h"

char buffer[10];

int main()
{
__wasm_break__(6);

    for(int i = 0; i < 10; i++)
    {
__wasm_break__(8);

        buffer[i] = i + 1;
__wasm_break__(9);

    }
    return 0;
__wasm_break__(11);

}