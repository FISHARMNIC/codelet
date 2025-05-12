#include "wasm.h"

char buffer[10];
char hello[] = "Hello!";

int main()
{
__wasm_break__(7);

    js_memview(MODE_MAP);
__wasm_break__(8);


    int i = 0;
__wasm_break__(10);

    
    js_addview(i, 1, AS_WORDS);
__wasm_break__(12);

    js_addview(buffer, 10, AS_BYTES);
__wasm_break__(13);

    js_addview(hello, 6, AS_CHARS);
__wasm_break__(14);

    
    for(; i < 10; i++)
    {
__wasm_break__(17);

        buffer[i] = i + 1;
__wasm_break__(18);

    }
    return 0;
__wasm_break__(20);

}