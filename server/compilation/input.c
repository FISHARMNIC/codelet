#include "wasm.h"

char buffer[10];
char hello[] = "Hello!";

int main()
{
__wasm_break__(7);

    // Display individual slices, as opposed to the default MODE_DUMP
    js_memview(MODE_MAP);
__wasm_break__(9);


    int i = 0;
__wasm_break__(11);

    
    // Show different variables by using js_addview(name, size, type)
    // AS_SHORTS is also supported
    js_addview(i, 1, AS_WORDS);
__wasm_break__(15);

    js_addview(buffer, 10, AS_BYTES);
__wasm_break__(16);

    js_addview(hello, 6, AS_CHARS);
__wasm_break__(17);

    
    // Click the play button to run, the use the step button to advance lines
    // Changes in memory will be highlighted in orange on the right!
    for(; i < 10; i++)
    {
__wasm_break__(22);

        buffer[i] = i + 1;
__wasm_break__(23);

    }
    return 0;
__wasm_break__(25);

}

/*
#include "wasm.h"

typedef struct
{
	int a;
    int b;
} mystruct_t;

int main()
{
    // Display individual slices, as opposed to the default MODE_DUMP
    js_memview(MODE_MAP);

    mystruct_t s;
    
    js_addview(s.a, 1, AS_WORDS);
    js_addview(s.b, 1, AS_WORDS);

    return 0;
}
*/
